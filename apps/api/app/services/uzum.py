"""Uzum Checkout hosted-payment integration.

Card details are entered only on Uzum's hosted page. Callback payloads are
treated as notifications, not proof of payment: before granting an entitlement
we re-read the order status from Uzum with the server-only terminal/API keys.
"""
from dataclasses import dataclass
import hmac
from typing import Any, Dict, Optional
from uuid import UUID

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.billing import Payment
from app.services import referrals, subscriptions
from app.services.plans import Plan, som_to_tiyin


class UzumCheckoutError(Exception):
    """A remote Uzum response was unavailable, malformed, or unsuccessful."""


@dataclass(frozen=True)
class Registration:
    order_id: str
    checkout_url: str


def _locale(value: str) -> str:
    return {"uz": "uz-UZ", "ru": "ru-RU", "en": "en-EN"}.get(value, "uz-UZ")


async def _post(path: str, payload: Dict[str, Any], language: str) -> Dict[str, Any]:
    settings = get_settings()
    if not settings.uzum_enabled:
        raise UzumCheckoutError("Uzum Checkout is not configured")
    headers = {
        "X-Terminal-Id": settings.UZUM_TERMINAL_ID or "",
        "X-API-Key": settings.UZUM_API_KEY or "",
        "Content-Language": language,
    }
    url = "{}/{}".format(settings.UZUM_API_BASE_URL.rstrip("/"), path.lstrip("/"))
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            body = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise UzumCheckoutError("Uzum Checkout could not be reached") from exc
    if not isinstance(body, dict) or body.get("errorCode") not in (0, "0", None):
        raise UzumCheckoutError(str(body.get("message") if isinstance(body, dict) else "Invalid Uzum response"))
    result = body.get("result")
    if not isinstance(result, dict):
        raise UzumCheckoutError("Uzum Checkout returned no result")
    return result


async def register_checkout(
    *, order_id: str, user_id: str, plan: Plan, return_url: str, locale: str
) -> Registration:
    result = await _post(
        "/payment/register",
        {
            "amount": som_to_tiyin(plan.price_som),
            "clientId": user_id,
            "currency": 860,
            "paymentDetails": "Vocora {}".format(plan.code),
            "orderNumber": order_id,
            "successUrl": return_url,
            "failureUrl": return_url,
            "viewType": "REDIRECT",
            "paymentParams": {"operationType": "PAYMENT", "payType": "ONE_STEP", "force3ds": True},
            "sessionTimeoutSecs": 600,
        },
        _locale(locale),
    )
    remote_order_id = result.get("orderId")
    checkout_url = result.get("paymentRedirectUrl")
    if not isinstance(remote_order_id, str) or not remote_order_id or not isinstance(checkout_url, str) or not checkout_url.startswith("https://"):
        raise UzumCheckoutError("Uzum Checkout returned an invalid payment URL")
    return Registration(order_id=remote_order_id, checkout_url=checkout_url)


async def order_status(order_id: str) -> Dict[str, Any]:
    return await _post("/payment/getOrderStatus", {"orderId": order_id}, "uz-UZ")


def _remote_amount(result: Dict[str, Any]) -> Optional[int]:
    for key in ("amount", "totalAmount", "completedAmount"):
        value = result.get(key)
        if value is None:
            continue
        try:
            return int(value)
        except (TypeError, ValueError):
            raise UzumCheckoutError("Uzum Checkout returned an invalid amount")
    return None


async def handle_callback(db: AsyncSession, payload: Dict[str, Any], webhook_secret: str) -> Dict[str, bool]:
    """Reconcile a remote order after an Uzum callback.

    The callback body is deliberately never enough to activate a plan. Its
    order ID is used only to make a privileged status request back to Uzum.
    """
    settings = get_settings()
    configured_secret = settings.UZUM_WEBHOOK_SECRET
    if not configured_secret or not hmac.compare_digest(webhook_secret, configured_secret):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    remote_order_id = payload.get("orderId")
    if not isinstance(remote_order_id, str) or not remote_order_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Uzum order ID")

    order = await db.scalar(
        select(Payment)
        .where(Payment.provider == "uzum", Payment.provider_txn_id == remote_order_id)
        # Serialise duplicate gateway deliveries for this order. Without this,
        # two nearly simultaneous COMPLETED callbacks could both see pending
        # state and extend the same entitlement twice.
        .with_for_update()
    )
    if order is None:
        # The remote service identifies our order with `orderNumber`; accept a
        # callback that arrived between registration and local persistence only
        # after the remote status response proves both IDs belong together.
        local_id = payload.get("orderNumber")
        try:
            order_uuid = UUID(str(local_id))
        except (ValueError, TypeError):
            return {"accepted": True}
        order = await db.scalar(
            select(Payment)
            .where(Payment.id == order_uuid, Payment.provider == "uzum")
            .with_for_update()
        )
        if order is None:
            return {"accepted": True}

    try:
        remote = await order_status(remote_order_id)
    except UzumCheckoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify Uzum payment",
        ) from exc

    if remote.get("orderId") != remote_order_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Uzum order mismatch")
    merchant_order_id = remote.get("merchantOrderId")
    if merchant_order_id is not None and str(merchant_order_id) != str(order.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Uzum merchant order mismatch")
    amount = _remote_amount(remote)
    if amount is not None and amount != order.amount_tiyin:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Uzum payment amount mismatch")

    remote_state = str(remote.get("status") or "").upper()
    order.provider_txn_id = remote_order_id
    if remote_state == "COMPLETED":
        if order.status != "succeeded":
            order.state = 2
            order.status = "succeeded"
            subscription = await subscriptions.grant(
                db,
                order.user_id,
                order.plan_code,
                provider="uzum",
                external_subscription_id=remote_order_id,
            )
            # Keep the transaction link on the entitlement so a later refund
            # can only revoke access granted by this exact payment.
            subscription.external_subscription_id = remote_order_id
            await referrals.reward_on_first_payment(db, order.user_id)
    elif remote_state in {"DECLINED", "CANCELLED", "REVERSED"}:
        order.state = -1
        order.status = "failed"
    elif remote_state == "REFUNDED":
        order.state = -2
        order.status = "refunded"
        active = await subscriptions.active_subscription(db, order.user_id)
        if active and active.provider == "uzum" and active.external_subscription_id == remote_order_id:
            await subscriptions.cancel(db, order.user_id, revoke_now=True)

    await db.commit()
    return {"accepted": True}
