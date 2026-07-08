from app.core.config import get_settings
from tests.conftest import register_user


async def test_security_headers_present(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert "referrer-policy" in response.headers


async def test_refresh_cookie_is_httponly_and_scoped(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "cookie@example.uz",
            "password": "kuchli-parol-123",
            "display_name": "Cookie",
        },
    )
    set_cookie = response.headers["set-cookie"].lower()
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie
    assert "path=/api/v1/auth" in set_cookie


async def test_login_rate_limit_returns_429(client):
    settings = get_settings()
    original = settings.RATE_LIMIT_LOGIN
    settings.RATE_LIMIT_LOGIN = "3/60"
    try:
        payload = {"email": "ghost@example.uz", "password": "wrong-pass-1"}
        for _ in range(3):
            response = await client.post("/api/v1/auth/login", json=payload)
            assert response.status_code == 401
        blocked = await client.post("/api/v1/auth/login", json=payload)
        assert blocked.status_code == 429
        assert "retry-after" in blocked.headers
    finally:
        settings.RATE_LIMIT_LOGIN = original


async def test_update_profile(client):
    data = await register_user(client)
    headers = {"Authorization": "Bearer " + data["access_token"]}

    response = await client.patch(
        "/api/v1/users/me",
        json={"display_name": "Dilnoza R.", "ui_locale": "ru", "bio": "IELTS 6.5 nishon"},
        headers=headers,
    )
    assert response.status_code == 200
    profile = response.json()["profile"]
    assert profile["display_name"] == "Dilnoza R."
    assert profile["ui_locale"] == "ru"
    assert profile["bio"] == "IELTS 6.5 nishon"

    bad = await client.patch("/api/v1/users/me", json={"ui_locale": "fr"}, headers=headers)
    assert bad.status_code == 422
