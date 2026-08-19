"""GitHub Sign-in: exchanges an authorization code for the account's identity.

Unlike Google/Apple (which hand the browser a signed identity token the
backend only needs to verify), GitHub's OAuth app flow requires a server-held
client secret to exchange the `code` for an access token — so this class
performs the whole round trip rather than just verifying something the
frontend already has.
"""

from typing import Optional

import httpx
from pydantic import BaseModel

from app.core.config import get_settings

GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"


class GithubIdentity(BaseModel):
    sub: str  # GitHub's numeric user id, stringified
    email: Optional[str] = None
    email_verified: bool = False
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class GithubOAuthClient:
    """Overridden in tests through FastAPI dependency injection."""

    async def exchange(self, code: str, redirect_uri: str) -> Optional[GithubIdentity]:
        settings = get_settings()
        if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
            return None
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                token_response = await client.post(
                    GITHUB_TOKEN_URL,
                    data={
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                        "code": code,
                        "redirect_uri": redirect_uri,
                    },
                    headers={"Accept": "application/json"},
                )
                if token_response.status_code != 200:
                    return None
                token_data = token_response.json()
                access_token = token_data.get("access_token")
                if not access_token:
                    return None

                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                }
                user_response = await client.get(GITHUB_USER_URL, headers=headers)
                if user_response.status_code != 200:
                    return None
                user = user_response.json()
                user_id = user.get("id")
                if not user_id:
                    return None

                email = user.get("email")
                email_verified = bool(email)
                if not email:
                    # Private-email accounts return null above; the emails
                    # endpoint needs its own scope grant (user:email) but
                    # tells us which address is primary and verified.
                    emails_response = await client.get(GITHUB_EMAILS_URL, headers=headers)
                    if emails_response.status_code == 200:
                        for entry in emails_response.json():
                            if entry.get("primary") and entry.get("verified"):
                                email = entry.get("email")
                                email_verified = True
                                break
        except (httpx.HTTPError, ValueError):
            return None

        return GithubIdentity(
            sub=str(user_id),
            email=email,
            email_verified=email_verified,
            name=user.get("name") or user.get("login"),
            avatar_url=user.get("avatar_url"),
        )


def get_github_oauth_client() -> GithubOAuthClient:
    return GithubOAuthClient()
