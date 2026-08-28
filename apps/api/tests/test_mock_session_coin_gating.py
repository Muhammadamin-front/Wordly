"""Starting a Full Mock session now accepts coins as an alternative to
premium; abandoning/completing a leg no longer re-checks premium at all,
since ownership of an already-started session is the real gate (a free
user who paid coins to start must be able to finish what they paid for)."""
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


async def test_free_user_with_no_coins_gets_insufficient_coins_body(client):
    headers = await learner(client, email="mockcoins-poor@words.uz")
    resp = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert resp.status_code == 402
    assert resp.json()["detail"]["reason"] == "insufficient_coins"
    assert resp.json()["detail"]["required"] == 500


async def test_free_user_with_enough_coins_starts_a_session_and_is_charged(client):
    headers = await learner(client, email="mockcoins-rich@words.uz")
    await _credit(client, headers, 500)
    resp = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert resp.status_code == 201, resp.text
    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 0


async def test_conflict_on_active_session_never_charges_coins(client):
    headers = await learner(client, email="mockcoins-conflict@words.uz")
    await _credit(client, headers, 1000)
    first = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert first.status_code == 201

    # A second attempt hits the "already in progress" conflict — must not
    # charge again, even though the wallet could afford it.
    second = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert second.status_code == 409

    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 500  # only the first attempt was charged


async def test_abandon_and_complete_leg_work_for_a_coin_paying_free_user(client):
    headers = await learner(client, email="mockcoins-flow@words.uz")
    await _credit(client, headers, 500)
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
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
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )
    resp = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert resp.status_code == 201, resp.text
    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 0  # never touched
