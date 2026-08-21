from tests.conftest import register_user
from tests.test_vocabulary import WORD_PAYLOAD, make_admin


async def learner(client) -> dict:
    data = await register_user(client, email="learner@words.uz")
    return {"Authorization": "Bearer " + data["access_token"]}


async def seed_word(client, **overrides) -> dict:
    admin_headers = await make_admin(client)
    response = await client.post(
        "/api/v1/admin/words", json={**WORD_PAYLOAD, **overrides}, headers=admin_headers
    )
    assert response.status_code == 201, response.text
    return response.json()


async def test_flashcards_require_auth(client):
    assert (await client.get("/api/v1/decks")).status_code == 401
    assert (await client.get("/api/v1/review/queue")).status_code == 401


async def test_deck_crud_and_isolation(client):
    headers = await learner(client)
    created = await client.post(
        "/api/v1/decks", json={"name": "IELTS", "description": "Band 6.5"}, headers=headers
    )
    assert created.status_code == 201
    deck_id = created.json()["id"]

    listed = await client.get("/api/v1/decks", headers=headers)
    assert [d["name"] for d in listed.json()] == ["IELTS"]

    renamed = await client.patch(
        "/api/v1/decks/{}".format(deck_id), json={"name": "IELTS 7.0"}, headers=headers
    )
    assert renamed.json()["name"] == "IELTS 7.0"

    # Another user cannot see or touch it.
    other = await register_user(client, email="other@words.uz")
    other_headers = {"Authorization": "Bearer " + other["access_token"]}
    assert (await client.get("/api/v1/decks", headers=other_headers)).json() == []
    stolen = await client.delete("/api/v1/decks/{}".format(deck_id), headers=other_headers)
    assert stolen.status_code == 404

    deleted = await client.delete("/api/v1/decks/{}".format(deck_id), headers=headers)
    assert deleted.status_code == 200


async def test_word_card_create_and_duplicate(client):
    word = await seed_word(client)
    headers = await learner(client)

    created = await client.post(
        "/api/v1/cards", json={"word_id": word["id"]}, headers=headers
    )
    assert created.status_code == 201, created.text
    assert created.json()["word"]["headword"] == "apple"
    assert created.json()["srs_state"] == "new"

    duplicate = await client.post(
        "/api/v1/cards", json={"word_id": word["id"]}, headers=headers
    )
    assert duplicate.status_code == 409


async def test_card_requires_word_or_text(client):
    headers = await learner(client)
    assert (await client.post("/api/v1/cards", json={}, headers=headers)).status_code == 422
    custom = await client.post(
        "/api/v1/cards", json={"front_text": "to run", "back_text": "yugurmoq"}, headers=headers
    )
    assert custom.status_code == 201
    assert custom.json()["front_text"] == "to run"


async def test_add_by_level_bulk(client):
    await seed_word(client)  # apple A1
    await seed_word(client, headword="banana")
    await seed_word(client, headword="cherry", cefr_level="B1")
    headers = await learner(client)

    result = await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": 10}, headers=headers
    )
    assert result.json()["added"] == 2  # only the two A1 words
    assert result.json()["already_added"] == 0  # nothing owned before this call

    again = await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": 10}, headers=headers
    )
    assert again.json()["added"] == 0  # idempotent
    assert again.json()["already_added"] == 2  # both A1 words are now owned


async def test_add_by_level_already_added_ignores_words_left_by_the_limit(client):
    """Regression test: `already_added` must count the user's own matching
    cards. Deriving it from `total_available - added` instead counted every
    word left unadded because of the `limit` cap as "already added" — with
    5 A1 words and limit=2, the old formula reported 3 already added on a
    completely fresh account."""
    for i in range(5):
        await seed_word(client, headword=f"a1word{i}")
    headers = await learner(client)

    first = await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": 2}, headers=headers
    )
    assert first.json()["added"] == 2
    assert first.json()["already_added"] == 0

    second = await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": 2}, headers=headers
    )
    assert second.json()["added"] == 2
    assert second.json()["already_added"] == 2


async def test_queue_and_review_cycle(client):
    word = await seed_word(client)
    headers = await learner(client)
    card_id = (
        await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    ).json()["id"]

    queue = (await client.get("/api/v1/review/queue", headers=headers)).json()
    assert queue["new_count"] == 1
    assert queue["cards"][0]["id"] == card_id

    # Rate "good": card enters learning (due in 10 min) -> leaves the queue.
    reviewed = await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": "good", "duration_ms": 4200},
        headers={**headers, "Idempotency-Key": "review-cycle-good-1"},
    )
    assert reviewed.status_code == 200
    assert reviewed.json()["card"]["srs_state"] == "learning"

    queue = (await client.get("/api/v1/review/queue", headers=headers)).json()
    assert queue["cards"] == []
    assert queue["learning_count"] == 1

    # Second "good" graduates to review (FSRS's own interval/rep count, not SM-2's).
    reviewed = await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": "good"},
        headers={**headers, "Idempotency-Key": "review-cycle-good-2"},
    )
    body = reviewed.json()["card"]
    assert body["srs_state"] == "review"
    assert body["interval_days"] == 4.0
    assert body["repetitions"] == 2


async def test_review_writes_append_only_log(client):
    word = await seed_word(client)
    headers = await learner(client)
    card_id = (
        await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    ).json()["id"]

    await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": "easy"},
        headers={**headers, "Idempotency-Key": "append-log-easy-1"},
    )

    import app.db.session as db_session
    from sqlalchemy import select
    from app.models.flashcards import ReviewLog

    async with db_session.get_session_factory()() as session:
        logs = (await session.scalars(select(ReviewLog))).all()
    assert len(logs) == 1
    assert logs[0].rating == "easy"
    assert logs[0].state_before == "new"
    assert logs[0].interval_after == 15.0  # easy graduation, straight to review under FSRS
    assert logs[0].duration_ms is None


async def test_review_retry_is_idempotent(client):
    word = await seed_word(client)
    headers = await learner(client)
    card_id = (
        await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    ).json()["id"]
    request_headers = {**headers, "Idempotency-Key": "review-retry-0001"}

    first = await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": "easy", "duration_ms": 900},
        headers=request_headers,
    )
    retry = await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": "again", "duration_ms": 1200},
        headers=request_headers,
    )

    assert first.status_code == retry.status_code == 200
    assert retry.json() == first.json()

    import app.db.session as db_session
    from sqlalchemy import func, select
    from app.models.flashcards import ReviewLog, ReviewReceipt

    async with db_session.get_session_factory()() as session:
        log_count = await session.scalar(select(func.count(ReviewLog.id)))
        receipt_count = await session.scalar(select(func.count(ReviewReceipt.id)))
    assert log_count == 1
    assert receipt_count == 1


async def test_review_requires_idempotency_key(client):
    word = await seed_word(client)
    headers = await learner(client)
    card_id = (
        await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    ).json()["id"]

    response = await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": "good"},
        headers=headers,
    )
    assert response.status_code == 422


async def test_review_other_users_card_404(client):
    word = await seed_word(client)
    headers = await learner(client)
    card_id = (
        await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    ).json()["id"]

    other = await register_user(client, email="other2@words.uz")
    other_headers = {"Authorization": "Bearer " + other["access_token"]}
    response = await client.post(
        "/api/v1/review/{}".format(card_id),
        json={"rating": "good"},
        headers={**other_headers, "Idempotency-Key": "other-user-good-1"},
    )
    assert response.status_code == 404


async def test_favorite_and_memory_note(client):
    word = await seed_word(client)
    headers = await learner(client)
    card_id = (
        await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    ).json()["id"]

    updated = await client.patch(
        "/api/v1/cards/{}".format(card_id),
        json={"is_favorite": True, "memory_note": "olma — Alma-Ata = father of apples"},
        headers=headers,
    )
    assert updated.json()["is_favorite"] is True
    assert "Alma" in updated.json()["memory_note"]


CSV_DECK = "front,back\nto run,yugurmoq\nto swim,suzmoq\nto run,duplicate-skipped\n"
TSV_DECK = "to fly\tuchmoq\n\nbroken-row-no-tab\n"


async def test_deck_import_csv_and_tsv(client):
    headers = await learner(client)
    deck_id = (
        await client.post("/api/v1/decks", json={"name": "Verbs"}, headers=headers)
    ).json()["id"]

    report = (
        await client.post(
            "/api/v1/decks/{}/import".format(deck_id),
            files={"file": ("deck.csv", CSV_DECK.encode(), "text/csv")},
            headers=headers,
        )
    ).json()
    assert report == {"created": 2, "skipped": 1, "errors": []}

    report = (
        await client.post(
            "/api/v1/decks/{}/import".format(deck_id),
            files={"file": ("deck.tsv", TSV_DECK.encode(), "text/tab-separated-values")},
            headers=headers,
        )
    ).json()
    assert report["created"] == 1
    assert len(report["errors"]) == 1

    export = await client.get("/api/v1/decks/{}/export".format(deck_id), headers=headers)
    assert export.status_code == 200
    assert "to run,yugurmoq" in export.text
    assert "to fly,uchmoq" in export.text


async def test_list_cards_search_and_delete(client):
    word = await seed_word(client)
    headers = await learner(client)
    created = await client.post("/api/v1/cards", json={"word_id": word["id"]}, headers=headers)
    card_id = created.json()["id"]

    # List shows the card.
    page = (await client.get("/api/v1/cards", headers=headers)).json()
    assert page["total"] == 1
    assert page["items"][0]["word"]["headword"] == "apple"

    # Search by headword finds it; a miss returns empty.
    assert (await client.get("/api/v1/cards?q=app", headers=headers)).json()["total"] == 1
    assert (await client.get("/api/v1/cards?q=zzz", headers=headers)).json()["total"] == 0

    # Delete removes it.
    deleted = await client.delete("/api/v1/cards/{}".format(card_id), headers=headers)
    assert deleted.status_code == 200
    assert (await client.get("/api/v1/cards", headers=headers)).json()["total"] == 0
