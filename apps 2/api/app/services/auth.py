from datetime import timedelta
from typing import Optional, Tuple

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import generate_opaque_token, hash_token, utcnow
from app.models.user import OneTimeToken, RefreshToken, User


async def issue_refresh_token(
    db: AsyncSession,
    user: User,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> str:
    settings = get_settings()
    raw = generate_opaque_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw),
            expires_at=utcnow() + timedelta(seconds=settings.REFRESH_TOKEN_TTL_SECONDS),
            user_agent=(user_agent or "")[:256] or None,
            ip_address=ip_address,
        )
    )
    await db.flush()
    return raw


async def rotate_refresh_token(
    db: AsyncSession,
    raw_token: str,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Optional[Tuple[User, str]]:
    """Validate + rotate. Returns (user, new_raw_token) or None if invalid.

    Reuse of an already-rotated token is treated as theft: every session
    for that user is revoked.
    """
    row = await db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_token))
    )
    if row is None:
        return None

    now = utcnow()
    if row.revoked_at is not None:
        if row.replaced_by_id is not None:  # reuse after rotation -> theft signal
            await revoke_all_user_sessions(db, row.user_id)
            await db.commit()
        return None
    if row.expires_at <= now:
        return None

    user = await db.scalar(select(User).where(User.id == row.user_id, User.is_active.is_(True)))
    if user is None:
        return None

    new_raw = await issue_refresh_token(db, user, user_agent=user_agent, ip_address=ip_address)
    new_row = await db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(new_raw))
    )
    row.revoked_at = now
    row.replaced_by_id = new_row.id
    await db.flush()
    return user, new_raw


async def revoke_refresh_token(db: AsyncSession, raw_token: str) -> None:
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.token_hash == hash_token(raw_token), RefreshToken.revoked_at.is_(None))
        .values(revoked_at=utcnow())
    )


async def revoke_all_user_sessions(db: AsyncSession, user_id) -> None:
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=utcnow())
    )


async def create_one_time_token(
    db: AsyncSession, user: User, purpose: str, ttl_seconds: int
) -> str:
    raw = generate_opaque_token()
    db.add(
        OneTimeToken(
            user_id=user.id,
            purpose=purpose,
            token_hash=hash_token(raw),
            expires_at=utcnow() + timedelta(seconds=ttl_seconds),
        )
    )
    await db.flush()
    return raw


async def consume_one_time_token(
    db: AsyncSession, raw_token: str, purpose: str
) -> Optional[User]:
    row = await db.scalar(
        select(OneTimeToken).where(
            OneTimeToken.token_hash == hash_token(raw_token),
            OneTimeToken.purpose == purpose,
        )
    )
    now = utcnow()
    if row is None or row.used_at is not None or row.expires_at <= now:
        return None
    row.used_at = now
    await db.flush()
    return await db.scalar(select(User).where(User.id == row.user_id))
