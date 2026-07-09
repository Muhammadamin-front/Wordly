from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.billing import Payment
from app.models.user import User
from app.schemas.billing import (
    CheckoutOut,
    CheckoutRequest,
    MessageOut,
    PlanOut,
    PlansOut,
    ReferralOut,
    SandboxActivateRequest,
    SubscriptionOut,
)
from app.services import checkout, click, payme, referrals, subscriptions
from app.services.plans import PLANS, get_plan, som_to_tiyin

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


# --- Authenticated billing surface (the app itself) -------------------------
router = APIRouter(prefix="/billing", tags=["billing"], dependencies=[Depends(get_current_user)])


@router.get("/plans", response_model=PlansOut)
async def plans():
    return PlansOut(
        plans=[
            PlanOut(
                code=p.code, tier=p.tier, price_som=p.price_som,
                duration_days=p.duration_days, seats=p.seats,
            )
            for p in PLANS.values()
        ]
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
    )


@router.post("/checkout", response_model=CheckoutOut, status_code=status.HTTP_201_CREATED)
async def create_checkout(
    payload: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan = get_plan(payload.plan_code)
    if plan is None or plan.tier != "premium":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    order = Payment(
        user_id=user.id,
        provider=payload.provider,
        plan_code=plan.code,
        amount_tiyin=som_to_tiyin(plan.price_som),
        state=0,
    )
    db.add(order)
    await db.commit()

    return_url = payload.return_url or get_settings().FRONTEND_ORIGIN
    if payload.provider == "payme":
        url = checkout.payme_url(str(order.id), plan, return_url)
    else:
        url = checkout.click_url(str(order.id), plan, return_url)
    return CheckoutOut(order_id=str(order.id), checkout_url=url, amount_som=plan.price_som)


@router.post("/sandbox-activate", response_model=SubscriptionOut)
async def sandbox_activate(
    payload: SandboxActivateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dev/demo only: activate premium without a real gateway. Disabled in
    production via PAYMENTS_SANDBOX=false."""
    if not get_settings().PAYMENTS_SANDBOX:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sandbox disabled")
    plan = get_plan(payload.plan_code)
    if plan is None or plan.tier != "premium":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")
    sub = await subscriptions.grant(db, user.id, plan.code, provider="sandbox")
    await referrals.reward_on_first_payment(db, user.id)
    await db.commit()
    return SubscriptionOut(
        is_premium=True, plan_code=sub.plan_code, status=sub.status,
        provider=sub.provider, expires_at=sub.expires_at, seats=sub.seats,
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
