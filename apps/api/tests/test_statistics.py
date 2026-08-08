from tests.conftest import register_user
from tests.test_games import card_submission, learner_with_cards


async def test_statistics_empty_for_new_user(client):
    data = await register_user(client)
    headers = {"Authorization": "Bearer " + data["access_token"]}
    stats = (await client.get("/api/v1/me/statistics", headers=headers)).json()
    assert stats["cards"]["total"] == 0
    assert stats["total_reviews"] == 0
    assert stats["accuracy_all"] == 0.0
    assert stats["rating_breakdown"] == {"again": 0, "hard": 0, "good": 0, "easy": 0}


async def test_statistics_after_reviews(client):
    headers, cards = await learner_with_cards(client, count=6)
    # 3 correct (fast -> good), 1 wrong (-> again)
    for card_id in cards[:3]:
        answer = await card_submission(client, headers, card_id)
        await client.post(
            "/api/v1/games/answer",
            json={"card_id": card_id, "game_type": "speed_quiz", "answer": answer, "duration_ms": 1500},
            headers=headers,
        )
    await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[3], "game_type": "speed_quiz", "answer": "wrong", "duration_ms": 1000},
        headers=headers,
    )

    stats = (await client.get("/api/v1/me/statistics", headers=headers)).json()
    assert stats["cards"]["total"] == 6
    assert stats["total_reviews"] == 4
    assert stats["rating_breakdown"]["good"] == 3
    assert stats["rating_breakdown"]["again"] == 1
    assert stats["accuracy_all"] == 75.0  # 3 of 4 not-again
    assert len(stats["reviews_by_day"]) == 1
    assert stats["reviews_by_day"][0]["count"] == 4


async def test_statistics_time_spent_accumulates(client):
    headers, cards = await learner_with_cards(client, count=6)
    answer = await card_submission(client, headers, cards[0])
    await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[0], "game_type": "speed_quiz", "answer": answer, "duration_ms": 2500},
        headers=headers,
    )
    stats = (await client.get("/api/v1/me/statistics", headers=headers)).json()
    assert stats["time_spent_ms"] == 2500


async def test_statistics_forgotten_words(client):
    headers, cards = await learner_with_cards(client, count=6)
    # Graduate a card, then fail it to create a lapse.
    correct_answer = await card_submission(client, headers, cards[0])
    for _ in range(2):
        await client.post(
            "/api/v1/games/answer",
            json={"card_id": cards[0], "game_type": "speed_quiz", "answer": correct_answer, "duration_ms": 1000},
            headers=headers,
        )
    # Force it into review state via the flashcard endpoint (easy graduates fast),
    # then a wrong game answer lapses it.
    await client.post(
        "/api/v1/review/{}".format(cards[0]),
        json={"rating": "easy"},
        headers={**headers, "Idempotency-Key": "statistics-easy-1"},
    )
    await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[0], "game_type": "speed_quiz", "answer": "wrong", "duration_ms": 1000},
        headers=headers,
    )
    stats = (await client.get("/api/v1/me/statistics", headers=headers)).json()
    assert any(w["lapses"] >= 1 for w in stats["forgotten"])


async def test_statistics_requires_auth(client):
    assert (await client.get("/api/v1/me/statistics")).status_code == 401


async def test_learning_plan_starts_guided_and_tracks_today(client):
    headers, cards = await learner_with_cards(client, count=6)
    before = (await client.get("/api/v1/me/learning-plan", headers=headers)).json()
    assert before["difficulty"] == "guided"
    assert before["recommended_game"] == "memory"
    assert before["daily_target"] == 10
    assert before["new_count"] == 6

    answer = await card_submission(client, headers, cards[0])
    await client.post(
        "/api/v1/games/answer",
        json={
            "card_id": cards[0],
            "game_type": "speed_quiz",
            "answer": answer,
            "duration_ms": 1000,
        },
        headers=headers,
    )
    after = (await client.get("/api/v1/me/learning-plan", headers=headers)).json()
    assert after["reviewed_today"] == 1
    assert after["recent_reviews"] == 1
    assert after["recent_accuracy"] == 100.0


async def test_mastery_map_partitions_published_words_by_cefr(client):
    from uuid import UUID

    from sqlalchemy import select

    import app.db.session as db_session
    from app.models.flashcards import Card

    headers, cards = await learner_with_cards(client, count=4)
    async with db_session._session_factory() as db:
        seeded = list(
            (
                await db.scalars(
                    select(Card)
                    .where(Card.id.in_([UUID(card_id) for card_id in cards]))
                    .order_by(Card.created_at)
                )
            ).all()
        )
        seeded[0].srs_state = "learning"
        seeded[1].srs_state = "review"
        seeded[1].interval_days = 8
        seeded[2].srs_state = "review"
        seeded[2].interval_days = 25
        await db.commit()

    response = await client.get("/api/v1/me/mastery-map", headers=headers)
    assert response.status_code == 200, response.text
    mastery = response.json()
    a1 = mastery["levels"][0]
    assert a1 == {
        "level": "A1",
        "total": 12,
        "new": 9,
        "learning": 1,
        "strong": 1,
        "mastered": 1,
        "started": 3,
        "progress_percent": 16,
    }
    assert [level["level"] for level in mastery["levels"]] == [
        "A1",
        "A2",
        "B1",
        "B2",
        "C1",
        "C2",
    ]
    assert mastery["current_level"] == "A1"
    assert mastery["total_words"] == 12
    assert mastery["started_words"] == 3
    assert mastery["mastered_words"] == 1
    assert mastery["overall_percent"] == 16


async def test_mastery_map_requires_auth(client):
    assert (await client.get("/api/v1/me/mastery-map")).status_code == 401


async def test_mistake_notebook_contains_learning_context(client):
    headers, cards = await learner_with_cards(client, count=6)
    await client.post(
        "/api/v1/games/answer",
        json={
            "card_id": cards[0],
            "game_type": "speed_quiz",
            "answer": "wrong",
            "duration_ms": 1000,
        },
        headers=headers,
    )

    response = await client.get("/api/v1/me/mistakes", headers=headers)
    assert response.status_code == 200, response.text
    notebook = response.json()
    assert notebook["total"] == 1
    item = notebook["items"][0]
    assert item["card_id"] == cards[0]
    assert item["headword"].startswith("word")
    assert item["translation_uz"].startswith("tarjima")
    assert item["translation_ru"].startswith("perevod")
    assert item["definition_en"].startswith("meaning number")
    assert item["example_en"].startswith("I use word")
    assert item["wrong_count"] == 1
    assert item["status"] == "needs_practice"
