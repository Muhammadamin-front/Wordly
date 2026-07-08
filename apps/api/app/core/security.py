import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from uuid import UUID

import bcrypt
import jwt

from app.core.config import get_settings

ALGORITHM = "HS256"


def utcnow() -> datetime:
    """Naive UTC. All persisted datetimes in this codebase are naive UTC."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def hash_password(password: str) -> str:
    settings = get_settings()
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    ).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: UUID, ttl_seconds: Optional[int] = None) -> str:
    settings = get_settings()
    now = utcnow()
    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(seconds=ttl_seconds or settings.ACCESS_TOKEN_TTL_SECONDS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[UUID]:
    """Return the user id for a valid access token, else None."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("type") != "access":
        return None
    try:
        return UUID(payload["sub"])
    except (KeyError, ValueError):
        return None


def generate_opaque_token() -> str:
    """URL-safe random token for refresh / email / reset flows.

    Only its SHA-256 digest is stored, so a database leak does not leak tokens.
    """
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
