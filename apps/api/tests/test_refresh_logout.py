from tests.conftest import register_user


async def test_refresh_rotates_token(client):
    data = await register_user(client)
    old_refresh = client.cookies.get("words_refresh")
    assert old_refresh

    response = await client.post("/api/v1/auth/refresh", json={})
    assert response.status_code == 200
    new_refresh = client.cookies.get("words_refresh")
    assert new_refresh
    assert new_refresh != old_refresh
    assert response.json()["access_token"]
    assert "refresh_token" not in response.json()


async def test_refresh_via_cookie(client):
    await register_user(client)
    # register set the httpOnly cookie on the client jar; empty body should work
    response = await client.post("/api/v1/auth/refresh", json={})
    assert response.status_code == 200


async def test_reused_rotated_token_revokes_all_sessions(client):
    await register_user(client)
    first = client.cookies.get("words_refresh")
    assert first

    rotated = await client.post("/api/v1/auth/refresh", json={})
    assert rotated.status_code == 200
    second = client.cookies.get("words_refresh")
    assert second

    client.cookies.clear()
    client.cookies.set("words_refresh", first)

    # Replaying the rotated-out token is a theft signal...
    reuse = await client.post("/api/v1/auth/refresh", json={})
    assert reuse.status_code == 401

    # ...so even the legitimate newest token is now dead.
    client.cookies.set("words_refresh", second)
    after = await client.post("/api/v1/auth/refresh", json={})
    assert after.status_code == 401


async def test_refresh_token_in_request_body_is_ignored_without_mobile_session(client):
    client.cookies.clear()
    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": "garbage"})
    assert response.status_code == 401


async def test_mobile_tokens_are_returned_and_refresh_without_cookies(client):
    mobile_headers = {"X-Client": "mobile"}
    web_data = await register_user(client)
    assert "refresh_token" not in web_data

    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "dilnoza@example.uz", "password": "kuchli-parol-123"},
        headers=mobile_headers,
    )
    assert login.status_code == 200
    mobile_refresh = login.json()["refresh_token"]
    assert mobile_refresh

    client.cookies.clear()
    refreshed = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": mobile_refresh},
        headers=mobile_headers,
    )
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]
    assert refreshed.json()["refresh_token"]
    assert refreshed.json()["refresh_token"] != mobile_refresh

    latest_refresh = refreshed.json()["refresh_token"]
    out = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": latest_refresh},
        headers=mobile_headers,
    )
    assert out.status_code == 200
    revoked = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": latest_refresh},
        headers=mobile_headers,
    )
    assert revoked.status_code == 401


async def test_logout_revokes_refresh_token(client):
    await register_user(client)
    refresh = client.cookies.get("words_refresh")
    assert refresh

    out = await client.post("/api/v1/auth/logout", json={})
    assert out.status_code == 200
    assert client.cookies.get("words_refresh") is None

    client.cookies.clear()
    client.cookies.set("words_refresh", refresh)
    replay = await client.post("/api/v1/auth/refresh", json={})
    assert replay.status_code == 401


async def test_refresh_rejects_untrusted_origin(client):
    await register_user(client)
    response = await client.post(
        "/api/v1/auth/refresh", json={}, headers={"Origin": "https://attacker.example"}
    )
    assert response.status_code == 403
