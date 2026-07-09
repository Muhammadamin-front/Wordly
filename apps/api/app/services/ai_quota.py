from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.ai import AiUsage
from app.models.user import User
from app.services.leveling import local_today


async def _get_or_create_usage(db: AsyncSession, user: User, day) -> AiUsage:
    usage = await db.scalar(
        select(AiUsage).where(AiUsage.user_id == user.id, AiUsage.day == day)
    )
    if usage is None:
        usage = AiUsage(user_id=user.id, day=day)
        db.add(usage)
        await db.flush()
    return usage


def daily_quota(user: User) -> int:
    # Everyone is on the free tier until M7 introduces plans.
    return get_settings().AI_FREE_DAILY_QUOTA


async def remaining_today(db: AsyncSession, user: User) -> int:
    today = local_today(user.profile.timezone or "UTC")
    usage = await db.scalar(
        select(AiUsage).where(AiUsage.user_id == user.id, AiUsage.day == today)
    )
    used = usage.count if usage else 0
    return max(0, daily_quota(user) - used)


async def has_quota(db: AsyncSession, user: User) -> bool:
    return await remaining_today(db, user) > 0


async def consume(db: AsyncSession, user: User) -> None:
    """Record one used AI action. Called only after a successful model call, so
    failed generations don't cost the user a quota slot."""
    today = local_today(user.profile.timezone or "UTC")
    usage = await _get_or_create_usage(db, user, today)
    usage.count += 1
    await db.flush()
