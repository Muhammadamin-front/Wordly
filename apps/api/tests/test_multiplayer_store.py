"""Tests for RoomStore/RoomPubSub/PhaseLock. MemoryRoomStore/MemoryPubSub run
unconditionally; the Redis-backed classes only run when TEST_REDIS_URL is set
(mirrors the project's existing TEST_DATABASE_URL opt-in-real-backend pattern
for anything that needs a live external service in CI)."""
import asyncio
import os
import time
from uuid import uuid4

import pytest

from app.services.multiplayer import Player, Room
from app.services.multiplayer_pubsub import MemoryPubSub, RedisPubSub
from app.services.multiplayer_store import MemoryRoomStore, RedisRoomStore, room_version
from app.services.multiplayer_timers import MemoryPhaseLock, RedisPhaseLock, schedule_phase_timer

TEST_REDIS_URL = os.environ.get("TEST_REDIS_URL")
requires_redis = pytest.mark.skipif(not TEST_REDIS_URL, reason="TEST_REDIS_URL not set")


class FakeRedisPubSub:
    """Small in-process stream used to exercise RedisPubSub's dispatcher."""

    def __init__(self):
        self.messages = asyncio.Queue()
        self.listen_calls = 0
        self.subscribed = []
        self.unsubscribed = []

    async def subscribe(self, channel):
        self.subscribed.append(channel)

    async def unsubscribe(self, channel):
        self.unsubscribed.append(channel)

    async def listen(self):
        self.listen_calls += 1
        while True:
            yield await self.messages.get()


def make_redis_pubsub_for_test(fake_pubsub):
    """Build the transport around a fake stream without a live Redis server."""
    pubsub = object.__new__(RedisPubSub)
    pubsub._redis = None
    pubsub._pubsub = fake_pubsub
    pubsub._handlers = {}
    pubsub._reader = None
    pubsub._subscription_lock = asyncio.Lock()
    return pubsub


def make_room(code: str) -> Room:
    room = Room(code, host_id=uuid4())
    room.add_player(Player(uuid4(), "P"))
    return room


async def test_memory_store_round_trips():
    store = MemoryRoomStore()
    room = make_room("MEM1")
    assert await store.create(room) is True
    assert await store.create(make_room("MEM1")) is False  # code already taken
    loaded = await store.load("MEM1")
    assert loaded is not None and loaded.code == "MEM1"
    assert await store.save(loaded, expected_version=None) is True
    await store.delete("MEM1")
    assert await store.load("MEM1") is None


async def test_memory_pubsub_delivers_to_local_subscribers():
    pubsub = MemoryPubSub()
    received = []

    async def handler(message):
        received.append(message)

    await pubsub.subscribe("ROOM", handler)
    await pubsub.publish("ROOM", {"type": "lobby"})
    assert received == [{"type": "lobby"}]

    await pubsub.unsubscribe("ROOM", handler)
    await pubsub.publish("ROOM", {"type": "ignored"})
    assert received == [{"type": "lobby"}]  # no longer subscribed


async def test_redis_pubsub_uses_one_reader_and_dispatches_by_channel():
    fake_pubsub = FakeRedisPubSub()
    pubsub = make_redis_pubsub_for_test(fake_pubsub)
    room_one = []
    room_two = []

    async def first_handler(message):
        room_one.append(message)

    async def second_handler(message):
        room_two.append(message)

    await asyncio.gather(
        pubsub.subscribe("ONE", first_handler),
        pubsub.subscribe("TWO", second_handler),
    )
    await asyncio.sleep(0)
    assert fake_pubsub.listen_calls == 1

    await fake_pubsub.messages.put(
        {"type": "message", "channel": "mp:chan:ONE", "data": '{"type": "one"}'}
    )
    await fake_pubsub.messages.put(
        {"type": "message", "channel": "mp:chan:TWO", "data": '{"type": "two"}'}
    )
    await asyncio.sleep(0)

    assert room_one == [{"type": "one"}]
    assert room_two == [{"type": "two"}]

    await pubsub.unsubscribe("ONE", first_handler)
    await pubsub.unsubscribe("TWO", second_handler)
    assert fake_pubsub.unsubscribed == ["mp:chan:ONE", "mp:chan:TWO"]

    pubsub._reader.cancel()
    await pubsub._reader


async def test_memory_phase_lock_always_wins():
    lock = MemoryPhaseLock()
    assert await lock.acquire("any-key", ttl_ms=1000) is True
    assert await lock.acquire("any-key", ttl_ms=1000) is True  # single-process: no contention


async def test_schedule_phase_timer_fires_after_deadline():
    lock = MemoryPhaseLock()
    fired = []

    async def on_fire():
        fired.append(True)

    await schedule_phase_timer(lock, "CODE", "question", time.time() + 0.05, on_fire)
    assert fired == [True]


@requires_redis
async def test_redis_store_detects_concurrent_write_conflict():
    store = RedisRoomStore(TEST_REDIS_URL)
    room = make_room("RCAS")
    await store.create(room)

    first = await store.load("RCAS")
    second = await store.load("RCAS")
    assert room_version(first) == room_version(second)

    assert await store.save(first, expected_version=room_version(first)) is True
    # `second` was loaded at the same version but is now stale.
    assert await store.save(second, expected_version=room_version(second)) is False

    await store.delete("RCAS")


@requires_redis
async def test_redis_pubsub_cross_connection_delivery():
    publisher = RedisPubSub(TEST_REDIS_URL)
    subscriber = RedisPubSub(TEST_REDIS_URL)
    received = []

    async def handler(message):
        received.append(message)

    await subscriber.subscribe("RPUB", handler)
    import asyncio

    await asyncio.sleep(0.1)  # let the subscribe reach Redis before publishing
    await publisher.publish("RPUB", {"type": "question", "index": 0})
    await asyncio.sleep(0.2)
    assert received == [{"type": "question", "index": 0}]

    await subscriber.unsubscribe("RPUB", handler)


@requires_redis
async def test_redis_phase_lock_is_single_flight():
    lock_a = RedisPhaseLock(TEST_REDIS_URL)
    lock_b = RedisPhaseLock(TEST_REDIS_URL)
    key = "single-flight-{}".format(uuid4())
    assert await lock_a.acquire(key, ttl_ms=2000) is True
    assert await lock_b.acquire(key, ttl_ms=2000) is False  # a already holds it
