"""Starting a Full Mock session now accepts coins as an alternative to
premium; abandoning/completing a leg no longer re-checks premium at all,
since ownership of an already-started session is the real gate (a free
user who paid coins to start must be able to finish what they paid for).

A free user's first mock each calendar month is free of charge — the
second and later attempts in the same month fall back to coins/premium."""
import app.db.session as db_session
from app.services import coins
from tests.conftest import register_user


async def learner(client, email="mockcoins@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def _credit(client, headers, amount):
    from uuid import UUID
    me = await client.get("/api/v1/auth/me", headers=headers)
    async with db_session.get_session_factory()() as db:
        await coins.credit(db, UUID(me.json()["id"]), amount, reason="coin_pack_purchase")
        await db.commit()


async def _abandon(client, headers, session_id):
    resp = await client.post(f"/api/v1/ielts/mock/sessions/{session_id}/abandon", headers=headers)
    assert resp.status_code == 200, resp.text


async def test_free_users_first_mock_this_month_is_free_of_charge(client):
    headers = await learner(client, email="mockcoins-free-slot@words.uz")
    resp = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert resp.status_code == 201, resp.text
    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 0  # never touched — no coins were ever credited


async def test_free_users_second_mock_this_month_requires_coins(client):
    headers = await learner(client, email="mockcoins-poor@words.uz")
    first = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert first.status_code == 201  # the free monthly slot
    await _abandon(client, headers, first.json()["id"])

    second = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert second.status_code == 402
    assert second.json()["detail"]["reason"] == "insufficient_coins"
    assert second.json()["detail"]["required"] == 500


async def test_free_users_second_mock_this_month_is_charged_with_enough_coins(client):
    headers = await learner(client, email="mockcoins-rich@words.uz")
    await _credit(client, headers, 500)
    first = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert first.status_code == 201  # the free monthly slot — not charged
    await _abandon(client, headers, first.json()["id"])
    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 500  # untouched by the free slot

    second = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert second.status_code == 201, second.text
    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 0  # the second attempt was charged


async def test_conflict_on_active_session_never_charges_coins(client):
    headers = await learner(client, email="mockcoins-conflict@words.uz")
    await _credit(client, headers, 1000)
    first = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert first.status_code == 201  # the free monthly slot — not charged

    # A second attempt hits the "already in progress" conflict — must not
    # charge, even though the wallet could afford it.
    second = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert second.status_code == 409

    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 1000  # neither attempt charged anything


async def test_abandon_and_complete_leg_work_for_a_coin_paying_free_user(client):
    headers = await learner(client, email="mockcoins-flow@words.uz")
    await _credit(client, headers, 500)
    first = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    await _abandon(client, headers, first.json()["id"])  # burn the free monthly slot

    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert created.status_code == 201, created.text
    session_id = created.json()["id"]

    # A free (non-premium) user must be able to abandon a session they
    # legitimately paid coins to start — this used to require premium too.
    resp = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/abandon", headers=headers
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "abandoned"


async def test_premium_user_starts_a_session_free_of_charge(client):
    headers = await learner(client, email="mockcoins-premium@words.uz")
    await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "plus_monthly"}, headers=headers
    )
    resp = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert resp.status_code == 201, resp.text
    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 0  # never touched

    # And a second one in the same month is also free — premium bypasses
    # the coin gate entirely regardless of the free monthly slot.
    await _abandon(client, headers, resp.json()["id"])
    second = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert second.status_code == 201, second.text
