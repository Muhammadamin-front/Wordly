import secrets
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import utcnow
from app.models.billing import Referral
from app.models.user import User
from app.services import subscriptions

_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous chars


def new_code() -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(7))


async def ensure_code(db: AsyncSession, user: User) -> str:
    if user.referral_code:
        return user.referral_code
    for _ in range(5):
        code = new_code()
        if await db.scalar(select(User.id).where(User.referral_code == code)) is None:
            user.referral_code = code
            await db.flush()
            return code
    raise RuntimeError("could not allocate a referral code")


async def link_referral(db: AsyncSession, referee: User, code: str) -> None:
    """Record a pending referral at registration. Self-referral and duplicates
    are ignored silently."""
    referrer = await db.scalar(select(User).where(User.referral_code == code.strip().upper()))
    if referrer is None or referrer.id == referee.id:
        return
    exists = await db.scalar(select(Referral.id).where(Referral.referee_id == referee.id))
    if exists is not None:
        return
    db.add(Referral(referrer_id=referrer.id, referee_id=referee.id))
    await db.flush()


async def reward_on_first_payment(db: AsyncSession, referee_id: UUID) -> None:
    """When a referee first pays, grant the reward to both — once."""
    referral = await db.scalar(
        select(Referral).where(
            Referral.referee_id == referee_id, Referral.rewarded_at.is_(None)
        )
    )
    if referral is None:
        return
    days = get_settings().REFERRAL_REWARD_DAYS
    await subscriptions.add_days(db, referral.referrer_id, days)
    await subscriptions.add_days(db, referral.referee_id, days)
    referral.rewarded_at = utcnow()
    await db.flush()


async def stats(db: AsyncSession, referrer_id: UUID) -> dict:
    total = int(
        await db.scalar(
            select(func.count(Referral.id)).where(Referral.referrer_id == referrer_id)
        )
        or 0
    )
    rewarded = int(
        await db.scalar(
            select(func.count(Referral.id)).where(
                Referral.referrer_id == referrer_id, Referral.rewarded_at.isnot(None)
            )
        )
        or 0
    )
    return {"invited": total, "rewarded": rewarded}
