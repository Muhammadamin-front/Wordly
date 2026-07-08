from tests.conftest import register_user


async def test_refresh_rotates_token(client):
    data = await register_user(client)
    old_refresh = data["refresh_token"]

    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert response.status_code == 200
    new_refresh = response.json()["refresh_token"]
    assert new_refresh != old_refresh
    assert response.json()["access_token"]


async def test_refresh_via_cookie(client):
    await register_user(client)
    # register set the httpOnly cookie on the client jar; empty body should work
    response = await client.post("/api/v1/auth/refresh", json={})
    assert response.status_code == 200


async def test_reused_rotated_token_revokes_all_sessions(client):
    data = await register_user(client)
    first = data["refresh_token"]

    second = (
        await client.post("/api/v1/auth/refresh", json={"refresh_token": first})
    ).json()["refresh_token"]

    client.cookies.clear()  # isolate body-token behavior from the cookie jar

    # Replaying the rotated-out token is a theft signal...
    reuse = await client.post("/api/v1/auth/refresh", json={"refresh_token": first})
    assert reuse.status_code == 401

    # ...so even the legitimate newest token is now dead.
    after = await client.post("/api/v1/auth/refresh", json={"refresh_token": second})
    assert after.status_code == 401


async def test_garbage_refresh_token_rejected(client):
    client.cookies.clear()
    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": "garbage"})
    assert response.status_code == 401


async def test_logout_revokes_refresh_token(client):
    data = await register_user(client)
    refresh = data["refresh_token"]

    out = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh})
    assert out.status_code == 200

    client.cookies.clear()
    replay = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert replay.status_code == 401
