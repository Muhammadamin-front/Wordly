from app.services.emailer import ConsoleEmailer
from tests.conftest import REGISTER_PAYLOAD, extract_token_from_outbox, register_user


async def test_register_returns_tokens_and_user(client):
    data = await register_user(client)
    assert data["access_token"]
    assert "refresh_token" not in data
    assert client.cookies.get("words_refresh")
    assert data["user"]["email"] == REGISTER_PAYLOAD["email"]
    assert data["user"]["email_verified"] is False
    assert data["user"]["profile"]["display_name"] == "Dilnoza"
    assert data["user"]["profile"]["ui_locale"] == "uz"
    assert data["user"]["profile"]["onboarding_completed"] is False


async def test_register_duplicate_email_conflicts(client):
    await register_user(client)
    response = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert response.status_code == 409


async def test_register_rejects_short_password(client):
    response = await client.post(
        "/api/v1/auth/register", json={**REGISTER_PAYLOAD, "password": "short"}
    )
    assert response.status_code == 422


async def test_email_is_case_insensitive(client):
    await register_user(client)
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER_PAYLOAD["email"].upper(), "password": REGISTER_PAYLOAD["password"]},
    )
    assert response.status_code == 200


async def test_login_success_and_me(client):
    await register_user(client)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTER_PAYLOAD["email"], "password": REGISTER_PAYLOAD["password"]},
    )
    assert login.status_code == 200
    access = login.json()["access_token"]

    me = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer " + access})
    assert me.status_code == 200
    assert me.json()["email"] == REGISTER_PAYLOAD["email"]


async def test_login_wrong_password_and_unknown_email_same_error(client):
    await register_user(client)
    wrong_pw = await client.post(
        "/api/v1/auth/login", json={"email": REGISTER_PAYLOAD["email"], "password": "wrong-pass-1"}
    )
    unknown = await client.post(
        "/api/v1/auth/login", json={"email": "ghost@example.uz", "password": "wrong-pass-1"}
    )
    assert wrong_pw.status_code == unknown.status_code == 401
    assert wrong_pw.json()["detail"] == unknown.json()["detail"]


async def test_me_requires_token(client):
    assert (await client.get("/api/v1/auth/me")).status_code == 401
    bad = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer nonsense"})
    assert bad.status_code == 401


async def test_email_verification_flow(client):
    data = await register_user(client)
    token = extract_token_from_outbox("verify-email")
    assert "/uz/auth/verify-email?token=" in ConsoleEmailer.outbox[-1]["body"]

    verify = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert verify.status_code == 200

    me = await client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer " + data["access_token"]}
    )
    assert me.json()["email_verified"] is True

    # Single use.
    again = await client.post("/api/v1/auth/verify-email", json={"token": token})
    assert again.status_code == 400
