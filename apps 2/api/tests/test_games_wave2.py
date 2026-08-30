import pytest

from tests.test_games import learner_with_cards


@pytest.mark.parametrize(
    "game_type",
    ["boss_battle", "hangman", "spelling_bee", "word_search", "crossword", "story_mode"],
)
async def test_new_games_build_sessions(client, game_type):
    headers, _ = await learner_with_cards(client, count=6)
    response = await client.get("/api/v1/games/{}".format(game_type), headers=headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert len(body["questions"]) >= 4
    assert body["questions"][0]["answer"]


async def test_crossword_uses_definition_without_revealing_answer(client):
    headers, _ = await learner_with_cards(client, count=6)

    response = await client.get("/api/v1/games/crossword", headers=headers)
    assert response.status_code == 200, response.text
    for question in response.json()["questions"]:
        assert question["prompt"]
        assert question["answer"].lower() not in question["prompt"].lower()
        assert question["distractors"] == []


async def test_boss_battle_has_options(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/boss_battle", headers=headers)).json()
    assert all(len(q["distractors"]) >= 1 for q in body["questions"])


async def test_hangman_answer_is_headword(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/hangman", headers=headers)).json()
    # learner_with_cards seeds headwords "word0"..; the answer should be one.
    assert all(q["answer"].startswith("word") for q in body["questions"])


async def test_spelling_bee_carries_audio(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/spelling_bee", headers=headers)).json()
    assert all(q["audio_text"] for q in body["questions"])


async def test_sentence_builder_needs_examples(client):
    # learner_with_cards seeds examples ("I use word{i} today."), so it works.
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/sentence_builder", headers=headers)).json()
    # answer is a full sentence.
    assert all(" " in q["answer"] for q in body["questions"])


async def test_story_mode_uses_example_as_a_cloze_scene(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/story_mode", headers=headers)).json()
    assert body["difficulty"] == "guided"
    for question in body["questions"]:
        assert "____" in question["prompt"]
        assert question["answer"].lower() not in question["prompt"].lower()
        assert len(question["distractors"]) == 2
