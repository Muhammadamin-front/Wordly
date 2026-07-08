import time
from typing import Dict, List, Optional, Protocol, Tuple

from fastapi import HTTPException, Request, status

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


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


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
