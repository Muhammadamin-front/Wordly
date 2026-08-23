"""Room persistence — an in-memory dict for dev/single-process, Redis for
production. Mirrors the cache/rate-limit storage design (app/core/cache.py,
app/core/rate_limit.py): a Protocol with two interchangeable backends, chosen
once in the app lifespan.

Room itself has no I/O (see multiplayer.py) — this module is purely about
getting its `to_state()`/`from_state()` dict in and out of storage. Redis
holds one JSON string per room, versioned for optimistic concurrency: every
save compares the version it loaded against what's currently stored, and
fails (asking the caller to reload and retry) if another worker's request
raced ahead of it. A 4-char room code has too little entropy to trust as a
long-lived secret path, so the TTL is short enough that an abandoned room
doesn't linger, but long enough that a real game (with its own inter-question
pauses) never gets reaped mid-play.
"""
import json
import time
from typing import Dict, Optional, Protocol

from app.services.multiplayer import Room

DEFAULT_ROOM_TTL_SECONDS = 2 * 60 * 60  # matches Settings.MULTIPLAYER_ROOM_TTL_SECONDS' default


class RoomStore(Protocol):
    async def load(self, code: str) -> Optional[Room]: ...
    async def save(self, room: Room, *, expected_version: Optional[int]) -> bool:
        """Persist `room`. Returns False on a CAS conflict (another worker
        saved this room since `expected_version` was loaded) — the caller
        should reload and retry rather than clobber that write."""
        ...
    async def create(self, room: Room) -> bool:
        """Persist a brand-new room. Returns False if `room.code` is already
        taken (the caller should mint a fresh code and retry) — a 4-char
        code has a real chance of colliding, so this must be checked, not
        assumed."""
        ...
    async def delete(self, code: str) -> None: ...


class MemoryRoomStore:
    """Process-local store. Fine for dev/test and a single API process —
    there is no cross-worker race to guard against, so `save` never fails."""

    def __init__(self) -> None:
        self._rooms: Dict[str, Room] = {}

    async def load(self, code: str) -> Optional[Room]:
        return self._rooms.get(code)

    async def save(self, room: Room, *, expected_version: Optional[int]) -> bool:
        self._rooms[room.code] = room
        return True

    async def create(self, room: Room) -> bool:
        if room.code in self._rooms:
            return False
        self._rooms[room.code] = room
        return True

    async def delete(self, code: str) -> None:
        self._rooms.pop(code, None)


class RedisRoomStore:
    """Shared store across API processes — the production backend. Each room
    is one JSON string, `{"version": int, "state": <Room.to_state()>}`,
    written under a WATCH/MULTI/EXEC transaction so a concurrent save from
    another worker is detected rather than silently overwritten."""

    def __init__(self, redis_url: str, ttl_seconds: int = DEFAULT_ROOM_TTL_SECONDS) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)
        self._ttl_seconds = ttl_seconds

    @staticmethod
    def _key(code: str) -> str:
        return "mp:room:{}".format(code)

    async def load(self, code: str) -> Optional[Room]:
        raw = await self._redis.get(self._key(code))
        if raw is None:
            return None
        envelope = json.loads(raw)
        room = Room.from_state(envelope["state"], clock=time.time)
        room._store_version = envelope["version"]  # type: ignore[attr-defined]
        return room

    async def save(self, room: Room, *, expected_version: Optional[int]) -> bool:
        key = self._key(room.code)
        async with self._redis.pipeline(transaction=True) as pipe:
            await pipe.watch(key)
            raw = await pipe.get(key)
            current_version = json.loads(raw)["version"] if raw is not None else None
            if current_version != expected_version:
                await pipe.reset()
                return False
            next_version = (current_version or 0) + 1
            envelope = json.dumps({"version": next_version, "state": room.to_state()})
            pipe.multi()
            pipe.set(key, envelope, ex=self._ttl_seconds)
            try:
                await pipe.execute()
            except Exception:  # watch error = another writer raced us — retry upstream
                return False
        room._store_version = next_version  # type: ignore[attr-defined]
        return True

    async def create(self, room: Room) -> bool:
        envelope = json.dumps({"version": 1, "state": room.to_state()})
        created = await self._redis.set(
            self._key(room.code), envelope, ex=self._ttl_seconds, nx=True
        )
        if created:
            room._store_version = 1  # type: ignore[attr-defined]
        return bool(created)

    async def delete(self, code: str) -> None:
        await self._redis.delete(self._key(code))


def room_version(room: Room) -> Optional[int]:
    """The version a room was loaded/created/saved at, for the next
    `save(room, expected_version=...)` call. `MemoryRoomStore` never sets
    this — callers should treat a missing attribute as "no CAS needed"."""
    return getattr(room, "_store_version", None)
