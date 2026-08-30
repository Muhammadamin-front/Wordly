from app.services.emailer import EmailDeliveryError
from tests.conftest import REGISTER_PAYLOAD, extract_token_from_outbox, register_user


async def test_registration_returns_safe_error_when_verification_email_fails(client, monkeypatch):
    async def failed_send(*args, **kwargs):
        raise EmailDeliveryError("provider failure")

    monkeypatch.setattr("app.services.emailer.ConsoleEmailer.send", failed_send)
    response = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)

    assert response.status_code == 503
    assert response.json()["detail"] == "Account email is temporarily unavailable. Please try again shortly."


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


async def test_forgot_password_reports_a_safe_retry_message_when_delivery_fails(client, monkeypatch):
    await register_user(client)

    async def failed_send(*args, **kwargs):
        raise EmailDeliveryError("provider failure")

    monkeypatch.setattr("app.services.emailer.ConsoleEmailer.send", failed_send)
    response = await client.post(
        "/api/v1/auth/forgot-password", json={"email": REGISTER_PAYLOAD["email"]}
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "Password reset email is temporarily unavailable. Please try again shortly."


async def test_full_reset_flow_revokes_sessions(client):
    await register_user(client)
    old_refresh = client.cookies.get("words_refresh")
    assert old_refresh

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
    client.cookies.set("words_refresh", old_refresh)
    replay = await client.post("/api/v1/auth/refresh", json={})
    assert replay.status_code == 401

    # Reset token is single-use.
    again = await client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "new_password": "boshqa-parol-789"},
    )
    assert again.status_code == 400
