"""What a completed Payment order actually grants — coins or subscription
time — dispatched purely by Payment.plan_code, so payme.py/click.py/uzum.py
each call one function instead of three near-duplicate branches."""
from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.billing import Payment
from app.services import coins, subscriptions
from app.services.plans import get_coin_pack, is_coin_pack_code


async def fulfill_order(
    db: AsyncSession,
    order: Payment,
    *,
    provider: str,
    external_subscription_id: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Call once a provider confirms an order is paid. Returns the granted
    Subscription for a plan purchase, or None for a coin-pack purchase
    (there's nothing subscription-shaped to hand back)."""
    if is_coin_pack_code(order.plan_code):
        pack = get_coin_pack(order.plan_code)
        if pack is None:
            raise ValueError(f"unknown coin pack {order.plan_code!r}")
        await coins.credit(
            db, order.user_id, pack.coins, reason="coin_pack_purchase", reference=str(order.id)
        )
        return None
    return await subscriptions.grant(
        db, order.user_id, order.plan_code, provider=provider,
        external_subscription_id=external_subscription_id,
    )
