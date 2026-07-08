from tests.conftest import REGISTER_PAYLOAD, extract_token_from_outbox, register_user


async def test_forgot_password_no_account_enumeration(client):
    await register_user(client)
    known = await client.post(
        "/api/v1/auth/forgot-password", json={"email": REGISTER_PAYLOAD["email"]}
    )
    unknown = await client.post(
        "/api/v1/auth/forgot-password", json={"email": "ghost@example.uz"}
    )
    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json()


async def test_full_reset_flow_revokes_sessions(client):
    data = await register_user(client)
    old_refresh = data["refresh_token"]

    await client.post("/api/v1/auth/forgot-password", json={"email": REGISTER_PAYLOAD["email"]})
    token = extract_token_from_outbox("reset-password")

    reset = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": "yangi-parol-456"},
    )
    assert reset.status_code == 200

    # Old password dead, new password works.
    old_login = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER_PAYLOAD["email"], "password": REGISTER_PAYLOAD["password"]},
    )
    assert old_login.status_code == 401
    new_login = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER_PAYLOAD["email"], "password": "yangi-parol-456"},
    )
    assert new_login.status_code == 200

    # All pre-reset sessions revoked.
    client.cookies.clear()
    replay = await client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert replay.status_code == 401

    # Reset token is single-use.
    again = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": "boshqa-parol-789"},
    )
    assert again.status_code == 400
