from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin, require_super_admin, require_support
from app.core.roles import SUPER_ADMIN
from app.core.security import utcnow
from app.db.session import get_db
from app.models.ai import AiReport
from app.models.audit import AdminAuditLog
from app.models.billing import Payment, Subscription
from app.models.flashcards import Card, ReviewLog
from app.models.user import Profile, User
from app.schemas.admin import (
    AdminActionRequest,
    AdminAnalyticsOut,
    AdminAuditLogOut,
    AdminPaymentOut,
    AdminSubscriptionOut,
    AdminUserDetailOut,
    AdminUserOut,
    AdminUserPage,
    AiReportOut,
    MessageOut,
    RoleUpdate,
)
from app.services import auth as auth_service
from app.services.admin_audit import record_admin_action
from app.services.plans import get_plan

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics", response_model=AdminAnalyticsOut, dependencies=[Depends(require_admin)])
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


@router.get("/ai-reports", response_model=list[AiReportOut], dependencies=[Depends(require_admin)])
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
async def resolve_report(
    report_id: UUID,
    request: Request,
    payload: Optional[AdminActionRequest] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    report = await db.get(AiReport, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    previous_value = {"resolved": report.resolved_at is not None}
    report.resolved_at = utcnow()
    await record_admin_action(
        db,
        actor=admin,
        request=request,
        action="ai_report.resolve",
        target_type="ai_report",
        target_id=str(report.id),
        previous_value=previous_value,
        new_value={"resolved": True},
        reason=payload.reason if payload else None,
    )
    await db.commit()
    return MessageOut(message="Resolved")


@router.get("/users", response_model=AdminUserPage)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    q: Optional[str] = Query(None, max_length=120),
    _: User = Depends(require_support),
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


@router.get("/users/{user_id}", response_model=AdminUserDetailOut)
async def user_detail(
    user_id: UUID,
    _: User = Depends(require_support),
    db: AsyncSession = Depends(get_db),
):
    """Operational account view without exposing credentials or provider tokens."""
    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    now = utcnow()
    cards_total = int(
        await db.scalar(select(func.count(Card.id)).where(Card.user_id == user.id)) or 0
    )
    cards_due = int(
        await db.scalar(
            select(func.count(Card.id)).where(Card.user_id == user.id, Card.due_at <= now)
        )
        or 0
    )
    reviews_total = int(
        await db.scalar(select(func.count(ReviewLog.id)).where(ReviewLog.user_id == user.id)) or 0
    )
    latest_review_at = await db.scalar(
        select(func.max(ReviewLog.reviewed_at)).where(ReviewLog.user_id == user.id)
    )
    subscription = await db.scalar(
        select(Subscription)
        .where(Subscription.user_id == user.id)
        .order_by(Subscription.expires_at.desc())
        .limit(1)
    )
    payments = (
        await db.scalars(
            select(Payment)
            .where(Payment.user_id == user.id)
            .order_by(Payment.created_at.desc())
            .limit(5)
        )
    ).all()

    return AdminUserDetailOut(
        id=user.id,
        email=user.email,
        display_name=user.profile.display_name,
        role=user.role,
        is_active=user.is_active,
        is_premium=bool(subscription and subscription.status == "active" and subscription.expires_at > now),
        created_at=user.created_at,
        cefr_level=user.profile.cefr_level,
        learning_goal=user.profile.learning_goal,
        onboarding_completed=user.profile.onboarding_completed,
        cards_total=cards_total,
        cards_due=cards_due,
        reviews_total=reviews_total,
        latest_review_at=latest_review_at,
        subscription=(
            AdminSubscriptionOut(
                plan_code=subscription.plan_code,
                status=subscription.status,
                provider=subscription.provider,
                auto_renew=subscription.auto_renew,
                expires_at=subscription.expires_at,
            )
            if subscription
            else None
        ),
        payments=[
            AdminPaymentOut(
                id=payment.id,
                provider=payment.provider,
                plan_code=payment.plan_code,
                amount_tiyin=payment.amount_tiyin,
                state=payment.state,
                created_at=payment.created_at,
            )
            for payment in payments
        ],
    )


async def _get_user(db: AsyncSession, user_id: UUID, admin: User) -> User:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify yourself")
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role == SUPER_ADMIN and admin.role != SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify a super admin")
    return user


@router.post("/users/{user_id}/ban", response_model=MessageOut)
async def ban_user(
    user_id: UUID,
    request: Request,
    payload: Optional[AdminActionRequest] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_user(db, user_id, admin)
    previous_value = {"is_active": user.is_active}
    user.is_active = False
    await auth_service.revoke_all_user_sessions(db, user.id)
    await record_admin_action(
        db,
        actor=admin,
        request=request,
        action="user.suspend",
        target_type="user",
        target_id=str(user.id),
        previous_value=previous_value,
        new_value={"is_active": False},
        reason=payload.reason if payload else None,
    )
    await db.commit()
    return MessageOut(message="User suspended")


@router.post("/users/{user_id}/unban", response_model=MessageOut)
async def unban_user(
    user_id: UUID,
    request: Request,
    payload: Optional[AdminActionRequest] = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_user(db, user_id, admin)
    previous_value = {"is_active": user.is_active}
    user.is_active = True
    await record_admin_action(
        db,
        actor=admin,
        request=request,
        action="user.reactivate",
        target_type="user",
        target_id=str(user.id),
        previous_value=previous_value,
        new_value={"is_active": True},
        reason=payload.reason if payload else None,
    )
    await db.commit()
    return MessageOut(message="User reactivated")


@router.post("/users/{user_id}/role", response_model=MessageOut)
async def set_role(
    user_id: UUID,
    payload: RoleUpdate,
    request: Request,
    admin: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await _get_user(db, user_id, admin)
    if user.role == SUPER_ADMIN and payload.role != SUPER_ADMIN:
        super_admins = int(
            await db.scalar(select(func.count(User.id)).where(User.role == SUPER_ADMIN)) or 0
        )
        if super_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="At least one super admin must remain",
            )
    previous_value = {"role": user.role}
    user.role = payload.role
    await record_admin_action(
        db,
        actor=admin,
        request=request,
        action="user.role_change",
        target_type="user",
        target_id=str(user.id),
        previous_value=previous_value,
        new_value={"role": user.role},
        reason=payload.reason,
    )
    await db.commit()
    return MessageOut(message="Role updated")


@router.get("/audit-logs", response_model=list[AdminAuditLogOut], dependencies=[Depends(require_admin)])
async def audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(select(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(limit))
    return [
        AdminAuditLogOut(
            id=row.id,
            actor_id=row.actor_id,
            actor_email=row.actor.email if row.actor else None,
            action=row.action,
            target_type=row.target_type,
            target_id=row.target_id,
            previous_value=row.previous_value,
            new_value=row.new_value,
            reason=row.reason,
            created_at=row.created_at,
        )
        for row in rows
    ]
