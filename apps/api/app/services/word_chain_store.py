"""CAS persistence for word-chain rooms, isolated under ``wc:room:*`` keys."""

import json
import time
from typing import Dict, Optional, Protocol

from app.services.word_chain import WordChainRoom


class WordChainRoomStore(Protocol):
    async def load(self, code: str) -> Optional[WordChainRoom]: ...
    async def save(self, room: WordChainRoom, *, expected_version: Optional[int]) -> bool: ...
    async def create(self, room: WordChainRoom) -> bool: ...
    async def delete(self, code: str, *, expected_version: Optional[int] = None) -> bool: ...


class MemoryWordChainRoomStore:
    def __init__(self) -> None:
        self._rooms: Dict[str, WordChainRoom] = {}

    async def load(self, code: str) -> Optional[WordChainRoom]:
        return self._rooms.get(code)

    async def save(self, room: WordChainRoom, *, expected_version: Optional[int]) -> bool:
        del expected_version
        self._rooms[room.code] = room
        return True

    async def create(self, room: WordChainRoom) -> bool:
        if room.code in self._rooms:
            return False
        self._rooms[room.code] = room
        return True

    async def delete(self, code: str, *, expected_version: Optional[int] = None) -> bool:
        del expected_version
        return self._rooms.pop(code, None) is not None


class RedisWordChainRoomStore:
    def __init__(self, redis_url: str, ttl_seconds: int) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)
        self._ttl_seconds = ttl_seconds

    @staticmethod
    def _key(code: str) -> str:
        return "wc:room:" + code

    async def load(self, code: str) -> Optional[WordChainRoom]:
        raw = await self._redis.get(self._key(code))
        if raw is None:
            return None
        envelope = json.loads(raw)
        room = WordChainRoom.from_state(envelope["state"], clock=time.time)
        room._store_version = envelope["version"]  # type: ignore[attr-defined]
        return room

    async def save(self, room: WordChainRoom, *, expected_version: Optional[int]) -> bool:
        key = self._key(room.code)
        async with self._redis.pipeline(transaction=True) as pipe:
            await pipe.watch(key)
            raw = await pipe.get(key)
            current_version = json.loads(raw)["version"] if raw is not None else None
            if current_version != expected_version:
                await pipe.reset()
                return False
            next_version = (current_version or 0) + 1
            pipe.multi()
            pipe.set(
                key,
                json.dumps({"version": next_version, "state": room.to_state()}),
                ex=self._ttl_seconds,
            )
            try:
                await pipe.execute()
            except Exception:
                return False
        room._store_version = next_version  # type: ignore[attr-defined]
        return True

    async def create(self, room: WordChainRoom) -> bool:
        envelope = json.dumps({"version": 1, "state": room.to_state()})
        created = await self._redis.set(
            self._key(room.code), envelope, ex=self._ttl_seconds, nx=True
        )
        if created:
            room._store_version = 1  # type: ignore[attr-defined]
        return bool(created)

    async def delete(self, code: str, *, expected_version: Optional[int] = None) -> bool:
        """Delete only the version the caller actually inspected.

        A lobby can be joined between a stale connection deciding it is empty
        and its cleanup write. The same WATCH transaction used for saves
        prevents that cleanup from erasing the newly joined room.
        """

        key = self._key(code)
        if expected_version is None:
            # Retain the store's maintenance/teardown convenience API. Game
            # mutations always pass a version and therefore use the safe path
            # below.
            return bool(await self._redis.delete(key))
        async with self._redis.pipeline(transaction=True) as pipe:
            await pipe.watch(key)
            raw = await pipe.get(key)
            current_version = json.loads(raw)["version"] if raw is not None else None
            if current_version != expected_version:
                await pipe.reset()
                return False
            pipe.multi()
            pipe.delete(key)
            try:
                await pipe.execute()
            except Exception:
                return False
        return raw is not None


def word_chain_room_version(room: WordChainRoom) -> Optional[int]:
    return getattr(room, "_store_version", None)
