from uuid import uuid4

from tests.conftest import register_user


async def auth(client, email: str = "grammar-progress@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_legacy_progress_sync_is_lossless_and_idempotent(client):
    headers = await auth(client)
    payload = {
        "entries": [
            {
                "lesson_slug": "present-simple",
                "attempts": 3,
                "best_score": 90,
                "last_score": 80,
                "updated_at": "2026-08-20T10:00:00Z",
            }
        ]
    }
    first = await client.post("/api/v1/me/grammar-progress/sync", json=payload, headers=headers)
    second = await client.post("/api/v1/me/grammar-progress/sync", json=payload, headers=headers)
    assert first.status_code == 200, first.text
    assert second.status_code == 200, second.text
    assert second.json()["entries"] == first.json()["entries"]
    assert second.json()["entries"][0]["attempts"] == 3


async def test_sync_merges_best_score_and_keeps_newest_last_score(client):
    headers = await auth(client, "grammar-merge@words.uz")
    older = {"lesson_slug": "articles", "attempts": 2, "best_score": 95, "last_score": 95, "updated_at": "2026-08-20T10:00:00Z"}
    newer = {"lesson_slug": "articles", "attempts": 3, "best_score": 75, "last_score": 70, "updated_at": "2026-08-21T10:00:00Z"}
    await client.post("/api/v1/me/grammar-progress/sync", json={"entries": [older]}, headers=headers)
    response = await client.post("/api/v1/me/grammar-progress/sync", json={"entries": [newer]}, headers=headers)
    entry = response.json()["entries"][0]
    assert entry["attempts"] == 3
    assert entry["best_score"] == 95
    assert entry["last_score"] == 70


async def test_live_attempt_is_idempotent(client):
    headers = await auth(client, "grammar-attempt@words.uz")
    attempt_id = str(uuid4())
    payload = {"attempt_id": attempt_id, "lesson_slug": "past-simple", "score": 85}
    first = await client.post("/api/v1/me/grammar-progress/attempt", json=payload, headers=headers)
    second = await client.post("/api/v1/me/grammar-progress/attempt", json=payload, headers=headers)
    assert first.status_code == 200, first.text
    assert second.status_code == 200, second.text
    assert first.json()["attempts"] == 1
    assert second.json()["attempts"] == 1


async def test_progress_is_private_to_each_account(client):
    mine = await auth(client, "grammar-owner@words.uz")
    theirs = await auth(client, "grammar-other@words.uz")
    await client.post(
        "/api/v1/me/grammar-progress/attempt",
        json={"attempt_id": str(uuid4()), "lesson_slug": "conditionals", "score": 100},
        headers=mine,
    )
    mine_result = await client.get("/api/v1/me/grammar-progress", headers=mine)
    their_result = await client.get("/api/v1/me/grammar-progress", headers=theirs)
    assert len(mine_result.json()["entries"]) == 1
    assert their_result.json()["entries"] == []


async def test_invalid_score_is_rejected(client):
    headers = await auth(client, "grammar-invalid@words.uz")
    response = await client.post(
        "/api/v1/me/grammar-progress/attempt",
        json={"attempt_id": str(uuid4()), "lesson_slug": "articles", "score": 101},
        headers=headers,
    )
    assert response.status_code == 422
