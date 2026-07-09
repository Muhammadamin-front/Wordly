"""Build hosted-checkout redirect URLs for Payme and Click."""
import base64
from urllib.parse import urlencode

from app.core.config import get_settings
from app.services.plans import Plan, som_to_tiyin


def payme_url(order_id: str, plan: Plan, return_url: str) -> str:
    """Payme takes a base64-encoded `m;ac.order_id;a;c` parameter string."""
    settings = get_settings()
    parts = "m={m};ac.order_id={oid};a={amount};c={callback}".format(
        m=settings.PAYME_MERCHANT_ID or "",
        oid=order_id,
        amount=som_to_tiyin(plan.price_som),
        callback=return_url,
    )
    encoded = base64.b64encode(parts.encode("utf-8")).decode("utf-8")
    return "{base}/{payload}".format(base=settings.PAYME_CHECKOUT_URL, payload=encoded)


def click_url(order_id: str, plan: Plan, return_url: str) -> str:
    settings = get_settings()
    query = urlencode(
        {
            "service_id": settings.CLICK_SERVICE_ID or "",
            "merchant_id": settings.CLICK_MERCHANT_ID or "",
            "amount": plan.price_som,
            "transaction_param": order_id,
            "return_url": return_url,
        }
    )
    return "{base}?{query}".format(base=settings.CLICK_CHECKOUT_URL, query=query)
