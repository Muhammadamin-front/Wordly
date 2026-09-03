import logging
import time
from ipaddress import ip_address
from typing import Dict, List, Optional, Protocol, Tuple

from fastapi import HTTPException, Request, status
from starlette.requests import HTTPConnection

from app.core.config import get_settings


class RateLimitStorage(Protocol):
    async def hit(self, key: str, limit: int, window_seconds: int) -> Tuple[bool, int]:
        """Record a hit. Returns (allowed, retry_after_seconds)."""
        ...


class MemoryStorage:
    """Sliding-window limiter for dev/test and single-process fallback."""

    def __init__(self) -> None:
        self._hits: Dict[str, List[float]] = {}

    async def hit(self, key: str, limit: int, window_seconds: int) -> Tuple[bool, int]:
        now = time.monotonic()
        window_start = now - window_seconds
        bucket = [t for t in self._hits.get(key, []) if t > window_start]
        if len(bucket) >= limit:
            retry_after = int(bucket[0] - window_start) + 1
            self._hits[key] = bucket
            return False, retry_after
        bucket.append(now)
        self._hits[key] = bucket
        return True, 0


class RedisStorage:
    """Fixed-window counter on Redis — cheap and good enough for auth endpoints."""

    def __init__(self, redis_url: str) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)

    async def hit(self, key: str, limit: int, window_seconds: int) -> Tuple[bool, int]:
        bucket_key = "rl:{}:{}".format(key, int(time.time()) // window_seconds)
        pipe = self._redis.pipeline()
        pipe.incr(bucket_key)
        pipe.expire(bucket_key, window_seconds)
        count, _ = await pipe.execute()
        if int(count) > limit:
            ttl = await self._redis.ttl(bucket_key)
            return False, max(int(ttl), 1)
        return True, 0


def parse_rule(rule: str) -> Tuple[int, int]:
    """'10/60' -> (10 requests, 60 seconds)."""
    max_requests, window = rule.split("/")
    return int(max_requests), int(window)


logger = logging.getLogger("words.api")

# One warning per peer address, not one per request.
_warned_untrusted_peers: set = set()

MAX_FORWARDED_FOR_LENGTH = 2048
MAX_FORWARDED_FOR_HOPS = 20


def _warn_once_about_key(
    peer: str, peer_address, connection: HTTPConnection, *, trusted: bool
) -> None:
    """Say, once per peer, when the rate-limit key is not a learner.

    Both failure modes end the same way — every request through the proxy
    shares one bucket, so one person hitting the login limit locks everyone
    out — but they need different fixes, so the log says which one this is.
    A private or loopback peer with nothing forwarded is infrastructure, not
    a client, which is the case that is otherwise completely silent."""
    if peer in _warned_untrusted_peers:
        return
    forwarded = connection.headers.get("x-forwarded-for")
    real_ip = connection.headers.get("cf-connecting-ip")
    if not trusted and not forwarded and not real_ip and peer_address.is_global:
        return  # An ordinary direct client. Nothing to say.

    _warned_untrusted_peers.add(peer)
    if trusted:
        logger.warning(
            "Rate limits are keyed on %s: this peer is trusted but sends no "
            "X-Forwarded-For%s. Configure the proxy to forward the client "
            "address, or every learner shares one bucket.",
            peer,
            " (it does send CF-Connecting-IP)" if real_ip else "",
        )
    else:
        logger.warning(
            "Rate limits are keyed on %s, which is not a learner's address. "
            "Add it to TRUSTED_PROXY_CIDRS (forwarded header %s).",
            peer,
            "present" if forwarded else "absent",
        )


def client_ip(connection: HTTPConnection) -> str:
    """Resolve the client without trusting headers from arbitrary peers."""
    peer = connection.client.host if connection.client else "unknown"
    try:
        peer_address = ip_address(peer)
    except ValueError:
        return peer

    trusted_networks = get_settings().trusted_proxy_networks
    if not any(peer_address in network for network in trusted_networks):
        _warn_once_about_key(peer, peer_address, connection, trusted=False)
        return str(peer_address)

    # Cloudflare Tunnel sets CF-Connecting-IP to the single address the edge
    # saw, and cloudflared overwrites whatever the client sent — so behind a
    # tunnel it is both simpler and harder to spoof than walking the chain.
    # Only read from a trusted peer, same rule as the forwarded chain below.
    connecting_ip = connection.headers.get("cf-connecting-ip", "").strip()
    if connecting_ip:
        try:
            return str(ip_address(connecting_ip))
        except ValueError:
            pass

    forwarded = connection.headers.get("x-forwarded-for", "")
    if not forwarded or len(forwarded) > MAX_FORWARDED_FOR_LENGTH:
        # The peer is trusted but is not telling us who the client is, so the
        # key is still the proxy's address: every learner shares one bucket.
        _warn_once_about_key(peer, peer_address, connection, trusted=True)
        return str(peer_address)

    hops = [value.strip() for value in forwarded.split(",")]
    if not hops or len(hops) > MAX_FORWARDED_FOR_HOPS or any(not hop for hop in hops):
        return str(peer_address)

    try:
        addresses = [ip_address(hop) for hop in hops]
    except ValueError:
        return str(peer_address)

    # A trusted proxy may append to an existing client-supplied chain. Walking
    # from the socket peer inward selects the nearest untrusted address, so a
    # spoofed left-most value cannot become the rate-limit key.
    for address in reversed(addresses):
        if not any(address in network for network in trusted_networks):
            return str(address)
    return str(addresses[0])


async def ws_connect_allowed(
    websocket: HTTPConnection, storage: RateLimitStorage, rule: str
) -> bool:
    """Per-IP throttle on the handshake itself — called right after
    `accept()`, before any auth or per-action check, so a WS-handshake flood
    against `/ws/quiz` or `/coach/sessions/{id}/live` can't consume unlimited
    connection slots just to get rejected downstream."""
    limit, window = parse_rule(rule)
    allowed, _ = await storage.hit("ws_connect:{}".format(client_ip(websocket)), limit, window)
    return allowed


def rate_limit(scope: str, rule: Optional[str] = None):
    """Dependency factory: rate-limits by client IP within a named scope."""

    async def dependency(request: Request) -> None:
        settings = get_settings()
        if not settings.RATE_LIMIT_ENABLED:
            return
        effective_rule = rule or getattr(
            settings, "RATE_LIMIT_{}".format(scope.upper()), settings.RATE_LIMIT_DEFAULT
        )
        limit, window = parse_rule(effective_rule)
        storage: RateLimitStorage = request.app.state.rate_limit_storage
        allowed, retry_after = await storage.hit(
            "{}:{}".format(scope, client_ip(request)), limit, window
        )
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": str(retry_after)},
            )

    return dependency
