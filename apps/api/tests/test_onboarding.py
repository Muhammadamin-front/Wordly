from tests.conftest import register_user
from tests.test_flashcards import seed_word


async def seed_starter_words(client, level: str = "A1") -> None:
    for rank, headword in enumerate(("apple", "book", "coffee", "day", "English"), start=1):
        await seed_word(
            client,
            headword=headword,
            cefr_level=level,
            frequency_rank=rank,
        )


async def test_new_account_starts_with_incomplete_onboarding(client):
    data = await register_user(client)
    profile = data["user"]["profile"]

    assert profile["onboarding_completed"] is False
    assert profile["cefr_level"] == "A1"
    assert profile["learning_goal"] == "general"
    assert profile["daily_minutes"] == 10
    assert profile["learning_interests"] == []
    assert profile["starter_deck_id"] is None


async def test_complete_onboarding_creates_personal_five_word_lesson(client):
    await seed_starter_words(client, "A2")
    data = await register_user(client, email="starter@words.uz")
    headers = {"Authorization": "Bearer " + data["access_token"]}

    response = await client.put(
        "/api/v1/users/me/onboarding",
        json={
            "cefr_level": "A2",
            "learning_goal": "career",
            "daily_minutes": 15,
            "learning_interests": ["work", "technology"],
        },
        headers=headers,
    )

    assert response.status_code == 200, response.text
    body = response.json()
    profile = body["user"]["profile"]
    assert profile["onboarding_completed"] is True
    assert profile["cefr_level"] == "A2"
    assert profile["learning_goal"] == "career"
    assert profile["daily_minutes"] == 15
    assert profile["learning_interests"] == ["work", "technology"]
    assert body["starter_cards"] == 5

    queue = await client.get(
        "/api/v1/review/queue?deck_id={}&new_limit=5".format(
            body["starter_deck_id"]
        ),
        headers=headers,
    )
    assert queue.status_code == 200
    assert queue.json()["new_count"] == 5
    assert {card["word"]["cefr_level"] for card in queue.json()["cards"]} == {"A2"}


async def test_onboarding_retry_reuses_starter_deck_and_cards(client):
    await seed_starter_words(client)
    data = await register_user(client, email="retry-onboarding@words.uz")
    headers = {"Authorization": "Bearer " + data["access_token"]}
    payload = {
        "cefr_level": "A1",
        "learning_goal": "general",
        "daily_minutes": 10,
        "learning_interests": ["daily-life"],
    }

    first = await client.put("/api/v1/users/me/onboarding", json=payload, headers=headers)
    retry = await client.put("/api/v1/users/me/onboarding", json=payload, headers=headers)

    assert first.status_code == retry.status_code == 200
    assert retry.json()["starter_deck_id"] == first.json()["starter_deck_id"]
    decks = (await client.get("/api/v1/decks", headers=headers)).json()
    assert len(decks) == 1
    assert decks[0]["card_count"] == 5


async def test_onboarding_rejects_unknown_preferences(client):
    data = await register_user(client, email="invalid-onboarding@words.uz")
    headers = {"Authorization": "Bearer " + data["access_token"]}
    response = await client.put(
        "/api/v1/users/me/onboarding",
        json={
            "cefr_level": "A1",
            "learning_goal": "magic",
            "daily_minutes": 7,
            "learning_interests": ["everything"],
        },
        headers=headers,
    )

    assert response.status_code == 422
