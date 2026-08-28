"""Coin-pack catalog, checkout, provider fulfillment, and the wallet endpoint."""
import time

from app.core.config import get_settings
from tests.conftest import register_user
from tests.test_billing import payme_auth


async def learner(client, email="wallet@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_coin_packs_listed(client):
    body = (await client.get("/api/v1/billing/coin-packs")).json()
    codes = {p["code"] for p in body["packs"]}
    assert codes == {"coins_small", "coins_medium", "coins_large"}
    small = next(p for p in body["packs"] if p["code"] == "coins_small")
    assert small["coins"] == 300
    assert small["price_som"] == 9_000


async def test_wallet_starts_empty(client):
    headers = await learner(client)
    body = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert body == {"balance": 0, "recent_transactions": []}


async def test_wallet_requires_auth(client):
    assert (await client.get("/api/v1/billing/wallet")).status_code == 401


async def test_checkout_accepts_a_coin_pack_code(client):
    headers = await learner(client, email="checkout-coins@words.uz")
    settings = get_settings()
    settings.PAYME_MERCHANT_ID = "test_merchant"
    settings.PAYME_MERCHANT_KEY = "test_key"
    try:
        response = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "coins_medium", "provider": "payme"},
            headers=headers,
        )
        assert response.status_code == 201, response.text
        body = response.json()
        assert body["amount_som"] == 29_000
        assert body["order_id"]
    finally:
        settings.PAYME_MERCHANT_ID = None
        settings.PAYME_MERCHANT_KEY = None


async def test_checkout_rejects_unknown_plan_code(client):
    headers = await learner(client, email="checkout-bad@words.uz")
    settings = get_settings()
    settings.PAYME_MERCHANT_ID = "m"
    settings.PAYME_MERCHANT_KEY = "k"
    try:
        response = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "not_a_real_code", "provider": "payme"},
            headers=headers,
        )
        assert response.status_code == 400
    finally:
        settings.PAYME_MERCHANT_ID = None
        settings.PAYME_MERCHANT_KEY = None


async def test_payme_full_flow_credits_coins_not_a_subscription(client):
    settings = get_settings()
    settings.PAYME_MERCHANT_ID = "m"
    settings.PAYME_MERCHANT_KEY = "secret-key"
    auth = payme_auth("secret-key")
    try:
        headers = await learner(client, email="payme-coins@words.uz")
        checkout = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "coins_small", "provider": "payme"},
            headers=headers,
        )
        order_id = checkout.json()["order_id"]
        amount = 9_000 * 100  # tiyin

        txn = "payme_coins_txn_1"
        create = await client.post(
            "/api/v1/payments/payme",
            json={"id": 1, "method": "CreateTransaction",
                  "params": {"id": txn, "time": int(time.time() * 1000), "amount": amount,
                             "account": {"order_id": order_id}}},
            headers=auth,
        )
        assert create.json()["result"]["state"] == 1

        perform = await client.post(
            "/api/v1/payments/payme",
            json={"id": 2, "method": "PerformTransaction", "params": {"id": txn}},
            headers=auth,
        )
        assert perform.json()["result"]["state"] == 2

        # Coins landed in the wallet...
        wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
        assert wallet["balance"] == 300
        assert wallet["recent_transactions"][0]["reason"] == "coin_pack_purchase"
        assert wallet["recent_transactions"][0]["delta"] == 300

        # ...and no subscription was granted by a coin-pack purchase.
        sub = (await client.get("/api/v1/billing/subscription", headers=headers)).json()
        assert sub["is_premium"] is False
    finally:
        settings.PAYME_MERCHANT_KEY = None
        settings.PAYME_MERCHANT_ID = None
