"""Cross-worker broadcast for multiplayer rooms.

`multiplayer.broadcast()` only reaches players whose sockets are attached to
the *current* process. Once rooms can have players spread across API worker
processes (the whole point of moving room state into Redis), a message has to
reach every worker that's holding at least one of that room's live sockets.

Each worker subscribes to a room's channel for as long as it has a local
connection open, and publishing is "compute the message once, PUBLISH it" —
every subscribed worker (including the publisher itself) delivers it to its
own local sockets on receipt, so callers never call `broadcast()` directly
once a room is live; they call `publish()` here instead.

`MemoryPubSub` collapses this to a plain local fan-out for dev/single-process
(mirrors `MemoryRoomStore`/`MemoryCache`) — no network round-trip, and a
`publish()` calls its local handler synchronously.
"""
import json
from typing import Any, Callable, Dict, Protocol

Handler = Callable[[Dict[str, Any]], "Any"]  # async callable(message) -> None


class RoomPubSub(Protocol):
    async def publish(self, code: str, message: Dict[str, Any]) -> None: ...
    async def subscribe(self, code: str, handler: Handler) -> None:
        """Registers `handler` to receive every message published for `code`
        until `unsubscribe` is called. Must not block the caller — the
        implementation owns its own background listening."""
        ...
    async def unsubscribe(self, code: str, handler: Handler) -> None: ...


class MemoryPubSub:
    def __init__(self) -> None:
        self._handlers: Dict[str, list] = {}

    async def publish(self, code: str, message: Dict[str, Any]) -> None:
        for handler in list(self._handlers.get(code, [])):
            await handler(message)

    async def subscribe(self, code: str, handler: Handler) -> None:
        self._handlers.setdefault(code, []).append(handler)

    async def unsubscribe(self, code: str, handler: Handler) -> None:
        handlers = self._handlers.get(code)
        if handlers and handler in handlers:
            handlers.remove(handler)
        if handlers is not None and not handlers:
            self._handlers.pop(code, None)


class RedisPubSub:
    """One `redis.asyncio` pub/sub connection per process, with a background
    reader task per subscribed channel that fans incoming messages out to
    every local handler registered for it."""

    def __init__(self, redis_url: str) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)
        self._pubsub = self._redis.pubsub()
        self._handlers: Dict[str, list] = {}
        self._readers: Dict[str, Any] = {}  # channel -> asyncio.Task

    @staticmethod
    def _channel(code: str) -> str:
        return "mp:chan:{}".format(code)

    async def publish(self, code: str, message: Dict[str, Any]) -> None:
        await self._redis.publish(self._channel(code), json.dumps(message))

    async def subscribe(self, code: str, handler: Handler) -> None:
        import asyncio

        channel = self._channel(code)
        self._handlers.setdefault(channel, []).append(handler)
        if channel in self._readers:
            return  # a reader for this channel is already running

        await self._pubsub.subscribe(channel)

        async def read_loop() -> None:
            try:
                async for raw in self._pubsub.listen():
                    if raw.get("type") != "message" or raw.get("channel") != channel:
                        continue
                    try:
                        message = json.loads(raw["data"])
                    except (TypeError, ValueError):
                        continue
                    for h in list(self._handlers.get(channel, [])):
                        await h(message)
            except asyncio.CancelledError:
                pass

        self._readers[channel] = asyncio.create_task(read_loop())

    async def unsubscribe(self, code: str, handler: Handler) -> None:
        channel = self._channel(code)
        handlers = self._handlers.get(channel)
        if handlers and handler in handlers:
            handlers.remove(handler)
        if handlers:
            return
        self._handlers.pop(channel, None)
        task = self._readers.pop(channel, None)
        if task is not None:
            task.cancel()
        await self._pubsub.unsubscribe(channel)
