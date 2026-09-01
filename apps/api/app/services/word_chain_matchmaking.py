"""FIFO matchmaking queue for public Word Chain games.

The queue only stores room codes. Room membership and every game transition
remain server-authoritative in :mod:`word_chain` and its CAS-backed room
store. Claiming a code removes it atomically, so two people cannot be paired
with the same waiting lobby.
"""

import asyncio
from collections import deque
from typing import Deque, Optional, Protocol


class WordChainMatchmaker(Protocol):
    async def enqueue(self, room_code: str) -> None: ...
    async def claim(self) -> Optional[str]: ...
    async def remove(self, room_code: str) -> None: ...


class MemoryWordChainMatchmaker:
    """Single-process FIFO implementation used in development and tests."""

    def __init__(self) -> None:
        self._queue: Deque[str] = deque()
        self._lock = asyncio.Lock()

    async def enqueue(self, room_code: str) -> None:
        async with self._lock:
            # A reconnect can enqueue the same waiting room again. Keep one
            # claimable slot per room so a later user never consumes a stale
            # duplicate and misses a real opponent behind it.
            self._queue = deque(code for code in self._queue if code != room_code)
            self._queue.append(room_code)

    async def claim(self) -> Optional[str]:
        async with self._lock:
            return self._queue.popleft() if self._queue else None

    async def remove(self, room_code: str) -> None:
        async with self._lock:
            self._queue = deque(code for code in self._queue if code != room_code)


class RedisWordChainMatchmaker:
    """Cross-worker FIFO queue backed by one Redis list.

    ``LPOP`` is Redis-atomic, which gives one caller exclusive ownership of a
    candidate room code. A claimant still rechecks the room via the CAS store
    because a host can leave between the queue claim and the room join.
    """

    def __init__(self, redis_url: str, ttl_seconds: int) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)
        self._ttl_seconds = ttl_seconds

    @staticmethod
    def _key() -> str:
        return "wc:matchmaking:queue"

    async def enqueue(self, room_code: str) -> None:
        key = self._key()
        async with self._redis.pipeline(transaction=True) as pipe:
            pipe.lrem(key, 0, room_code)
            pipe.rpush(key, room_code)
            pipe.expire(key, self._ttl_seconds)
            await pipe.execute()

    async def claim(self) -> Optional[str]:
        return await self._redis.lpop(self._key())

    async def remove(self, room_code: str) -> None:
        await self._redis.lrem(self._key(), 0, room_code)
