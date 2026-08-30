"""Verification of Apple identity tokens received from Sign in with Apple."""

import json
from typing import Optional

import httpx
import jwt
from pydantic import BaseModel

from app.core.config import get_settings

APPLE_ISSUER = "https://appleid.apple.com"
APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys"


class AppleIdentity(BaseModel):
    sub: str
    email: Optional[str] = None
    email_verified: bool = False


class AppleVerifier:
    """Validate the token signature, issuer and audience against Apple JWKS."""

    async def verify(self, id_token: str) -> Optional[AppleIdentity]:
        settings = get_settings()
        if not settings.APPLE_CLIENT_ID:
            return None
        try:
            header = jwt.get_unverified_header(id_token)
            key_id = header["kid"]
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(APPLE_JWKS_URL)
            if response.status_code != 200:
                return None
            jwk = next(
                key for key in response.json().get("keys", []) if key.get("kid") == key_id
            )
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
            claims = jwt.decode(
                id_token,
                public_key,
                algorithms=["RS256"],
                audience=settings.APPLE_CLIENT_ID,
                issuer=APPLE_ISSUER,
            )
        except (KeyError, StopIteration, TypeError, ValueError, jwt.PyJWTError, httpx.HTTPError):
            return None

        email = claims.get("email")
        return AppleIdentity(
            sub=claims["sub"],
            email=email if isinstance(email, str) else None,
            email_verified=claims.get("email_verified") in (True, "true"),
        )


def get_apple_verifier() -> AppleVerifier:
    return AppleVerifier()
