"""Server-driven phase auto-advance.

Nothing about countdown->question, a question's timer running out, or
question_result/leaderboard auto-advancing to the next question is triggered
by a client message — the server owns the clock. Whichever API worker
currently has a live connection to a room schedules a local sleep until that
phase's deadline; when it wakes, it takes a short-lived single-flight lock so
that if more than one worker has a socket into the same room, exactly one of
them performs the transition. Everyone else's timer is then a no-op — they
already learn the new state from the pub/sub broadcast the winner sends.

This reuses the same "distributed compare-and-set" idea `multiplayer_store`
already needs, rather than adding a task queue: there's no other scheduled
work in this codebase that would justify one.
"""
import asyncio
import time
from typing import Awaitable, Callable, Protocol

OnFire = Callable[[], Awaitable[None]]


class PhaseLock(Protocol):
    async def acquire(self, key: str, ttl_ms: int) -> bool:
        """True if this call won the lock (no other holder right now)."""
        ...


class MemoryPhaseLock:
    """Single-process: there's only ever one candidate to fire, so it always
    wins. Mirrors MemoryRoomStore/MemoryPubSub's "no coordination needed"
    story for dev/test."""

    async def acquire(self, key: str, ttl_ms: int) -> bool:
        return True


class RedisPhaseLock:
    def __init__(self, redis_url: str) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)

    async def acquire(self, key: str, ttl_ms: int) -> bool:
        return bool(await self._redis.set("mp:lock:" + key, "1", nx=True, px=ttl_ms))


async def schedule_phase_timer(
    lock: PhaseLock, code: str, phase: str, deadline: float, on_fire: OnFire
) -> None:
    """Sleeps until `deadline` (epoch seconds), then — if this worker wins
    the single-flight lock for this exact (room, phase, deadline) — calls
    `on_fire`. Safe to call redundantly from every worker that has a socket
    into the room; only one of them will actually do anything.

    `on_fire` is responsible for reloading the room, confirming the phase and
    deadline it scheduled against are still current (the game may already
    have moved on — e.g. every player answered before the timer fired, or the
    host used `skip`), applying `force_advance()`, saving, and publishing.
    """
    delay = max(0.0, deadline - time.time())
    await asyncio.sleep(delay)
    lock_key = "{}:{}:{}".format(code, phase, deadline)
    if await lock.acquire(lock_key, ttl_ms=5000):
        await on_fire()
