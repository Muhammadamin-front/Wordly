import pytest

from tests.conftest import register_user
from tests.test_vocabulary import WORD_PAYLOAD, make_admin


async def learner_with_cards(client, count: int = 6) -> tuple[dict, list[str]]:
    """Seed `count` published words with distinct translations + examples that
    contain the headword (so fill_blank can blank it), then add them as cards."""
    # Seed more published words than we add, so multiple-choice distractors can
    # be drawn from words the learner doesn't have.
    admin_headers = await make_admin(client)
    for i in range(count + 8):
        payload = {
            **WORD_PAYLOAD,
            "headword": "word{}".format(i),
            "frequency_rank": i + 1,
            "senses": [
                {
                    "definition_en": "meaning number {}.".format(i),
                    "translation_uz": "tarjima{}".format(i),
                    "translation_ru": "perevod{}".format(i),
                    "examples": [{"text_en": "I use word{} today.".format(i)}],
                }
            ],
        }
        response = await client.post("/api/v1/admin/words", json=payload, headers=admin_headers)
        assert response.status_code == 201, response.text

    data = await register_user(client, email="learner@words.uz")
    headers = {"Authorization": "Bearer " + data["access_token"]}
    await client.post(
        "/api/v1/cards/add-by-level", json={"cefr_level": "A1", "limit": count}, headers=headers
    )
    queue = (await client.get("/api/v1/review/queue", headers=headers)).json()
    return headers, [c["id"] for c in queue["cards"]]


async def test_game_needs_minimum_cards(client):
    # learner with only 2 cards can't start a game (min 4)
    headers, _ = await learner_with_cards(client, count=2)
    response = await client.get("/api/v1/games/speed_quiz", headers=headers)
    assert response.status_code == 409
    assert "Add at least" in response.json()["detail"]


@pytest.mark.parametrize(
    "game_type", ["word_match", "speed_quiz", "fill_blank", "audio_guess", "typing_race", "memory"]
)
async def test_each_game_builds_a_session(client, game_type):
    headers, _ = await learner_with_cards(client, count=6)
    response = await client.get("/api/v1/games/{}".format(game_type), headers=headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["game_type"] == game_type
    assert len(body["questions"]) >= 4
    first = body["questions"][0]
    assert first["card_id"]
    assert first["prompt"] != "" or game_type == "audio_guess"
    assert first["answer"]


async def test_multiple_choice_games_have_distractors(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/speed_quiz", headers=headers)).json()
    # distractors come from the wider corpus, so options can always fill to 4
    assert all(len(q["distractors"]) >= 1 for q in body["questions"])


async def test_audio_guess_carries_audio_text(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/audio_guess", headers=headers)).json()
    assert all(q["audio_text"] for q in body["questions"])


async def test_typing_race_has_no_options(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/typing_race", headers=headers)).json()
    assert all(q["distractors"] == [] for q in body["questions"])


async def test_unknown_game_404(client):
    headers, _ = await learner_with_cards(client, count=6)
    assert (await client.get("/api/v1/games/tetris", headers=headers)).status_code == 404


async def test_correct_answer_feeds_srs_and_rewards(client):
    headers, cards = await learner_with_cards(client, count=6)
    response = await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[0], "correct": True, "duration_ms": 2000},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["rating"] == "good"  # correct + fast
    assert body["reward"]["xp_gained"] > 0
    assert "first_steps" in body["reward"]["new_achievements"]


async def test_wrong_answer_maps_to_again(client):
    headers, cards = await learner_with_cards(client, count=6)
    body = (
        await client.post(
            "/api/v1/games/answer",
            json={"card_id": cards[0], "correct": False, "duration_ms": 1000},
            headers=headers,
        )
    ).json()
    assert body["rating"] == "again"


async def test_slow_correct_answer_maps_to_hard(client):
    headers, cards = await learner_with_cards(client, count=6)
    body = (
        await client.post(
            "/api/v1/games/answer",
            json={"card_id": cards[0], "correct": True, "duration_ms": 9000},
            headers=headers,
        )
    ).json()
    assert body["rating"] == "hard"


async def test_answer_other_users_card_404(client):
    from tests.conftest import register_user

    headers, cards = await learner_with_cards(client, count=6)
    other = await register_user(client, email="intruder@words.uz")
    other_headers = {"Authorization": "Bearer " + other["access_token"]}
    response = await client.post(
        "/api/v1/games/answer",
        json={"card_id": cards[0], "correct": True},
        headers=other_headers,
    )
    assert response.status_code == 404
