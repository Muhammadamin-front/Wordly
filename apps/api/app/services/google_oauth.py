from typing import Optional

import httpx
from pydantic import BaseModel

from app.core.config import get_settings

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class GoogleIdentity(BaseModel):
    sub: str
    email: str
    email_verified: bool
    name: Optional[str] = None
    picture: Optional[str] = None


class GoogleVerifier:
    """Verifies a Google ID token via the tokeninfo endpoint.

    Overridden in tests (and replaceable by offline JWKS verification later)
    through FastAPI dependency injection.
    """

    async def verify(self, id_token: str) -> Optional[GoogleIdentity]:
        settings = get_settings()
        if not settings.GOOGLE_CLIENT_ID:
            return None
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(GOOGLE_TOKENINFO_URL, params={"id_token": id_token})
        if response.status_code != 200:
            return None
        data = response.json()
        if data.get("aud") != settings.GOOGLE_CLIENT_ID:
            return None
        return GoogleIdentity(
            sub=data["sub"],
            email=data["email"],
            email_verified=data.get("email_verified") in (True, "true"),
            name=data.get("name"),
            picture=data.get("picture"),
        )


def get_google_verifier() -> GoogleVerifier:
    return GoogleVerifier()
