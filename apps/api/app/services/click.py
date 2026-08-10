"""Click Merchant API (Prepare / Complete).

Click POSTs form-encoded requests with an MD5 `sign_string`. We verify the
signature, drive the payment order state, and grant the subscription on a
successful Complete. Error codes follow Click's spec.
"""
import hashlib
import hmac
from uuid import UUID
from typing import Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import utcnow
from app.models.billing import Payment
from app.services import referrals, subscriptions

# Click error codes
SUCCESS = 0
ERR_SIGN = -1
ERR_AMOUNT = -2
ERR_ACTION = -3
ERR_ALREADY_PAID = -4
ERR_USER_NOT_FOUND = -5
ERR_TXN_NOT_FOUND = -6
ERR_CANCELLED = -9

ACTION_PREPARE = 0
ACTION_COMPLETE = 1


def _prepare_sign(p: Dict[str, str], secret: str) -> str:
    raw = "{click_trans_id}{service_id}{secret}{merchant_trans_id}{amount}{action}{sign_time}".format(
        click_trans_id=p.get("click_trans_id", ""),
        service_id=p.get("service_id", ""),
        secret=secret,
        merchant_trans_id=p.get("merchant_trans_id", ""),
        amount=p.get("amount", ""),
        action=p.get("action", ""),
        sign_time=p.get("sign_time", ""),
    )
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


def _complete_sign(p: Dict[str, str], secret: str) -> str:
    raw = (
        "{click_trans_id}{service_id}{secret}{merchant_trans_id}{merchant_prepare_id}"
        "{amount}{action}{sign_time}"
    ).format(
        click_trans_id=p.get("click_trans_id", ""),
        service_id=p.get("service_id", ""),
        secret=secret,
        merchant_trans_id=p.get("merchant_trans_id", ""),
        merchant_prepare_id=p.get("merchant_prepare_id", ""),
        amount=p.get("amount", ""),
        action=p.get("action", ""),
        sign_time=p.get("sign_time", ""),
    )
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


def make_prepare_sign(params: Dict[str, str]) -> str:  # exposed for tests
    return _prepare_sign(params, get_settings().CLICK_SECRET_KEY or "")


def make_complete_sign(params: Dict[str, str]) -> str:
    return _complete_sign(params, get_settings().CLICK_SECRET_KEY or "")


def _error(code: int, note: str) -> Dict:
    return {"error": code, "error_note": note}


async def _order(db: AsyncSession, merchant_trans_id: str) -> Payment:
    try:
        order_uuid = UUID(str(merchant_trans_id))
    except ValueError:
        return None
    return await db.scalar(
        select(Payment).where(Payment.id == order_uuid, Payment.provider == "click")
    )


async def prepare(db: AsyncSession, params: Dict[str, str]) -> Dict:
    settings = get_settings()
    if not settings.CLICK_SECRET_KEY:
        return _error(ERR_SIGN, "not configured")
    if not hmac.compare_digest(params.get("sign_string", ""), _prepare_sign(params, settings.CLICK_SECRET_KEY)):
        return _error(ERR_SIGN, "signature check failed")

    order = await _order(db, params.get("merchant_trans_id", ""))
    if order is None:
        return _error(ERR_USER_NOT_FOUND, "order not found")
    if order.state in (-1, -2):
        return _error(ERR_CANCELLED, "cancelled")
    if int(float(params.get("amount", 0)) * 100) != order.amount_tiyin:
        return _error(ERR_AMOUNT, "incorrect amount")

    transaction_id = params.get("click_trans_id")
    if order.provider_txn_id and order.provider_txn_id != transaction_id:
        return _error(ERR_TXN_NOT_FOUND, "transaction mismatch")
    if order.state == 1 and order.provider_txn_id == transaction_id:
        return {
            "error": SUCCESS,
            "error_note": "Success",
            "click_trans_id": transaction_id,
            "merchant_trans_id": params.get("merchant_trans_id"),
            "merchant_prepare_id": str(order.id),
        }
    order.provider_txn_id = transaction_id
    order.state = 1  # created/prepared
    order.status = "processing"
    order.create_time_ms = int(utcnow().timestamp() * 1000)
    await db.flush()
    await db.commit()
    return {
        "error": SUCCESS,
        "error_note": "Success",
        "click_trans_id": params.get("click_trans_id"),
        "merchant_trans_id": params.get("merchant_trans_id"),
        "merchant_prepare_id": str(order.id),
    }


async def complete(db: AsyncSession, params: Dict[str, str]) -> Dict:
    settings = get_settings()
    if not settings.CLICK_SECRET_KEY:
        return _error(ERR_SIGN, "not configured")
    if not hmac.compare_digest(params.get("sign_string", ""), _complete_sign(params, settings.CLICK_SECRET_KEY)):
        return _error(ERR_SIGN, "signature check failed")

    order = await _order(db, params.get("merchant_trans_id", ""))
    if order is None:
        return _error(ERR_USER_NOT_FOUND, "order not found")
    if order.state == 2:
        return _error(ERR_ALREADY_PAID, "already paid")

    if params.get("click_trans_id") != order.provider_txn_id:
        return _error(ERR_TXN_NOT_FOUND, "transaction mismatch")

    # A negative Click error in the request means the user cancelled.
    if int(params.get("error", 0)) < 0:
        order.state = -1
        order.status = "cancelled"
        await db.flush()
        await db.commit()
        return _error(ERR_CANCELLED, "cancelled")

    if order.state != 1:
        return _error(ERR_TXN_NOT_FOUND, "not prepared")

    order.state = 2
    order.status = "succeeded"
    order.perform_time_ms = int(utcnow().timestamp() * 1000)
    await subscriptions.grant(db, order.user_id, order.plan_code, provider="click")
    await referrals.reward_on_first_payment(db, order.user_id)
    await db.flush()
    await db.commit()
    return {
        "error": SUCCESS,
        "error_note": "Success",
        "click_trans_id": params.get("click_trans_id"),
        "merchant_trans_id": params.get("merchant_trans_id"),
        "merchant_confirm_id": str(order.id),
    }
