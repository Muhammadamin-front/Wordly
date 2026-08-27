import base64
import time

from app.core.config import get_settings
from tests.conftest import register_user


async def learner(client, email="buyer@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_plans_listed(client):
    body = (await client.get("/api/v1/billing/plans")).json()
    codes = {p["code"] for p in body["plans"]}
    assert codes == {"free", "premium_monthly", "premium_yearly"}
    monthly = next(p for p in body["plans"] if p["code"] == "premium_monthly")
    assert monthly["price_som"] == 29000


async def test_public_billing_catalog_keeps_account_actions_protected(client):
    assert (await client.get("/api/v1/billing/plans")).status_code == 200
    assert (await client.get("/api/v1/billing/status")).status_code == 200
    assert (await client.get("/api/v1/billing/subscription")).status_code == 401
    assert (await client.post("/api/v1/billing/cancel")).status_code == 401


async def test_new_user_is_not_premium(client):
    headers = await learner(client)
    sub = (await client.get("/api/v1/billing/subscription", headers=headers)).json()
    assert sub["is_premium"] is False


async def test_sandbox_activation_grants_premium(client):
    headers = await learner(client)
    activated = await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )
    assert activated.status_code == 200
    assert activated.json()["is_premium"] is True

    sub = (await client.get("/api/v1/billing/subscription", headers=headers)).json()
    assert sub["is_premium"] is True
    assert sub["plan_code"] == "premium_monthly"


async def test_premium_raises_ai_quota(client):
    headers = await learner(client)
    before = (await client.get("/api/v1/ai/quota", headers=headers)).json()
    assert before["daily_quota"] == 5
    await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_yearly"}, headers=headers
    )
    after = (await client.get("/api/v1/ai/quota", headers=headers)).json()
    assert after["daily_quota"] == get_settings().AI_PREMIUM_DAILY_QUOTA


async def test_checkout_creates_order_and_url(client):
    headers = await learner(client)
    settings = get_settings()
    settings.PAYME_MERCHANT_ID = "test_merchant"
    settings.PAYME_MERCHANT_KEY = "test_key"
    try:
        response = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "payme"},
            headers=headers,
        )
        assert response.status_code == 201, response.text
        body = response.json()
        assert body["amount_som"] == 29000
        assert body["checkout_url"].startswith(settings.PAYME_CHECKOUT_URL)
        assert body["order_id"]
    finally:
        settings.PAYME_MERCHANT_ID = None
        settings.PAYME_MERCHANT_KEY = None


async def test_checkout_idempotency_and_safe_return_urls(client):
    headers = await learner(client, email="idempotent@words.uz")
    settings = get_settings()
    settings.PAYME_MERCHANT_ID = "test_merchant"
    settings.PAYME_MERCHANT_KEY = "test_key"
    key = "checkout-idempotency-key-0001"
    try:
        first = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "payme", "return_url": "/uz/pricing"},
            headers={**headers, "Idempotency-Key": key},
        )
        second = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "payme", "return_url": "/uz/pricing"},
            headers={**headers, "Idempotency-Key": key},
        )
        assert first.status_code == second.status_code == 201
        assert first.json()["order_id"] == second.json()["order_id"]

        unsafe = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "payme", "return_url": "https://attacker.example"},
            headers=headers,
        )
        assert unsafe.status_code == 400
    finally:
        settings.PAYME_MERCHANT_ID = None
        settings.PAYME_MERCHANT_KEY = None


async def test_user_cancellation_keeps_access_until_expiry(client):
    headers = await learner(client, email="cancelled@words.uz")
    await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )
    canceled = await client.post("/api/v1/billing/cancel", headers=headers)
    assert canceled.status_code == 200
    subscription = (await client.get("/api/v1/billing/subscription", headers=headers)).json()
    assert subscription["is_premium"] is True
    assert subscription["auto_renew"] is False
    assert subscription["cancelled_at"] is not None


async def test_billing_status_and_unconfigured_checkout(client):
    headers = await learner(client)
    status_response = await client.get("/api/v1/billing/status", headers=headers)
    assert status_response.status_code == 200
    assert status_response.json() == {
        "checkout_enabled": False,
        "sandbox_enabled": True,
        "providers": {"payme": False, "click": False, "uzum": False},
        "family_plan_available": False,
    }

    checkout_response = await client.post(
        "/api/v1/billing/checkout",
        json={"plan_code": "premium_monthly", "provider": "payme"},
        headers=headers,
    )
    assert checkout_response.status_code == 503

    import app.db.session as db_session
    from sqlalchemy import func, select
    from app.models.billing import Payment

    async with db_session.get_session_factory()() as session:
        payment_count = await session.scalar(select(func.count(Payment.id)))
    assert payment_count == 0


# --- Uzum Checkout ----------------------------------------------------------


async def test_uzum_checkout_registers_hosted_page_and_reuses_idempotency(client, monkeypatch):
    from app.services import uzum

    settings = get_settings()
    settings.UZUM_TERMINAL_ID = "terminal-1"
    settings.UZUM_API_KEY = "api-key-1"
    settings.UZUM_WEBHOOK_SECRET = "callback-token-which-is-long"
    calls = []

    async def fake_post(path, payload, language):
        calls.append((path, payload, language))
        return {"orderId": "uzum-order-1", "paymentRedirectUrl": "https://checkout.example.uz/pay/1"}

    monkeypatch.setattr(uzum, "_post", fake_post)
    key = "uzum-idempotency-key-000001"
    try:
        headers = await learner(client, email="uzum-buyer@words.uz")
        first = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "uzum", "return_url": "/uz/billing"},
            headers={**headers, "Idempotency-Key": key},
        )
        second = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "uzum", "return_url": "/uz/billing"},
            headers={**headers, "Idempotency-Key": key},
        )
        assert first.status_code == second.status_code == 201
        assert first.json()["order_id"] == second.json()["order_id"]
        assert first.json()["checkout_url"] == "https://checkout.example.uz/pay/1"
        assert len(calls) == 1
        path, payload, language = calls[0]
        assert path == "/payment/register"
        assert payload["amount"] == 2_900_000
        assert payload["orderNumber"] == first.json()["order_id"]
        assert payload["paymentParams"] == {"operationType": "PAYMENT", "payType": "ONE_STEP", "force3ds": True}
        assert language == "uz-UZ"
    finally:
        settings.UZUM_TERMINAL_ID = None
        settings.UZUM_API_KEY = None
        settings.UZUM_WEBHOOK_SECRET = None


async def test_uzum_callback_verifies_remote_completion_before_granting(client, monkeypatch):
    from app.services import uzum

    settings = get_settings()
    settings.UZUM_TERMINAL_ID = "terminal-1"
    settings.UZUM_API_KEY = "api-key-1"
    settings.UZUM_WEBHOOK_SECRET = "callback-token-which-is-long"
    order_id = ""
    verify_calls = 0

    async def fake_post(path, payload, language):
        nonlocal verify_calls
        if path == "/payment/register":
            return {"orderId": "uzum-order-2", "paymentRedirectUrl": "https://checkout.example.uz/pay/2"}
        assert path == "/payment/getOrderStatus"
        verify_calls += 1
        assert payload == {"orderId": "uzum-order-2"}
        return {
            "orderId": "uzum-order-2",
            "merchantOrderId": order_id,
            "status": "COMPLETED",
            "amount": 2_900_000,
        }

    monkeypatch.setattr(uzum, "_post", fake_post)
    try:
        headers = await learner(client, email="uzum-complete@words.uz")
        checkout = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "uzum"},
            headers=headers,
        )
        order_id = checkout.json()["order_id"]
        callback = await client.post(
            "/api/v1/payments/uzum/callback-token-which-is-long",
            json={"orderId": "uzum-order-2", "orderNumber": order_id, "operationState": "SUCCESS"},
        )
        assert callback.status_code == 200
        assert (await client.get("/api/v1/billing/subscription", headers=headers)).json()["provider"] == "uzum"

        # Replayed gateway callbacks never add a second paid period.
        repeated = await client.post(
            "/api/v1/payments/uzum/callback-token-which-is-long",
            json={"orderId": "uzum-order-2", "orderNumber": order_id, "operationState": "SUCCESS"},
        )
        assert repeated.status_code == 200
        assert verify_calls == 2
    finally:
        settings.UZUM_TERMINAL_ID = None
        settings.UZUM_API_KEY = None
        settings.UZUM_WEBHOOK_SECRET = None


async def test_uzum_declined_payment_never_grants_premium_even_with_success_callback(client, monkeypatch):
    """A browser/callback claim is irrelevant when Uzum reports a declined card."""
    from app.services import uzum

    settings = get_settings()
    settings.UZUM_TERMINAL_ID = "terminal-1"
    settings.UZUM_API_KEY = "api-key-1"
    settings.UZUM_WEBHOOK_SECRET = "callback-token-which-is-long"
    order_id = ""

    async def fake_post(path, payload, language):
        if path == "/payment/register":
            return {"orderId": "uzum-order-declined", "paymentRedirectUrl": "https://checkout.example.uz/pay/declined"}
        assert path == "/payment/getOrderStatus"
        return {
            "orderId": "uzum-order-declined",
            "merchantOrderId": order_id,
            "status": "DECLINED",
            "amount": 2_900_000,
        }

    monkeypatch.setattr(uzum, "_post", fake_post)
    try:
        headers = await learner(client, email="uzum-declined@words.uz")
        checkout = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "uzum"},
            headers=headers,
        )
        order_id = checkout.json()["order_id"]
        callback = await client.post(
            "/api/v1/payments/uzum/callback-token-which-is-long",
            # This is deliberately a forged/optimistic callback state. The
            # remote server-to-server status still decides entitlement.
            json={"orderId": "uzum-order-declined", "orderNumber": order_id, "operationState": "SUCCESS"},
        )
        assert callback.status_code == 200
        assert (await client.get("/api/v1/billing/subscription", headers=headers)).json()["is_premium"] is False
    finally:
        settings.UZUM_TERMINAL_ID = None
        settings.UZUM_API_KEY = None
        settings.UZUM_WEBHOOK_SECRET = None


async def test_uzum_callback_rejects_amount_mismatch_without_granting(client, monkeypatch):
    from app.services import uzum

    settings = get_settings()
    settings.UZUM_TERMINAL_ID = "terminal-1"
    settings.UZUM_API_KEY = "api-key-1"
    settings.UZUM_WEBHOOK_SECRET = "callback-token-which-is-long"
    order_id = ""

    async def fake_post(path, payload, language):
        if path == "/payment/register":
            return {"orderId": "uzum-order-3", "paymentRedirectUrl": "https://checkout.example.uz/pay/3"}
        return {
            "orderId": "uzum-order-3",
            "merchantOrderId": order_id,
            "status": "COMPLETED",
            "amount": 100,
        }

    monkeypatch.setattr(uzum, "_post", fake_post)
    try:
        headers = await learner(client, email="uzum-amount@words.uz")
        checkout = await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "uzum"},
            headers=headers,
        )
        order_id = checkout.json()["order_id"]
        callback = await client.post(
            "/api/v1/payments/uzum/callback-token-which-is-long",
            json={"orderId": "uzum-order-3", "orderNumber": order_id},
        )
        assert callback.status_code == 409
        assert (await client.get("/api/v1/billing/subscription", headers=headers)).json()["is_premium"] is False
    finally:
        settings.UZUM_TERMINAL_ID = None
        settings.UZUM_API_KEY = None
        settings.UZUM_WEBHOOK_SECRET = None


async def test_sandbox_is_always_disabled_in_production(client):
    headers = await learner(client)
    settings = get_settings()
    original_environment = settings.ENVIRONMENT
    settings.ENVIRONMENT = "production"
    try:
        response = await client.post(
            "/api/v1/billing/sandbox-activate",
            json={"plan_code": "premium_monthly"},
            headers=headers,
        )
        assert response.status_code == 403
    finally:
        settings.ENVIRONMENT = original_environment


async def test_family_plan_is_not_for_sale(client):
    headers = await learner(client)
    response = await client.post(
        "/api/v1/billing/sandbox-activate",
        json={"plan_code": "family"},
        headers=headers,
    )
    assert response.status_code == 400


# --- Payme JSON-RPC (simulate the gateway calling our endpoint) -------------

def payme_auth(key: str) -> dict:
    token = base64.b64encode("Paycom:{}".format(key).encode()).decode()
    return {"Authorization": "Basic " + token}


async def _make_order(client, headers, provider="payme") -> tuple[str, int]:
    settings = get_settings()
    settings.PAYME_MERCHANT_ID = "m"
    response = await client.post(
        "/api/v1/billing/checkout",
        json={"plan_code": "premium_monthly", "provider": provider},
        headers=headers,
    )
    body = response.json()
    return body["order_id"], 29000 * 100  # tiyin


async def test_payme_rejects_bad_auth(client):
    settings = get_settings()
    settings.PAYME_MERCHANT_KEY = "secret-key"
    try:
        response = await client.post(
            "/api/v1/payments/payme",
            json={"id": 1, "method": "CheckPerformTransaction", "params": {}},
            headers={"Authorization": "Basic " + base64.b64encode(b"Paycom:wrong").decode()},
        )
        assert response.json()["error"]["code"] == -32504
    finally:
        settings.PAYME_MERCHANT_KEY = None
        settings.PAYME_MERCHANT_ID = None


async def test_payme_full_flow_activates_subscription(client):
    settings = get_settings()
    settings.PAYME_MERCHANT_KEY = "secret-key"
    auth = payme_auth("secret-key")
    try:
        headers = await learner(client)
        order_id, amount = await _make_order(client, headers)

        check = await client.post(
            "/api/v1/payments/payme",
            json={"id": 1, "method": "CheckPerformTransaction",
                  "params": {"amount": amount, "account": {"order_id": order_id}}},
            headers=auth,
        )
        assert check.json()["result"] == {"allow": True}

        txn = "payme_txn_1"
        create = await client.post(
            "/api/v1/payments/payme",
            json={"id": 2, "method": "CreateTransaction",
                  "params": {"id": txn, "time": int(time.time() * 1000), "amount": amount,
                             "account": {"order_id": order_id}}},
            headers=auth,
        )
        assert create.json()["result"]["state"] == 1

        perform = await client.post(
            "/api/v1/payments/payme",
            json={"id": 3, "method": "PerformTransaction", "params": {"id": txn}},
            headers=auth,
        )
        assert perform.json()["result"]["state"] == 2

        # Subscription is now active for the buyer.
        sub = (await client.get("/api/v1/billing/subscription", headers=headers)).json()
        assert sub["is_premium"] is True
        assert sub["provider"] == "payme"

        # CheckTransaction reports performed.
        check2 = await client.post(
            "/api/v1/payments/payme",
            json={"id": 4, "method": "CheckTransaction", "params": {"id": txn}},
            headers=auth,
        )
        assert check2.json()["result"]["state"] == 2
    finally:
        settings.PAYME_MERCHANT_KEY = None
        settings.PAYME_MERCHANT_ID = None


async def test_payme_wrong_amount_rejected(client):
    settings = get_settings()
    settings.PAYME_MERCHANT_KEY = "secret-key"
    auth = payme_auth("secret-key")
    try:
        headers = await learner(client)
        order_id, _ = await _make_order(client, headers)
        response = await client.post(
            "/api/v1/payments/payme",
            json={"id": 1, "method": "CheckPerformTransaction",
                  "params": {"amount": 999, "account": {"order_id": order_id}}},
            headers=auth,
        )
        assert response.json()["error"]["code"] == -31001
    finally:
        settings.PAYME_MERCHANT_KEY = None
        settings.PAYME_MERCHANT_ID = None


async def test_payme_unknown_order_rejected(client):
    settings = get_settings()
    settings.PAYME_MERCHANT_KEY = "secret-key"
    try:
        response = await client.post(
            "/api/v1/payments/payme",
            json={"id": 1, "method": "CheckPerformTransaction",
                  "params": {"amount": 100, "account": {"order_id": "00000000-0000-0000-0000-000000000000"}}},
            headers=payme_auth("secret-key"),
        )
        assert response.json()["error"]["code"] == -31050
    finally:
        settings.PAYME_MERCHANT_KEY = None


async def test_payme_cancel_after_perform_revokes(client):
    settings = get_settings()
    settings.PAYME_MERCHANT_KEY = "secret-key"
    auth = payme_auth("secret-key")
    try:
        headers = await learner(client)
        order_id, amount = await _make_order(client, headers)
        txn = "payme_txn_c"
        await client.post("/api/v1/payments/payme", headers=auth, json={
            "id": 1, "method": "CreateTransaction",
            "params": {"id": txn, "amount": amount, "account": {"order_id": order_id}}})
        await client.post("/api/v1/payments/payme", headers=auth, json={
            "id": 2, "method": "PerformTransaction", "params": {"id": txn}})
        cancel = await client.post("/api/v1/payments/payme", headers=auth, json={
            "id": 3, "method": "CancelTransaction", "params": {"id": txn, "reason": 5}})
        assert cancel.json()["result"]["state"] == -2

        sub = (await client.get("/api/v1/billing/subscription", headers=headers)).json()
        assert sub["is_premium"] is False
    finally:
        settings.PAYME_MERCHANT_KEY = None
        settings.PAYME_MERCHANT_ID = None


# --- Click ------------------------------------------------------------------

async def test_click_prepare_and_complete(client):
    from app.services.click import make_complete_sign, make_prepare_sign

    settings = get_settings()
    settings.CLICK_SECRET_KEY = "click-secret"
    settings.CLICK_SERVICE_ID = "svc1"
    settings.CLICK_MERCHANT_ID = "merchant1"
    try:
        headers = await learner(client)
        order = (await client.post(
            "/api/v1/billing/checkout",
            json={"plan_code": "premium_monthly", "provider": "click"},
            headers=headers,
        )).json()
        order_id = order["order_id"]

        prepare_params = {
            "click_trans_id": "111", "service_id": "svc1", "merchant_trans_id": order_id,
            "amount": "29000.00", "action": "0", "sign_time": "2026-07-09 10:00:00",
        }
        prepare_params["sign_string"] = make_prepare_sign(prepare_params)
        prep = await client.post("/api/v1/payments/click/prepare", data=prepare_params)
        assert prep.json()["error"] == 0
        prepare_id = prep.json()["merchant_prepare_id"]

        complete_params = {
            "click_trans_id": "111", "service_id": "svc1", "merchant_trans_id": order_id,
            "merchant_prepare_id": prepare_id, "amount": "29000.00", "action": "1",
            "error": "0", "sign_time": "2026-07-09 10:01:00",
        }
        complete_params["sign_string"] = make_complete_sign(complete_params)
        comp = await client.post("/api/v1/payments/click/complete", data=complete_params)
        assert comp.json()["error"] == 0

        sub = (await client.get("/api/v1/billing/subscription", headers=headers)).json()
        assert sub["is_premium"] is True
        assert sub["provider"] == "click"
    finally:
        settings.CLICK_SECRET_KEY = None
        settings.CLICK_SERVICE_ID = None
        settings.CLICK_MERCHANT_ID = None


async def test_click_bad_signature_rejected(client):
    settings = get_settings()
    settings.CLICK_SECRET_KEY = "click-secret"
    try:
        response = await client.post(
            "/api/v1/payments/click/prepare",
            data={"click_trans_id": "1", "merchant_trans_id": "x", "sign_string": "bad"},
        )
        assert response.json()["error"] == -1
    finally:
        settings.CLICK_SECRET_KEY = None


# --- Referral ---------------------------------------------------------------

async def test_referral_code_and_reward(client):
    referrer = await register_user(client, email="referrer@words.uz")
    referrer_headers = {"Authorization": "Bearer " + referrer["access_token"]}
    ref = (await client.get("/api/v1/billing/referral", headers=referrer_headers)).json()
    code = ref["code"]
    assert len(code) == 7
    assert ref["invited"] == 0

    # A referee registers with the code, then pays.
    referee = await register_user(client, email="referee@words.uz", referral_code=code)
    referee_headers = {"Authorization": "Bearer " + referee["access_token"]}
    await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"},
        headers=referee_headers,
    )

    # Referrer now has a rewarded referral and premium days.
    updated = (await client.get("/api/v1/billing/referral", headers=referrer_headers)).json()
    assert updated["invited"] == 1
    assert updated["rewarded"] == 1
    referrer_sub = (await client.get("/api/v1/billing/subscription", headers=referrer_headers)).json()
    assert referrer_sub["is_premium"] is True
