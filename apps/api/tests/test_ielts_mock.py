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


async def test_completing_each_leg_advances_to_the_next_and_finalizes_overall_band(client):
    headers = await premium_learner(client, email="full-run@words.uz")
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = created.json()["id"]

    bands = {"listening": 7.0, "reading": 6.5, "writing": 6.0, "speaking": 7.5}
    for i, skill in enumerate(MOCK_SKILLS):
        resp = await client.post(
            f"/api/v1/ielts/mock/sessions/{session_id}/legs/{skill}/complete",
            json={"band": bands[skill]},
            headers=headers,
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        leg = next(leg for leg in body["legs"] if leg["skill"] == skill)
        assert leg["status"] == "done"
        assert leg["band"] == bands[skill]
        assert body[f"band_{skill}"] == bands[skill]

        if i + 1 < len(MOCK_SKILLS):
            next_skill = MOCK_SKILLS[i + 1]
            assert body["status"] == "in_progress"
            assert body["current_leg"] == next_skill
            next_leg = next(leg for leg in body["legs"] if leg["skill"] == next_skill)
            assert next_leg["status"] == "in_progress"
        else:
            assert body["status"] == "finished"
            assert body["current_leg"] is None
            # (7.0 + 6.5 + 6.0 + 7.5) / 4 = 6.75 -> rounds up to 7.0 per IELTS convention.
            assert body["overall_band"] == 7.0


async def test_completing_a_leg_out_of_order_is_rejected(client):
    headers = await premium_learner(client, email="out-of-order@words.uz")
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = created.json()["id"]

    resp = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/legs/reading/complete",
        json={"band": 6.0},
        headers=headers,
    )
    assert resp.status_code == 409


async def test_completing_the_same_leg_twice_is_rejected(client):
    headers = await premium_learner(client, email="double-submit@words.uz")
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = created.json()["id"]
    first_skill = MOCK_SKILLS[0]

    ok = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/legs/{first_skill}/complete",
        json={"band": 6.5},
        headers=headers,
    )
    assert ok.status_code == 200

    again = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/legs/{first_skill}/complete",
        json={"band": 6.5},
        headers=headers,
    )
    assert again.status_code == 409


async def test_completing_a_leg_on_an_abandoned_session_is_rejected(client):
    headers = await premium_learner(client, email="abandoned-leg@words.uz")
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = created.json()["id"]
    await client.post(f"/api/v1/ielts/mock/sessions/{session_id}/abandon", headers=headers)

    resp = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/legs/{MOCK_SKILLS[0]}/complete",
        json={"band": 6.5},
        headers=headers,
    )
    assert resp.status_code == 409


async def test_completing_a_leg_on_someone_elses_session_is_not_found(client):
    mine = await premium_learner(client, email="leg-owner@words.uz")
    theirs = await premium_learner(client, email="leg-stranger@words.uz")
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=mine)
    session_id = created.json()["id"]

    resp = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/legs/{MOCK_SKILLS[0]}/complete",
        json={"band": 6.5},
        headers=theirs,
    )
    assert resp.status_code == 404


async def test_completing_an_unknown_skill_is_not_found(client):
    headers = await premium_learner(client, email="unknown-skill@words.uz")
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = created.json()["id"]

    resp = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/legs/juggling/complete",
        json={"band": 6.5},
        headers=headers,
    )
    assert resp.status_code == 404


async def test_leg_band_is_rounded_to_the_nearest_half_band(client):
    headers = await premium_learner(client, email="rounding@words.uz")
    created = await client.post("/api/v1/ielts/mock/sessions", json={}, headers=headers)
    session_id = created.json()["id"]

    resp = await client.post(
        f"/api/v1/ielts/mock/sessions/{session_id}/legs/{MOCK_SKILLS[0]}/complete",
        json={"band": 6.3},
        headers=headers,
    )
    assert resp.status_code == 200
    leg = next(leg for leg in resp.json()["legs"] if leg["skill"] == MOCK_SKILLS[0])
    assert leg["band"] == 6.5
