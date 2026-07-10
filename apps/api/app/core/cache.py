"""Response cache — an in-memory TTL store for dev/single-process, Redis for
production. Mirrors the rate-limit storage design (app/core/rate_limit.py): a
Protocol with two interchangeable backends, chosen in the app lifespan.

Used to serve hot, user-agnostic public GETs (corpus browse, categories, word
detail) from cache with `Cache-Control` + `ETag`/304 support, so both the CDN
and repeat clients skip the database. Cached data is only ever the *published*
corpus, so there is no per-user leakage. Staleness is bounded by the TTL —
admin edits become visible within one TTL window (documented in M10).
"""
import hashlib
import json
import time
from typing import Awaitable, Callable, Dict, Optional, Protocol, Tuple

from fastapi import Request, Response
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel


class Cache(Protocol):
    async def get(self, key: str) -> Optional[str]: ...
    async def set(self, key: str, value: str, ttl_seconds: int) -> None: ...


class MemoryCache:
    """Process-local TTL cache. Fine for dev/test and a single API process."""

    def __init__(self) -> None:
        self._data: Dict[str, Tuple[float, str]] = {}

    async def get(self, key: str) -> Optional[str]:
        item = self._data.get(key)
        if item is None:
            return None
        expires_at, value = item
        if expires_at < time.monotonic():
            self._data.pop(key, None)
            return None
        return value

    async def set(self, key: str, value: str, ttl_seconds: int) -> None:
        self._data[key] = (time.monotonic() + ttl_seconds, value)


class RedisCache:
    """Shared cache across API processes — the production backend."""

    def __init__(self, redis_url: str) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)

    async def get(self, key: str) -> Optional[str]:
        return await self._redis.get("cache:" + key)

    async def set(self, key: str, value: str, ttl_seconds: int) -> None:
        await self._redis.set("cache:" + key, value, ex=ttl_seconds)


def _serialize(payload: object) -> str:
    if isinstance(payload, BaseModel):
        return payload.model_dump_json()
    return json.dumps(jsonable_encoder(payload), separators=(",", ":"))


def _etag(body: str) -> str:
    return '"' + hashlib.md5(body.encode("utf-8")).hexdigest() + '"'


def get_cache(request: Request) -> Optional[Cache]:
    return getattr(request.app.state, "cache", None)


async def cached_response(
    request: Request,
    key: str,
    ttl_seconds: int,
    producer: Callable[[], Awaitable[object]],
) -> Response:
    """Serve `producer()`'s JSON from cache when possible.

    Adds `Cache-Control`, an `ETag`, and an `X-Cache: HIT|MISS` marker, and
    honours conditional `If-None-Match` requests with a 304. `producer` may
    return a Pydantic model or any JSON-able object.
    """
    cache = get_cache(request)
    body = await cache.get(key) if cache is not None else None
    hit = body is not None
    if body is None:
        body = _serialize(await producer())
        if cache is not None:
            await cache.set(key, body, ttl_seconds)

    etag = _etag(body)
    headers = {
        "Cache-Control": "public, max-age={}".format(ttl_seconds),
        "ETag": etag,
        "X-Cache": "HIT" if hit else "MISS",
    }
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=headers)
    return Response(content=body, media_type="application/json", headers=headers)
