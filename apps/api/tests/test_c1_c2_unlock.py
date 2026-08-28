"""Vocabulary above A2 is free to browse but costs coins (or premium) to
add as a flashcard — a permanent, one-time unlock, not a per-word charge.
The stored tier keeps its original "c1_c2" id so unlocks already bought
keep working; it now covers B1 and B2 too."""
import app.db.session as db_session
from app.services import coins
from tests.conftest import register_user
from tests.test_flashcards import seed_word
from tests.test_vocabulary import make_admin


async def learner(client, email="c1c2@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def _credit(client, headers, amount):
    me = await client.get("/api/v1/auth/me", headers=headers)
    user_id = me.json()["id"]
    async with db_session.get_session_factory()() as db:
        from uuid import UUID
        await coins.credit(db, UUID(user_id), amount, reason="coin_pack_purchase")
        await db.commit()


async def test_adding_an_a1_word_never_touches_coins(client):
    headers = await learner(client, email="c1c2-a1@words.uz")
    word = await seed_word(client, headword="cat-a1", cefr_level="A1")
    resp = await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    assert resp.status_code == 201, resp.text


async def test_adding_a_c1_word_without_coins_or_premium_is_paywalled(client):
    headers = await learner(client, email="c1c2-poor@words.uz")
    word = await seed_word(client, headword="conundrum", cefr_level="C1")
    resp = await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    assert resp.status_code == 402
    body = resp.json()["detail"]
    assert body["reason"] == "insufficient_coins"
    assert body["required"] == 1000


async def test_adding_a_c1_word_with_enough_coins_unlocks_permanently(client):
    headers = await learner(client, email="c1c2-rich@words.uz")
    await _credit(client, headers, 1000)
    word = await seed_word(client, headword="perspicacious", cefr_level="C1")
    resp = await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    assert resp.status_code == 201, resp.text

    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 0  # spent exactly the unlock cost

    # A second C1/C2 word must NOT be charged again — the unlock is permanent.
    word2 = await seed_word(client, headword="quixotic", cefr_level="C2")
    resp2 = await client.post("/api/v1/cards", json={"word_id": word2["id"]}, headers=headers)
    assert resp2.status_code == 201, resp2.text
    wallet2 = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet2["balance"] == 0  # unchanged — no second charge


async def test_premium_user_never_charged_for_c1_c2(client):
    headers = await learner(client, email="c1c2-premium@words.uz")
    await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )
    word = await seed_word(client, headword="ephemeral", cefr_level="C1")
    resp = await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    assert resp.status_code == 201, resp.text
    wallet = (await client.get("/api/v1/billing/wallet", headers=headers)).json()
    assert wallet["balance"] == 0  # never touched


async def test_add_by_level_bulk_endpoint_is_gated_the_same_way(client):
    headers = await learner(client, email="c1c2-bulk@words.uz")
    await seed_word(client, headword="taciturn", cefr_level="C1")
    resp = await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "C1", "limit": 10}, headers=headers
    )
    assert resp.status_code == 402


async def test_free_study_stops_after_a2(client):
    """A2 is the last free level; B1 and B2 are paywalled the same way C1/C2
    always were, so the boundary is one rule, not two."""
    headers = await learner(client, email="c1c2-a2-boundary@words.uz")
    a2 = await seed_word(client, headword="garden-a2", cefr_level="A2")
    assert (
        await client.post("/api/v1/cards", json={"word_id": a2["id"]}, headers=headers)
    ).status_code == 201

    for level in ("B1", "B2"):
        word = await seed_word(client, headword=f"word-{level.lower()}", cefr_level=level)
        resp = await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
        assert resp.status_code == 402, (level, resp.text)


async def test_one_unlock_covers_every_level_above_a2(client):
    """Someone who paid the unlock gets B1 and B2 as well as C1/C2 — the
    purchase only ever widened."""
    headers = await learner(client, email="c1c2-widened@words.uz")
    await _credit(client, headers, 1000)
    b1 = await seed_word(client, headword="reluctant-b1", cefr_level="B1")
    assert (
        await client.post("/api/v1/cards", json={"word_id": b1["id"]}, headers=headers)
    ).status_code == 201

    c2 = await seed_word(client, headword="ineffable-c2", cefr_level="C2")
    resp = await client.post("/api/v1/cards", json={"word_id": c2["id"]}, headers=headers)
    assert resp.status_code == 201, resp.text  # not charged a second time
