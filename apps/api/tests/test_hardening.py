"""M10 — performance & hardening: cache, rate limits, observability, errors."""
import pytest

from app.core.cache import MemoryCache
from app.core.config import get_settings
from app.core.observability import safe_context
from app.core.rate_limit import MemoryStorage
from app.main import app
from tests.conftest import register_user


# --- Observability ---------------------------------------------------------


async def test_request_id_and_timing_headers(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Request-ID")
    assert float(resp.headers["X-Response-Time-ms"]) >= 0


def test_observability_context_redacts_sensitive_values():
    context = safe_context(
        {"request_id": "trace-123", "path": "/api/v1/auth/login", "email": "learner@example.uz", "token": "secret"}
    )
    assert context == {"request_id": "trace-123", "path": "/api/v1/auth/login"}


async def test_incoming_request_id_is_preserved(client):
    resp = await client.get("/health", headers={"X-Request-ID": "trace-abc-123"})
    assert resp.headers["X-Request-ID"] == "trace-abc-123"


async def test_health_detail_reports_db_and_build(client):
    resp = await client.get("/health/detail")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"
    assert body["version"]
    assert body["environment"] == "test"
    assert "uptime_seconds" in body


async def test_security_headers_present(client):
    resp = await client.get("/health")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"


# --- Cache -----------------------------------------------------------------


async def test_cache_control_and_etag_on_public_reads(client):
    resp = await client.get("/api/v1/categories")
    assert resp.status_code == 200
    assert "max-age" in resp.headers["Cache-Control"]
    assert resp.headers["ETag"]


async def test_conditional_request_returns_304(client):
    first = await client.get("/api/v1/categories")
    etag = first.headers["ETag"]
    second = await client.get("/api/v1/categories", headers={"If-None-Match": etag})
    assert second.status_code == 304


async def test_cache_hit_marker(client):
    app.state.cache = MemoryCache()
    try:
        first = await client.get("/api/v1/categories")
        assert first.headers["X-Cache"] == "MISS"
        second = await client.get("/api/v1/categories")
        assert second.headers["X-Cache"] == "HIT"
        # Body is served identically from cache.
        assert first.json() == second.json()
    finally:
        app.state.cache = None


# --- Rate limiting ---------------------------------------------------------


async def test_memory_storage_sliding_window():
    storage = MemoryStorage()
    for _ in range(3):
        allowed, _ = await storage.hit("k", 3, 60)
        assert allowed
    allowed, retry_after = await storage.hit("k", 3, 60)
    assert not allowed
    assert retry_after >= 1


async def test_router_rate_limit_returns_429(client):
    session = await register_user(client)
    token = session["access_token"]
    settings = get_settings()
    original = settings.RATE_LIMIT_SOCIAL
    settings.RATE_LIMIT_SOCIAL = "2/60"
    app.state.rate_limit_storage = MemoryStorage()
    try:
        headers = {"Authorization": "Bearer {}".format(token)}
        codes = [(await client.get("/api/v1/friends", headers=headers)).status_code for _ in range(3)]
        assert codes[0] == 200 and codes[1] == 200
        assert codes[2] == 429
    finally:
        settings.RATE_LIMIT_SOCIAL = original


# --- Error handling & body limits ------------------------------------------


async def test_oversized_body_rejected(client):
    settings = get_settings()
    original = settings.MAX_REQUEST_BYTES
    settings.MAX_REQUEST_BYTES = 100
    try:
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "x" * 300 + "@example.uz", "password": "secret"},
        )
        assert resp.status_code == 413
        assert resp.headers.get("X-Request-ID")
    finally:
        settings.MAX_REQUEST_BYTES = original


async def test_unhandled_exception_is_masked(client, monkeypatch):
    async def boom(*args, **kwargs):
        raise RuntimeError("db exploded")

    monkeypatch.setattr("app.api.v1.vocabulary.vocab_service.list_words", boom)
    resp = await client.get("/api/v1/words?q=trigger-error")
    assert resp.status_code == 500
    assert resp.json()["detail"] == "Internal server error"
    # No internal detail leaks; the request is still traceable.
    assert "db exploded" not in resp.text
    assert resp.headers.get("X-Request-ID")
