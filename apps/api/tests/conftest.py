import os
from typing import AsyncIterator

# Test settings must be in place before app modules read them.
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-with-at-least-32-bytes!!")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite://")
os.environ.setdefault("RATE_LIMIT_REGISTER", "100/60")
os.environ.setdefault("RATE_LIMIT_LOGIN", "100/60")
os.environ.setdefault("RATE_LIMIT_FORGOT_PASSWORD", "100/60")

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.db.session as db_session
from app.core.rate_limit import MemoryStorage
from app.db.base import Base
from app.main import app
from app.services.emailer import ConsoleEmailer


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    db_session._engine = engine
    db_session._session_factory = async_sessionmaker(engine, expire_on_commit=False)
    app.state.rate_limit_storage = MemoryStorage()
    ConsoleEmailer.outbox.clear()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    await engine.dispose()


REGISTER_PAYLOAD = {
    "email": "dilnoza@example.uz",
    "password": "kuchli-parol-123",
    "display_name": "Dilnoza",
    "ui_locale": "uz",
}


async def register_user(client: AsyncClient, **overrides) -> dict:
    payload = {**REGISTER_PAYLOAD, **overrides}
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def extract_token_from_outbox(purpose_hint: str) -> str:
    """Pull the last emailed link's token for a given flow."""
    for message in reversed(ConsoleEmailer.outbox):
        if purpose_hint in message["body"]:
            return message["body"].split("token=")[1].strip()
    raise AssertionError("No email with hint {!r} in outbox".format(purpose_hint))
