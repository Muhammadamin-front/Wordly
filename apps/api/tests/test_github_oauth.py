from typing import Optional

from app.main import app
from app.services.github_oauth import GithubIdentity, GithubOAuthClient, get_github_oauth_client


class FakeOAuthClient(GithubOAuthClient):
    def __init__(self, identity: Optional[GithubIdentity]) -> None:
        self._identity = identity

    async def exchange(self, code: str, redirect_uri: str) -> Optional[GithubIdentity]:
        return self._identity


IDENTITY = GithubIdentity(
    sub="github-sub-1",
    email="jasur@example.uz",
    email_verified=True,
    name="Jasur",
    avatar_url="https://example.com/pic.png",
)


def use_client(identity: Optional[GithubIdentity]) -> None:
    app.dependency_overrides[get_github_oauth_client] = lambda: FakeOAuthClient(identity)


REQUEST_BODY = {"code": "abc123", "redirect_uri": "http://localhost:3000/uz/auth/github/callback"}


async def test_github_login_creates_verified_user(client):
    use_client(IDENTITY)
    try:
        response = await client.post("/api/v1/auth/github", json=REQUEST_BODY)
        assert response.status_code == 200, response.text
        user = response.json()["user"]
        assert user["email"] == "jasur@example.uz"
        assert user["email_verified"] is True
        assert user["profile"]["display_name"] == "Jasur"
    finally:
        app.dependency_overrides.clear()


async def test_github_login_links_existing_email_account(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": IDENTITY.email, "password": "password123", "display_name": "Jasur"},
    )
    use_client(IDENTITY)
    try:
        response = await client.post("/api/v1/auth/github", json=REQUEST_BODY)
        assert response.status_code == 200
        # The GitHub subject is retained, so subsequent GitHub sign-ins need no email.
        use_client(GithubIdentity(sub=IDENTITY.sub))
        second_response = await client.post("/api/v1/auth/github", json=REQUEST_BODY)
        assert second_response.status_code == 200
    finally:
        app.dependency_overrides.clear()


async def test_github_login_rejects_invalid_code(client):
    use_client(None)
    try:
        response = await client.post("/api/v1/auth/github", json=REQUEST_BODY)
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()


async def test_github_login_requires_email_for_new_account(client):
    use_client(GithubIdentity(sub="github-sub-without-email"))
    try:
        response = await client.post("/api/v1/auth/github", json=REQUEST_BODY)
        assert response.status_code == 400
    finally:
        app.dependency_overrides.clear()


async def test_github_login_requires_verified_email_for_new_account(client):
    use_client(GithubIdentity(sub="github-sub-unverified", email="unsafe@example.uz"))
    try:
        response = await client.post("/api/v1/auth/github", json=REQUEST_BODY)
        assert response.status_code == 400
    finally:
        app.dependency_overrides.clear()
