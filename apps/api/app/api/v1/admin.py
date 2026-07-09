from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.security import utcnow
from app.db.session import get_db
from app.models.ai import AiReport
from app.models.billing import Payment, Subscription
from app.models.flashcards import ReviewLog
from app.models.user import Profile, User
from app.schemas.admin import (
    AdminAnalyticsOut,
    AdminUserOut,
    AdminUserPage,
    AiReportOut,
    MessageOut,
    RoleUpdate,
)
from app.services.plans import get_plan

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/analytics", response_model=AdminAnalyticsOut)
async def analytics(db: AsyncSession = Depends(get_db)):
    now = utcnow()
    users_total = int(await db.scalar(select(func.count(User.id))) or 0)
    active_subs = (
        await db.scalars(
            select(Subscription).where(
                Subscription.status == "active", Subscription.expires_at > now
            )
        )
    ).all()
    premium = sum(
        1 for s in active_subs if (get_plan(s.plan_code) and get_plan(s.plan_code).tier == "premium")
    )
    revenue_tiyin = int(
        await db.scalar(
            select(func.coalesce(func.sum(Payment.amount_tiyin), 0)).where(Payment.state == 2)
        )
        or 0
    )
    reports_open = int(
        await db.scalar(select(func.count(AiReport.id)).where(AiReport.resolved_at.is_(None))) or 0
    )
    reviews_total = int(await db.scalar(select(func.count(ReviewLog.id))) or 0)
    return AdminAnalyticsOut(
        users_total=users_total,
        premium_users=premium,
        active_subscriptions=len(active_subs),
        revenue_som=revenue_tiyin // 100,
        ai_reports_open=reports_open,
        reviews_total=reviews_total,
    )


@router.get("/ai-reports", response_model=list[AiReportOut])
async def ai_reports(
    resolved: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    query = select(AiReport).order_by(AiReport.created_at.desc()).limit(100)
    query = query.where(
        AiReport.resolved_at.isnot(None) if resolved else AiReport.resolved_at.is_(None)
    )
    rows = await db.scalars(query)
    return [AiReportOut.model_validate(r) for r in rows]


@router.post("/ai-reports/{report_id}/resolve", response_model=MessageOut)
async def resolve_report(report_id: UUID, db: AsyncSession = Depends(get_db)):
    report = await db.get(AiReport, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    report.resolved_at = utcnow()
    await db.commit()
    return MessageOut(message="Resolved")


@router.get("/users", response_model=AdminUserPage)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    q: Optional[str] = Query(None, max_length=120),
    db: AsyncSession = Depends(get_db),
):
    now = utcnow()
    base = select(User).join(Profile, Profile.user_id == User.id)
    if q:
        needle = "%{}%".format(q.lower())
        base = base.where(
            or_(func.lower(User.email).like(needle), func.lower(Profile.display_name).like(needle))
        )
    total = int(await db.scalar(select(func.count()).select_from(base.subquery())) or 0)
    users = (
        await db.scalars(
            base.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        )
    ).unique().all()

    premium_ids = set(
        (
            await db.scalars(
                select(Subscription.user_id).where(
                    Subscription.user_id.in_([u.id for u in users]),
                    Subscription.status == "active",
                    Subscription.expires_at > now,
                )
            )
        ).all()
    )
    items = [
        AdminUserOut(
            id=u.id,
            email=u.email,
            display_name=u.profile.display_name,
            role=u.role,
            is_active=u.is_active,
            is_premium=u.id in premium_ids,
            created_at=u.created_at,
        )
        for u in users
    ]
    return AdminUserPage(items=items, total=total, page=page, page_size=page_size)


async def _get_user(db: AsyncSession, user_id: UUID, admin: User) -> User:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify yourself")
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/users/{user_id}/ban", response_model=MessageOut)
async def ban_user(
    user_id: UUID, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    user = await _get_user(db, user_id, admin)
    user.is_active = False
    await db.commit()
    return MessageOut(message="User banned")


@router.post("/users/{user_id}/unban", response_model=MessageOut)
async def unban_user(
    user_id: UUID, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    user = await _get_user(db, user_id, admin)
    user.is_active = True
    await db.commit()
    return MessageOut(message="User unbanned")


@router.post("/users/{user_id}/role", response_model=MessageOut)
async def set_role(
    user_id: UUID,
    payload: RoleUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_user(db, user_id, admin)
    user.role = payload.role
    await db.commit()
    return MessageOut(message="Role updated")
