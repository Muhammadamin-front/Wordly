from typing import Optional

from app.main import app
from app.services.apple_oauth import AppleIdentity, AppleVerifier, get_apple_verifier


class FakeVerifier(AppleVerifier):
    def __init__(self, identity: Optional[AppleIdentity]) -> None:
        self._identity = identity

    async def verify(self, id_token: str) -> Optional[AppleIdentity]:
        return self._identity


IDENTITY = AppleIdentity(
    sub="apple-sub-1",
    email="dilnoza@privaterelay.appleid.com",
    email_verified=True,
)


def use_verifier(identity: Optional[AppleIdentity]) -> None:
    app.dependency_overrides[get_apple_verifier] = lambda: FakeVerifier(identity)


async def test_apple_login_creates_verified_user(client):
    use_verifier(IDENTITY)
    try:
        response = await client.post(
            "/api/v1/auth/apple",
            json={"id_token": "x" * 20, "display_name": "Dilnoza Karimova"},
        )
        assert response.status_code == 200, response.text
        user = response.json()["user"]
        assert user["email"] == "dilnoza@privaterelay.appleid.com"
        assert user["email_verified"] is True
        assert user["profile"]["display_name"] == "Dilnoza Karimova"
    finally:
        app.dependency_overrides.clear()


async def test_apple_login_links_existing_email_account(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": IDENTITY.email, "password": "password123", "display_name": "Dilnoza"},
    )
    use_verifier(IDENTITY)
    try:
        response = await client.post("/api/v1/auth/apple", json={"id_token": "x" * 20})
        assert response.status_code == 200
        # The Apple subject is retained, so subsequent Apple sign-ins do not need an email.
        use_verifier(AppleIdentity(sub=IDENTITY.sub))
        second_response = await client.post("/api/v1/auth/apple", json={"id_token": "x" * 20})
        assert second_response.status_code == 200
    finally:
        app.dependency_overrides.clear()


async def test_apple_login_rejects_invalid_token(client):
    use_verifier(None)
    try:
        response = await client.post("/api/v1/auth/apple", json={"id_token": "x" * 20})
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()


async def test_apple_login_requires_email_for_new_account(client):
    use_verifier(AppleIdentity(sub="apple-sub-without-email"))
    try:
        response = await client.post("/api/v1/auth/apple", json={"id_token": "x" * 20})
        assert response.status_code == 400
    finally:
        app.dependency_overrides.clear()


async def test_apple_login_requires_verified_email_for_new_account(client):
    use_verifier(AppleIdentity(sub="apple-sub-unverified", email="unsafe@example.uz"))
    try:
        response = await client.post("/api/v1/auth/apple", json={"id_token": "x" * 20})
        assert response.status_code == 400
    finally:
        app.dependency_overrides.clear()
