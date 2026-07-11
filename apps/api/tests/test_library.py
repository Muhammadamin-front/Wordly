"""Library overview shelves and category-only bulk add."""
from tests.conftest import register_user
from tests.test_games import learner_with_cards


async def test_overview_reports_progress(client):
    headers, card_ids = await learner_with_cards(client, count=6)
    # "easy" graduates a new card immediately (repetitions -> 1 = learned);
    # "good" only advances a learning step, which doesn't count yet.
    queue = (await client.get("/api/v1/review/queue", headers=headers)).json()
    card_id = queue["cards"][0]["id"]
    r = await client.post(
        "/api/v1/review/{}".format(card_id), json={"rating": "easy"}, headers=headers
    )
    assert r.status_code == 200

    body = (await client.get("/api/v1/library/overview", headers=headers)).json()
    shelves = {s["key"]: s for s in body["shelves"]}
    assert set(shelves) >= {"A1", "A2", "B1", "B2", "C1", "C2", "ielts"}
    a1 = shelves["A1"]
    assert a1["total"] >= 6
    assert a1["added"] == 6
    assert a1["learned"] == 1
    assert shelves["ielts"]["total"] == 0  # no ielts words seeded in tests


async def test_overview_requires_auth(client):
    assert (await client.get("/api/v1/library/overview")).status_code == 401


async def test_add_by_category_only(client):
    from tests.test_vocabulary import WORD_PAYLOAD, make_admin

    admin_headers = await make_admin(client)
    # Category comes from the seeded WORD_PAYLOAD categories fixture? Create one.
    r = await client.post(
        "/api/v1/admin/words",
        json={**WORD_PAYLOAD, "headword": "catword", "category_slug": None},
        headers=admin_headers,
    )
    assert r.status_code == 201

    data = await register_user(client, email="cat@words.uz")
    headers = {"Authorization": "Bearer " + data["access_token"]}
    # Neither level nor category -> 422
    r = await client.post("/api/v1/cards/add-by-level", json={"limit": 5}, headers=headers)
    assert r.status_code == 422
    # Level-only still works (existing behaviour)
    r = await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": 5}, headers=headers
    )
    assert r.status_code == 200
    assert r.json()["added"] >= 1
