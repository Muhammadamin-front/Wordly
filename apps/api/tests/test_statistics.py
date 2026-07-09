from tests.conftest import register_user
from tests.test_games import learner_with_cards


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
        await client.post(
            "/api/v1/games/answer",
            json={"card_id": card_id, "correct": True, "duration_ms": 1500},
            headers=headers,
        )
    await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[3], "correct": False, "duration_ms": 1000},
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
    await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[0], "correct": True, "duration_ms": 2500},
        headers=headers,
    )
    stats = (await client.get("/api/v1/me/statistics", headers=headers)).json()
    assert stats["time_spent_ms"] == 2500


async def test_statistics_forgotten_words(client):
    headers, cards = await learner_with_cards(client, count=6)
    # Graduate a card, then fail it to create a lapse.
    for rating_correct in (True, True):
        await client.post(
            "/api/v1/games/answer",
            json={"card_id": cards[0], "correct": rating_correct, "duration_ms": 1000},
            headers=headers,
        )
    # Force it into review state via the flashcard endpoint (easy graduates fast),
    # then a wrong game answer lapses it.
    await client.post(
        "/api/v1/review/{}".format(cards[0]), json={"rating": "easy"}, headers=headers
    )
    await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[0], "correct": False, "duration_ms": 1000},
        headers=headers,
    )
    stats = (await client.get("/api/v1/me/statistics", headers=headers)).json()
    assert any(w["lapses"] >= 1 for w in stats["forgotten"])


async def test_statistics_requires_auth(client):
    assert (await client.get("/api/v1/me/statistics")).status_code == 401
