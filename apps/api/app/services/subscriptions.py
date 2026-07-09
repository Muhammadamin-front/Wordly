from datetime import timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.billing import FamilyMember, Subscription
from app.models.user import User
from app.services.plans import get_plan


async def active_subscription(db: AsyncSession, user_id: UUID) -> Optional[Subscription]:
    """The user's own active subscription, or the family subscription they belong to."""
    now = utcnow()
    own = await db.scalar(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.expires_at > now,
        )
    )
    if own is not None:
        return own

    family = await db.scalar(
        select(Subscription)
        .join(FamilyMember, FamilyMember.subscription_id == Subscription.id)
        .where(
            FamilyMember.member_id == user_id,
            Subscription.status == "active",
            Subscription.expires_at > now,
        )
    )
    return family


async def is_premium(db: AsyncSession, user: User) -> bool:
    sub = await active_subscription(db, user.id)
    return sub is not None and (get_plan(sub.plan_code) or None) is not None and (
        get_plan(sub.plan_code).tier == "premium"
    )


async def grant(
    db: AsyncSession, user_id: UUID, plan_code: str, provider: str, extra_days: int = 0
) -> Subscription:
    """Activate or extend a subscription. Extending stacks onto the remaining
    time so re-purchasing before expiry never loses days."""
    plan = get_plan(plan_code)
    if plan is None:
        raise ValueError("unknown plan {}".format(plan_code))
    now = utcnow()
    days = plan.duration_days + extra_days

    sub = await db.scalar(select(Subscription).where(Subscription.user_id == user_id))
    if sub is None:
        sub = Subscription(
            user_id=user_id,
            plan_code=plan_code,
            provider=provider,
            seats=plan.seats,
            started_at=now,
            expires_at=now + timedelta(days=days),
        )
        db.add(sub)
    else:
        base = sub.expires_at if (sub.status == "active" and sub.expires_at > now) else now
        sub.plan_code = plan_code
        sub.provider = provider
        sub.seats = plan.seats
        sub.status = "active"
        sub.expires_at = base + timedelta(days=days)
    await db.flush()
    return sub


async def add_days(db: AsyncSession, user_id: UUID, days: int) -> None:
    """Referral reward: extend an existing premium sub, or grant a fresh window."""
    now = utcnow()
    sub = await db.scalar(select(Subscription).where(Subscription.user_id == user_id))
    if sub is not None and sub.status == "active" and sub.expires_at > now:
        sub.expires_at = sub.expires_at + timedelta(days=days)
    else:
        db.add(
            Subscription(
                user_id=user_id,
                plan_code="premium_monthly",
                provider="referral",
                seats=1,
                started_at=now,
                expires_at=now + timedelta(days=days),
            )
        )
    await db.flush()


async def cancel(db: AsyncSession, user_id: UUID) -> None:
    sub = await db.scalar(select(Subscription).where(Subscription.user_id == user_id))
    if sub is not None:
        sub.status = "canceled"
        sub.auto_renew = False
        await db.flush()
