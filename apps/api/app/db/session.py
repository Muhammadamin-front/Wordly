from typing import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

_engine: AsyncEngine = None  # type: ignore[assignment]
_session_factory: async_sessionmaker = None  # type: ignore[assignment]


def init_engine(database_url: str = "") -> AsyncEngine:
    global _engine, _session_factory
    settings = get_settings()
    url = database_url or settings.DATABASE_URL
    # Every uvicorn worker builds its own pool, so the ceiling on Postgres
    # connections is workers x (pool_size + max_overflow). Keep that product
    # under the server's max_connections when raising UVICORN_WORKERS.
    kwargs = {"pool_pre_ping": True}
    if url.startswith("postgresql"):
        kwargs["pool_size"] = settings.DB_POOL_SIZE
        kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    _engine = create_async_engine(url, **kwargs)
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


def get_engine() -> AsyncEngine:
    if _engine is None:
        init_engine()
    return _engine


def get_session_factory() -> async_sessionmaker:
    if _session_factory is None:
        init_engine()
    return _session_factory


async def get_db() -> AsyncIterator[AsyncSession]:
    async with get_session_factory()() as session:
        yield session
