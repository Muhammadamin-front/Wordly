import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.cache import MemoryCache, RedisCache
from app.core.config import get_settings
from app.core.observability import capture_exception, init_sentry
from app.core.rate_limit import MemoryStorage, RedisStorage, client_ip
from app.db.session import get_session_factory, init_engine
from app.services.multiplayer_pubsub import MemoryPubSub, RedisPubSub
from app.services.multiplayer_store import MemoryRoomStore, RedisRoomStore
from app.services.multiplayer_timers import MemoryPhaseLock, RedisPhaseLock
from app.services.word_chain_matchmaking import (
    MemoryWordChainMatchmaker,
    RedisWordChainMatchmaker,
)
from app.services.word_chain_store import MemoryWordChainRoomStore, RedisWordChainRoomStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("words.api")

STARTED_AT = time.time()

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    settings.validate_runtime()
    init_engine()
    if settings.REDIS_URL:
        app.state.rate_limit_storage = RedisStorage(settings.REDIS_URL)
        app.state.cache = RedisCache(settings.REDIS_URL) if settings.CACHE_ENABLED else None
        app.state.mp_store = RedisRoomStore(
            settings.REDIS_URL, ttl_seconds=settings.MULTIPLAYER_ROOM_TTL_SECONDS
        )
        app.state.mp_pubsub = RedisPubSub(settings.REDIS_URL)
        app.state.mp_lock = RedisPhaseLock(settings.REDIS_URL)
        app.state.word_chain_store = RedisWordChainRoomStore(
            settings.REDIS_URL, ttl_seconds=settings.MULTIPLAYER_ROOM_TTL_SECONDS
        )
        app.state.word_chain_matchmaker = RedisWordChainMatchmaker(
            settings.REDIS_URL, ttl_seconds=settings.MULTIPLAYER_ROOM_TTL_SECONDS
        )
        app.state.backend = "redis"
    else:
        app.state.rate_limit_storage = MemoryStorage()
        app.state.cache = MemoryCache() if settings.CACHE_ENABLED else None
        app.state.mp_store = MemoryRoomStore()
        app.state.mp_pubsub = MemoryPubSub()
        app.state.mp_lock = MemoryPhaseLock()
        app.state.word_chain_store = MemoryWordChainRoomStore()
        app.state.word_chain_matchmaker = MemoryWordChainMatchmaker()
        app.state.backend = "memory"
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    is_prod = settings.ENVIRONMENT == "production"
    init_sentry(settings)
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
        docs_url="/docs" if not is_prod else None,
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        # Credentialed CORS must never use wildcards. Keep this list aligned
        # with the browser client instead of granting every future method or
        # request header to every configured origin.
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Idempotency-Key",
            "X-Client",
            "X-Request-ID",
        ],
        expose_headers=["X-Request-ID"],
        max_age=600,
    )

    @app.middleware("http")
    async def observability(request: Request, call_next):
        """Assign a request ID, time the request, and set security headers.

        A single pass so every response — including errors — carries the ID and
        headers, and slow requests are surfaced in the logs.
        """
        request_id = request.headers.get("x-request-id") or uuid.uuid4().hex[:16]
        request.state.request_id = request_id

        # Cheap body-size guard from the declared Content-Length (full streaming
        # enforcement belongs at the reverse proxy; this stops obvious abuse).
        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > settings.MAX_REQUEST_BYTES:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"detail": "Request body too large"},
                headers={"X-Request-ID": request_id},
            )

        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception as exc:  # noqa: BLE001 — last-resort handler, logged with context
            elapsed_ms = (time.perf_counter() - start) * 1000
            capture_exception(
                logger,
                "request_failed",
                exc,
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                elapsed_ms=round(elapsed_ms, 1),
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error"},
                headers={"X-Request-ID": request_id},
            )

        elapsed_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-ms"] = "{:.1f}".format(elapsed_ms)
        response.headers["Server-Timing"] = "app;dur={:.1f}".format(elapsed_ms)
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        if is_prod:
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age={}; includeSubDomains".format(settings.HSTS_MAX_AGE),
            )

        log = logger.warning if elapsed_ms > settings.SLOW_REQUEST_MS else logger.info
        log(
            "request id=%s %s %s -> %s in %.1fms",
            request_id, request.method, request.url.path, response.status_code, elapsed_ms,
        )
        return response

    @app.get("/health", tags=["ops"])
    async def health():
        """Liveness — cheap, no dependencies."""
        return {"status": "ok"}

    @app.get("/health/detail", tags=["ops"])
    async def health_detail():
        """Readiness — verifies the database and reports build/runtime info."""
        db_ok = True
        try:
            async with get_session_factory()() as db:
                await db.execute(text("SELECT 1"))
        except Exception:  # noqa: BLE001 — health check must not raise
            db_ok = False
        backend = getattr(app.state, "backend", "memory")
        ready = db_ok and (not is_prod or backend == "redis")
        payload = {
            "status": "ok" if ready else "degraded",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "uptime_seconds": int(time.time() - STARTED_AT),
            "database": "ok" if db_ok else "error",
            "backend": backend,
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK if ready else status.HTTP_503_SERVICE_UNAVAILABLE,
            content=payload,
        )

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    return app


app = create_app()
