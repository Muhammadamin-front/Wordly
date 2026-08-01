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


MAX_FORWARDED_FOR_LENGTH = 2048
MAX_FORWARDED_FOR_HOPS = 20


def client_ip(connection: HTTPConnection) -> str:
    """Resolve the client without trusting headers from arbitrary peers."""
    peer = connection.client.host if connection.client else "unknown"
    try:
        peer_address = ip_address(peer)
    except ValueError:
        return peer

    trusted_networks = get_settings().trusted_proxy_networks
    if not any(peer_address in network for network in trusted_networks):
        return str(peer_address)

    forwarded = connection.headers.get("x-forwarded-for", "")
    if not forwarded or len(forwarded) > MAX_FORWARDED_FOR_LENGTH:
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
