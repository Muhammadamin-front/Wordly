"""Proactive DDoS-hardening pass: closes app-layer gaps found by grepping
every router for `rate_limit(`/`cached_response(` coverage — see
docs/deploy.md's "DDoS posture" section for the full picture, including the
parts of this (Cloudflare, origin firewall) that live outside the app."""
from app.core.cache import MemoryCache
from app.core.config import get_settings
from app.core.rate_limit import MemoryStorage, ws_connect_allowed
from app.main import app
from tests.conftest import register_user
from tests.test_trusted_proxy import websocket_connection


# --- expressions.py now caches like its vocabulary.py sibling routes -------


async def test_expressions_are_cache_control_and_etag(client):
    resp = await client.get("/api/v1/expressions")
    assert resp.status_code == 200
    assert "max-age" in resp.headers["Cache-Control"]
    assert resp.headers["ETag"]


async def test_expressions_cache_hit_marker(client):
    app.state.cache = MemoryCache()
    try:
        first = await client.get("/api/v1/expressions/meta")
        assert first.headers["X-Cache"] == "MISS"
        second = await client.get("/api/v1/expressions/meta")
        assert second.headers["X-Cache"] == "HIT"
        assert first.json() == second.json()
    finally:
        app.state.cache = None


async def test_expression_detail_404_is_not_cached_as_a_hit(client):
    resp = await client.get("/api/v1/expressions/not-a-real-slug")
    assert resp.status_code == 404


# --- previously-ungated auth routers now carry a default rate limit --------


async def test_library_router_rate_limit_returns_429(client):
    session = await register_user(client)
    token = session["access_token"]
    settings = get_settings()
    original = settings.RATE_LIMIT_DEFAULT
    settings.RATE_LIMIT_DEFAULT = "2/60"
    app.state.rate_limit_storage = MemoryStorage()
    try:
        headers = {"Authorization": "Bearer {}".format(token)}
        codes = [
            (await client.get("/api/v1/library/overview", headers=headers)).status_code
            for _ in range(3)
        ]
        assert codes[0] == 200 and codes[1] == 200
        assert codes[2] == 429
    finally:
        settings.RATE_LIMIT_DEFAULT = original


# --- WS-handshake flood guard, shared by /ws/quiz and /coach/.../live -----


async def test_ws_connect_allowed_throttles_by_ip():
    storage = MemoryStorage()
    websocket = websocket_connection("203.0.113.5")
    for _ in range(20):
        assert await ws_connect_allowed(websocket, storage, "20/60") is True
    assert await ws_connect_allowed(websocket, storage, "20/60") is False


async def test_ws_connect_allowed_keys_by_ip_independently():
    storage = MemoryStorage()
    a = websocket_connection("203.0.113.5")
    b = websocket_connection("203.0.113.9")
    for _ in range(5):
        assert await ws_connect_allowed(a, storage, "5/60") is True
    assert await ws_connect_allowed(a, storage, "5/60") is False
    # A different peer isn't affected by A's flood.
    assert await ws_connect_allowed(b, storage, "5/60") is True
