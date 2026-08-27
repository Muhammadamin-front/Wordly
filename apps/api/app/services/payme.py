"""Payme Merchant API (JSON-RPC 2.0).

Payme's servers call our single endpoint with CheckPerformTransaction,
CreateTransaction, PerformTransaction, CancelTransaction, CheckTransaction, and
GetStatement. We validate against a pending `Payment` order (created at checkout,
identified by account[order_id]) and drive its state machine. Amounts are in
tiyin. See docs/milestones/M7.md for the flow.
"""
import base64
import hmac
import time
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.billing import Payment
from app.services import referrals, subscriptions

# Payme error codes
ERR_AUTH = -32504
ERR_METHOD = -32601
ERR_INVALID_PARAMS = -32602
ERR_AMOUNT = -31001
ERR_ACCOUNT = -31050  # order not found / invalid
ERR_TXN_NOT_FOUND = -31003
ERR_CANT_PERFORM = -31008
ERR_ALREADY_DONE = -31060

# Payment states
PENDING = 0
CREATED = 1
PERFORMED = 2
CANCELLED = -1
CANCELLED_AFTER_PERFORM = -2


class PaymeError(Exception):
    def __init__(self, code: int, message: str = "", data: Optional[str] = None):
        self.code = code
        self.message = message or "error"
        self.data = data


def _now_ms() -> int:
    return int(time.time() * 1000)


def check_auth(authorization: Optional[str]) -> None:
    """Payme sends HTTP Basic 'Paycom:<merchant_key>'."""
    settings = get_settings()
    if not settings.PAYME_MERCHANT_KEY:
        raise PaymeError(ERR_AUTH, "merchant not configured")
    if not authorization or not authorization.startswith("Basic "):
        raise PaymeError(ERR_AUTH, "authorization required")
    try:
        decoded = base64.b64decode(authorization[6:]).decode("utf-8")
    except Exception:
        raise PaymeError(ERR_AUTH, "bad authorization")
    login, separator, key = decoded.partition(":")
    if login != "Paycom" or not separator or not hmac.compare_digest(key, settings.PAYME_MERCHANT_KEY):
        raise PaymeError(ERR_AUTH, "invalid merchant key")


async def _load_order(db: AsyncSession, params: Dict[str, Any]) -> Payment:
    account = params.get("account") or {}
    order_id = account.get("order_id")
    if not order_id:
        raise PaymeError(ERR_ACCOUNT, "order_id required", data="order_id")
    try:
        order_uuid = UUID(str(order_id))
    except ValueError:
        raise PaymeError(ERR_ACCOUNT, "invalid order_id", data="order_id")
    # Locks the row for the rest of this request's transaction so two
    # near-simultaneous callbacks for the same order (Payme retries on
    # timeout) can't both read pending state and both perform it — mirrors
    # services/uzum.py's handle_callback, which has the same requirement.
    order = await db.scalar(select(Payment).where(Payment.id == order_uuid).with_for_update())
    if order is None or order.provider != "payme":
        raise PaymeError(ERR_ACCOUNT, "order not found", data="order_id")
    return order


async def _by_txn(db: AsyncSession, params: Dict[str, Any]) -> Payment:
    txn_id = params.get("id")
    if not txn_id:
        raise PaymeError(ERR_INVALID_PARAMS, "id required", data="id")
    order = await db.scalar(
        select(Payment)
        .where(Payment.provider == "payme", Payment.provider_txn_id == txn_id)
        .with_for_update()
    )
    if order is None:
        raise PaymeError(ERR_TXN_NOT_FOUND, "transaction not found")
    return order


def _amount_tiyin(params: Dict[str, Any]) -> int:
    """Payme's amount arrives as a JSON number, but the public webhook accepts
    arbitrary input — a non-numeric value must fail as a clean Payme protocol
    error, not an uncaught ValueError/TypeError -> generic 500."""
    try:
        return int(params.get("amount", 0))
    except (TypeError, ValueError):
        raise PaymeError(ERR_AMOUNT, "incorrect amount")


async def check_perform(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    order = await _load_order(db, params)
    if _amount_tiyin(params) != order.amount_tiyin:
        raise PaymeError(ERR_AMOUNT, "incorrect amount")
    if order.state != PENDING:
        raise PaymeError(ERR_CANT_PERFORM, "order already processed")
    return {"allow": True}


async def create_transaction(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    order = await _load_order(db, params)
    txn_id = params.get("id")
    if not txn_id:
        raise PaymeError(ERR_INVALID_PARAMS, "id required", data="id")

    if order.provider_txn_id == txn_id:  # idempotent retry
        if order.state != CREATED:
            raise PaymeError(ERR_CANT_PERFORM, "order in wrong state")
        return {"create_time": order.create_time_ms, "transaction": str(order.id), "state": CREATED}

    if order.state != PENDING:
        raise PaymeError(ERR_CANT_PERFORM, "order already has a transaction")
    if _amount_tiyin(params) != order.amount_tiyin:
        raise PaymeError(ERR_AMOUNT, "incorrect amount")

    order.provider_txn_id = txn_id
    order.state = CREATED
    order.status = "processing"
    order.create_time_ms = _now_ms()
    await db.flush()
    return {"create_time": order.create_time_ms, "transaction": str(order.id), "state": CREATED}


async def perform_transaction(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    order = await _by_txn(db, params)
    if order.state == PERFORMED:  # idempotent
        return {"perform_time": order.perform_time_ms, "transaction": str(order.id), "state": PERFORMED}
    if order.state != CREATED:
        raise PaymeError(ERR_CANT_PERFORM, "cannot perform in current state")

    order.state = PERFORMED
    order.status = "succeeded"
    order.perform_time_ms = _now_ms()
    await subscriptions.grant(db, order.user_id, order.plan_code, provider="payme")
    await referrals.reward_on_first_payment(db, order.user_id)
    await db.flush()
    return {"perform_time": order.perform_time_ms, "transaction": str(order.id), "state": PERFORMED}


async def cancel_transaction(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    order = await _by_txn(db, params)
    reason = params.get("reason")
    if order.state in (CANCELLED, CANCELLED_AFTER_PERFORM):  # idempotent
        return {"cancel_time": order.cancel_time_ms, "transaction": str(order.id), "state": order.state}

    new_state = CANCELLED_AFTER_PERFORM if order.state == PERFORMED else CANCELLED
    if order.state == PERFORMED:
        # Reverse the entitlement granted at perform time.
        await subscriptions.cancel(db, order.user_id, revoke_now=True)
    order.state = new_state
    order.status = "refunded" if new_state == CANCELLED_AFTER_PERFORM else "cancelled"
    order.cancel_time_ms = _now_ms()
    order.cancel_reason = reason
    await db.flush()
    return {"cancel_time": order.cancel_time_ms, "transaction": str(order.id), "state": new_state}


async def check_transaction(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    order = await _by_txn(db, params)
    return {
        "create_time": order.create_time_ms or 0,
        "perform_time": order.perform_time_ms or 0,
        "cancel_time": order.cancel_time_ms or 0,
        "transaction": str(order.id),
        "state": order.state,
        "reason": order.cancel_reason,
    }


async def get_statement(db: AsyncSession, params: Dict[str, Any]) -> Dict[str, Any]:
    frm = int(params.get("from", 0))
    to = int(params.get("to", _now_ms()))
    rows = await db.scalars(
        select(Payment).where(
            Payment.provider == "payme",
            Payment.create_time_ms.isnot(None),
            Payment.create_time_ms >= frm,
            Payment.create_time_ms <= to,
        )
    )
    transactions = [
        {
            "id": p.provider_txn_id,
            "time": p.create_time_ms,
            "amount": p.amount_tiyin,
            "account": {"order_id": str(p.id)},
            "create_time": p.create_time_ms or 0,
            "perform_time": p.perform_time_ms or 0,
            "cancel_time": p.cancel_time_ms or 0,
            "transaction": str(p.id),
            "state": p.state,
            "reason": p.cancel_reason,
        }
        for p in rows
    ]
    return {"transactions": transactions}


_METHODS = {
    "CheckPerformTransaction": check_perform,
    "CreateTransaction": create_transaction,
    "PerformTransaction": perform_transaction,
    "CancelTransaction": cancel_transaction,
    "CheckTransaction": check_transaction,
    "GetStatement": get_statement,
}


async def handle(db: AsyncSession, body: Dict[str, Any], authorization: Optional[str]) -> Dict[str, Any]:
    """Dispatch a JSON-RPC request. Returns a JSON-RPC response dict."""
    request_id = body.get("id")
    try:
        check_auth(authorization)
        method = body.get("method")
        handler = _METHODS.get(method)
        if handler is None:
            raise PaymeError(ERR_METHOD, "method not found")
        result = await handler(db, body.get("params") or {})
        await db.commit()
        return {"jsonrpc": "2.0", "id": request_id, "result": result}
    except PaymeError as exc:
        await db.rollback()
        error: Dict[str, Any] = {"code": exc.code, "message": exc.message}
        if exc.data is not None:
            error["data"] = exc.data
        return {"jsonrpc": "2.0", "id": request_id, "error": error}
