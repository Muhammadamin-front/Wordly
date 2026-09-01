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
import asyncio
import json
import logging
from typing import Any, Callable, Dict, Protocol

Handler = Callable[[Dict[str, Any]], "Any"]  # async callable(message) -> None

logger = logging.getLogger(__name__)


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
    """One `redis.asyncio` pub/sub connection and one reader task per process.

    A Redis ``PubSub`` connection is a single stream. Starting ``listen()``
    once per room creates competing consumers: a message can be consumed by
    the wrong loop and silently dropped. The one reader below dispatches each
    message to the handlers registered for its channel instead.
    """

    def __init__(self, redis_url: str) -> None:
        import redis.asyncio as aioredis

        self._redis = aioredis.from_url(redis_url, decode_responses=True)
        self._pubsub = self._redis.pubsub()
        self._handlers: Dict[str, list] = {}
        self._reader: Any = None  # one asyncio.Task for the PubSub stream
        self._subscription_lock = asyncio.Lock()

    @staticmethod
    def _channel(code: str) -> str:
        return "mp:chan:{}".format(code)

    async def publish(self, code: str, message: Dict[str, Any]) -> None:
        await self._redis.publish(self._channel(code), json.dumps(message))

    async def subscribe(self, code: str, handler: Handler) -> None:
        channel = self._channel(code)
        async with self._subscription_lock:
            handlers = self._handlers.setdefault(channel, [])
            needs_subscription = not handlers
            handlers.append(handler)

            if needs_subscription:
                try:
                    await self._pubsub.subscribe(channel)
                except Exception:
                    handlers.remove(handler)
                    if not handlers:
                        self._handlers.pop(channel, None)
                    raise

            if self._reader is None or self._reader.done():
                self._reader = asyncio.create_task(self._read_loop())

    async def unsubscribe(self, code: str, handler: Handler) -> None:
        channel = self._channel(code)
        async with self._subscription_lock:
            handlers = self._handlers.get(channel)
            if handlers and handler in handlers:
                handlers.remove(handler)
            if handlers:
                return

            if handlers is None:
                return

            self._handlers.pop(channel, None)
            await self._pubsub.unsubscribe(channel)

        # Keep the single reader alive for the lifetime of this PubSub
        # connection. Stopping it here risks a new subscription starting a
        # second concurrent ``listen()`` before cancellation has completed.

    async def _read_loop(self) -> None:
        try:
            async for raw in self._pubsub.listen():
                if raw.get("type") != "message":
                    continue

                channel = raw.get("channel")
                try:
                    message = json.loads(raw["data"])
                except (KeyError, TypeError, ValueError):
                    continue

                # Take a copy so a socket disconnecting during delivery does
                # not mutate the collection we are iterating over.
                for handler in list(self._handlers.get(channel, [])):
                    try:
                        await handler(message)
                    except asyncio.CancelledError:
                        raise
                    except Exception:
                        # A single stale WebSocket must not stop delivery to
                        # every other room on this worker.
                        logger.exception("Multiplayer pub/sub handler failed for %s", channel)
        except asyncio.CancelledError:
            pass
        except Exception:
            # Leave a later subscribe able to start a fresh reader. The
            # connection's reconnection policy remains owned by redis-py.
            logger.exception("Multiplayer pub/sub reader stopped unexpectedly")
        finally:
            current_task = asyncio.current_task()
            if self._reader is current_task:
                self._reader = None
