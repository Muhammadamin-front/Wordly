import os
from typing import AsyncIterator

# Test settings must be in place before app modules read them.
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-with-at-least-32-bytes!!")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite://")
os.environ.setdefault("RATE_LIMIT_REGISTER", "100/60")
os.environ.setdefault("RATE_LIMIT_LOGIN", "100/60")
os.environ.setdefault("RATE_LIMIT_FORGOT_PASSWORD", "100/60")
os.environ.setdefault("RATE_LIMIT_RESEND_VERIFICATION", "100/60")
# Env vars beat the .env file, so real local keys never leak into tests.
os.environ["ELEVENLABS_API_KEY"] = ""
os.environ["GEMINI_API_KEY"] = ""
os.environ["SERPER_API_KEY"] = ""
os.environ["BEDROCK_API_KEY"] = ""
os.environ["EMAIL_PROVIDER"] = "console"
os.environ["RESEND_API_KEY"] = ""
os.environ["EMAIL_FROM"] = ""
os.environ["EMAIL_REPLY_TO"] = ""
os.environ["PAYME_MERCHANT_ID"] = ""
os.environ["PAYME_MERCHANT_KEY"] = ""
os.environ["CLICK_SERVICE_ID"] = ""
os.environ["CLICK_MERCHANT_ID"] = ""
os.environ["CLICK_SECRET_KEY"] = ""
os.environ["PAYMENTS_SANDBOX"] = "true"
os.environ["SENTRY_DSN"] = ""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.db.session as db_session
from app.core.rate_limit import MemoryStorage
from app.db.base import Base
from app.main import app
from app.services.emailer import ConsoleEmailer


# Tests default to in-memory SQLite. Point TEST_DATABASE_URL at Postgres
# (e.g. postgresql+asyncpg://words:words@localhost:5433/words_test) to run the
# same suite against the production engine — CI does this in a second job.
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", "sqlite+aiosqlite://")


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    if TEST_DATABASE_URL.startswith("sqlite"):
        engine = create_async_engine(
            TEST_DATABASE_URL, poolclass=StaticPool, connect_args={"check_same_thread": False}
        )
    else:
        engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        # On a shared server database, drop_all gives each test a clean slate
        # (a no-op for the throwaway in-memory SQLite engine).
        await conn.run_sync(Base.metadata.drop_all)
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
