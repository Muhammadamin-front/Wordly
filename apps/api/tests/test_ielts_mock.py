from app.models.ielts_mock import MOCK_SKILLS
from tests.conftest import register_user


async def learner(client, email="mock@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def premium_learner(client, email="mock-premium@words.uz") -> dict:
    headers = await learner(client, email=email)
    activated = await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )
    assert activated.status_code == 200, activated.text
    return headers


async def test_free_user_cannot_start_a_mock_session(client):
    headers = await learner(client)
    resp = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert resp.status_code == 402


async def test_premium_user_starts_a_session_with_all_four_legs_pending_or_active(client):
    headers = await premium_learner(client)
    resp = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["status"] == "in_progress"
    assert body["track"] == "academic"
    assert body["current_leg"] == MOCK_SKILLS[0]
    assert len(body["legs"]) == 4
    skills = {leg["skill"] for leg in body["legs"]}
    assert skills == set(MOCK_SKILLS)
    first_leg = next(leg for leg in body["legs"] if leg["skill"] == MOCK_SKILLS[0])
    assert first_leg["status"] == "in_progress"
    others = [leg for leg in body["legs"] if leg["skill"] != MOCK_SKILLS[0]]
    assert all(leg["status"] == "pending" for leg in others)


async def test_only_one_session_in_progress_at_a_time(client):
    headers = await premium_learner(client)
    first = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert first.status_code == 201
    second = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert second.status_code == 409


async def test_abandon_frees_the_slot_for_a_new_session(client):
    headers = await premium_learner(client)
    first = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = first.json()["id"]

    abandoned = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/abandon", headers=headers
    )
    assert abandoned.status_code == 200
    assert abandoned.json()["status"] == "abandoned"
    assert abandoned.json()["current_leg"] is None

    second = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    assert second.status_code == 201


async def test_cannot_abandon_a_session_twice(client):
    headers = await premium_learner(client)
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = created.json()["id"]
    await client.post(f"/api/v1/ielts/mock/sessions/{session_id}/abandon", headers=headers)

    again = await client.post(f"/api/v1/ielts/mock/sessions/{session_id}/abandon", headers=headers)
    assert again.status_code == 409


async def test_list_and_get_are_scoped_to_the_owner(client):
    mine = await premium_learner(client, email="owner@words.uz")
    theirs = await premium_learner(client, email="stranger@words.uz")

    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=mine)
    session_id = created.json()["id"]

    mine_list = await client.get("/api/v1/ielts/mock/sessions", headers=mine)
    assert len(mine_list.json()) == 1

    their_list = await client.get("/api/v1/ielts/mock/sessions", headers=theirs)
    assert their_list.json() == []

    forbidden = await client.get(f"/api/v1/ielts/mock/sessions/{session_id}", headers=theirs)
    assert forbidden.status_code == 404


async def test_unauthenticated_request_is_rejected(client):
    resp = await client.post("/api/v1/ielts/mock/sessions", json={})
    assert resp.status_code == 401
