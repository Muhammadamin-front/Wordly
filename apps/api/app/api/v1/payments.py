import re
from typing import Optional
from urllib.parse import urljoin, urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.billing import Payment
from app.models.user import User
from app.schemas.billing import (
    BillingStatusOut,
    CheckoutOut,
    CheckoutRequest,
    MessageOut,
    PlanOut,
    PlansOut,
    ReferralOut,
    SandboxActivateRequest,
    SubscriptionOut,
)
from app.services import checkout, click, payme, referrals, subscriptions, uzum
from app.services.plans import SELLABLE_PLAN_CODES, Plan, get_plan, public_plans, som_to_tiyin

# --- Gateway callbacks (called by Payme/Click servers, not the browser) -----
gateway_router = APIRouter(prefix="/payments", tags=["payments"])


@gateway_router.post("/payme")
async def payme_endpoint(
    request: Request,
    authorization: str = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    body = await request.json()
    return await payme.handle(db, body, authorization)


@gateway_router.post("/click/prepare")
async def click_prepare(request: Request, db: AsyncSession = Depends(get_db)):
    form = dict((await request.form()))
    return await click.prepare(db, {k: str(v) for k, v in form.items()})


@gateway_router.post("/click/complete")
async def click_complete(request: Request, db: AsyncSession = Depends(get_db)):
    form = dict((await request.form()))
    return await click.complete(db, {k: str(v) for k, v in form.items()})


@gateway_router.post("/uzum/{webhook_secret}")
async def uzum_callback(
    webhook_secret: str, request: Request, db: AsyncSession = Depends(get_db)
):
    """Accept an Uzum notification only after a server-to-server status check."""
    return await uzum.handle_callback(db, await request.json(), webhook_secret)


# --- Authenticated billing surface (the app itself) -------------------------
router = APIRouter(prefix="/billing", tags=["billing"], dependencies=[Depends(get_current_user)])

IDEMPOTENCY_KEY_PATTERN = re.compile(r"^[A-Za-z0-9._-]{16,64}$")


def safe_return_url(requested_url: Optional[str]) -> str:
    """Only return learners to Vocora-controlled origins after provider checkout."""
    settings = get_settings()
    if not requested_url:
        return settings.FRONTEND_ORIGIN
    if requested_url.startswith("/") and not requested_url.startswith("//"):
        return urljoin(settings.FRONTEND_ORIGIN.rstrip("/") + "/", requested_url.lstrip("/"))
    parsed = urlparse(requested_url)
    origin = "{}://{}".format(parsed.scheme, parsed.netloc)
    if parsed.scheme not in {"http", "https"} or origin not in settings.cors_origins:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid return URL")
    return requested_url


@router.get("/plans", response_model=PlansOut)
async def plans():
    return PlansOut(
        plans=[
            PlanOut(
                code=p.code, tier=p.tier, price_som=p.price_som,
                duration_days=p.duration_days, seats=p.seats,
            )
            for p in public_plans()
        ]
    )


@router.get("/status", response_model=BillingStatusOut)
async def billing_status():
    settings = get_settings()
    providers = {
        "payme": settings.payme_enabled,
        "click": settings.click_enabled,
        "uzum": settings.uzum_enabled,
    }
    return BillingStatusOut(
        checkout_enabled=any(providers.values()),
        sandbox_enabled=settings.payment_sandbox_enabled,
        providers=providers,
        family_plan_available=False,
    )


@router.get("/subscription", response_model=SubscriptionOut)
async def subscription(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    sub = await subscriptions.active_subscription(db, user.id)
    if sub is None:
        return SubscriptionOut(is_premium=False)
    return SubscriptionOut(
        is_premium=True,
        plan_code=sub.plan_code,
        status=sub.status,
        provider=sub.provider,
        expires_at=sub.expires_at,
        seats=sub.seats,
        auto_renew=sub.auto_renew,
        cancelled_at=sub.cancelled_at,
    )


def _existing_checkout_response(
    existing: Payment, payload: CheckoutRequest, plan: Plan, return_url: Optional[str]
) -> CheckoutOut:
    if existing.provider != payload.provider or existing.plan_code != plan.code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key already belongs to a different checkout",
        )
    if existing.provider == "payme":
        url = checkout.payme_url(str(existing.id), plan, return_url)
    elif existing.provider == "click":
        url = checkout.click_url(str(existing.id), plan, return_url)
    elif existing.checkout_url:
        url = existing.checkout_url
    else:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Checkout registration is incomplete; start a new payment",
        )
    return CheckoutOut(order_id=str(existing.id), checkout_url=url, amount_som=plan.price_som)


@router.post("/checkout", response_model=CheckoutOut, status_code=status.HTTP_201_CREATED)
async def create_checkout(
    payload: CheckoutRequest,
    user: User = Depends(get_current_user),
    idempotency_key: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    plan = get_plan(payload.plan_code)
    if plan is None or plan.code not in SELLABLE_PLAN_CODES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    settings = get_settings()
    provider_enabled = {
        "payme": settings.payme_enabled,
        "click": settings.click_enabled,
        "uzum": settings.uzum_enabled,
    }[payload.provider]
    if not provider_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment provider is not configured",
        )

    key = idempotency_key.strip() if idempotency_key else None
    if key and not IDEMPOTENCY_KEY_PATTERN.fullmatch(key):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid idempotency key")

    return_url = safe_return_url(payload.return_url)
    if key:
        existing = await db.scalar(
            select(Payment).where(Payment.user_id == user.id, Payment.idempotency_key == key)
        )
        if existing is not None:
            return _existing_checkout_response(existing, payload, plan, return_url)

    order = Payment(
        user_id=user.id,
        provider=payload.provider,
        plan_code=plan.code,
        amount_tiyin=som_to_tiyin(plan.price_som),
        state=0,
        status="pending",
        idempotency_key=key,
    )
    db.add(order)
    if key:
        try:
            await db.commit()
        except IntegrityError:
            # Two concurrent requests with the same idempotency key (double
            # click, client auto-retry) can both pass the SELECT above before
            # either commits — the loser hits the unique constraint here
            # instead of crashing, it re-fetches the winner's row and returns
            # that checkout, exactly like the pre-existing branch above.
            await db.rollback()
            existing = await db.scalar(
                select(Payment).where(Payment.user_id == user.id, Payment.idempotency_key == key)
            )
            if existing is None:
                raise
            return _existing_checkout_response(existing, payload, plan, return_url)
    else:
        await db.commit()

    if payload.provider == "payme":
        url = checkout.payme_url(str(order.id), plan, return_url)
    elif payload.provider == "click":
        url = checkout.click_url(str(order.id), plan, return_url)
    else:
        try:
            registration = await uzum.register_checkout(
                order_id=str(order.id),
                user_id=str(user.id),
                plan=plan,
                return_url=return_url,
                locale=user.profile.ui_locale,
            )
        except uzum.UzumCheckoutError as exc:
            order.status = "failed"
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Uzum Checkout is temporarily unavailable",
            ) from exc
        order.provider_txn_id = registration.order_id
        order.checkout_url = registration.checkout_url
        await db.commit()
        url = registration.checkout_url
    return CheckoutOut(order_id=str(order.id), checkout_url=url, amount_som=plan.price_som)


@router.post("/sandbox-activate", response_model=SubscriptionOut)
async def sandbox_activate(
    payload: SandboxActivateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Development/test only: activate premium without a real gateway.
    Production disables this endpoint regardless of PAYMENTS_SANDBOX."""
    if not get_settings().payment_sandbox_enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sandbox disabled")
    plan = get_plan(payload.plan_code)
    if plan is None or plan.code not in SELLABLE_PLAN_CODES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")
    sub = await subscriptions.grant(db, user.id, plan.code, provider="sandbox")
    await referrals.reward_on_first_payment(db, user.id)
    await db.commit()
    return SubscriptionOut(
        is_premium=True, plan_code=sub.plan_code, status=sub.status,
        provider=sub.provider, expires_at=sub.expires_at, seats=sub.seats,
        auto_renew=sub.auto_renew, cancelled_at=sub.cancelled_at,
    )


@router.post("/cancel", response_model=MessageOut)
async def cancel_subscription(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    await subscriptions.cancel(db, user.id)
    await db.commit()
    return MessageOut(message="Subscription canceled")


@router.get("/referral", response_model=ReferralOut)
async def referral(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    code = await referrals.ensure_code(db, user)
    counts = await referrals.stats(db, user.id)
    await db.commit()
    return ReferralOut(
        code=code, invited=counts["invited"], rewarded=counts["rewarded"],
        reward_days=get_settings().REFERRAL_REWARD_DAYS,
    )
