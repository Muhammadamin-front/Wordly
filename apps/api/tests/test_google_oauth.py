from typing import Optional

from app.main import app
from app.services.google_oauth import GoogleIdentity, GoogleVerifier, get_google_verifier
from tests.conftest import REGISTER_PAYLOAD, register_user


class FakeVerifier(GoogleVerifier):
    def __init__(self, identity: Optional[GoogleIdentity]) -> None:
        self._identity = identity

    async def verify(self, id_token: str) -> Optional[GoogleIdentity]:
        return self._identity


IDENTITY = GoogleIdentity(
    sub="google-sub-1",
    email="jasur@example.uz",
    email_verified=True,
    name="Jasur",
    picture="https://example.com/pic.png",
)


def use_verifier(identity: Optional[GoogleIdentity]) -> None:
    app.dependency_overrides[get_google_verifier] = lambda: FakeVerifier(identity)


async def test_google_login_creates_verified_user(client):
    use_verifier(IDENTITY)
    try:
        response = await client.post(
            "/api/v1/auth/google",
            json={"id_token": "x" * 20, "ui_locale": "ru"},
            headers={"X-Client": "mobile"},
        )
        assert response.status_code == 200, response.text
        user = response.json()["user"]
        assert user["email"] == "jasur@example.uz"
        assert user["email_verified"] is True
        assert user["profile"]["display_name"] == "Jasur"
        assert user["profile"]["ui_locale"] == "ru"
        assert user["profile"]["onboarding_completed"] is False
    finally:
        app.dependency_overrides.clear()


async def test_google_login_links_existing_email_account(client):
    await register_user(client, email="jasur@example.uz")
    use_verifier(IDENTITY)
    try:
        response = await client.post("/api/v1/auth/google", json={"id_token": "x" * 20})
        assert response.status_code == 200
        # Linked, not duplicated: password login still works afterwards.
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "jasur@example.uz", "password": REGISTER_PAYLOAD["password"]},
        )
        assert login.status_code == 200
    finally:
        app.dependency_overrides.clear()


async def test_google_login_rejects_bad_token(client):
    use_verifier(None)
    try:
        response = await client.post("/api/v1/auth/google", json={"id_token": "x" * 20})
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()
