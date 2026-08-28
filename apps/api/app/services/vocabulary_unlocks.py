"""Permanent, one-time vocabulary-tier unlocks paid for with coins."""
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import VocabularyUnlock
from app.models.user import User

C1_C2_TIER = "c1_c2"


async def is_unlocked(db: AsyncSession, user: User, tier: str) -> bool:
    row = await db.scalar(
        select(VocabularyUnlock.id).where(
            VocabularyUnlock.user_id == user.id, VocabularyUnlock.tier == tier
        )
    )
    return row is not None


async def unlock(db: AsyncSession, user: User, tier: str) -> None:
    """Idempotent: a duplicate unlock (double submit / race) is a no-op, not
    an error — same savepoint-and-swallow pattern api/v1/payments.py already
    uses for its idempotency-key race, since SQLite (this project's default)
    has no portable "insert ... on conflict do nothing"."""
    if await is_unlocked(db, user, tier):
        return
    async with db.begin_nested():
        db.add(VocabularyUnlock(user_id=user.id, tier=tier))
        try:
            await db.flush()
        except IntegrityError:
            pass
