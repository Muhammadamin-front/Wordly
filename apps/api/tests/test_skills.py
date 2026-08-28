"""M11 — skills: reading passages, writing prompts, listening/speaking drills."""
import json

import app.db.session as db_session
from app.models.reading import ReadingPassage, ReadingQuestion
from tests.conftest import register_user
from tests.test_games import learner_with_cards


async def seed_passage(slug="little-story-a1", level="A1") -> None:
    async with db_session._session_factory() as db:
        passage = ReadingPassage(
            slug=slug, cefr_level=level, title_en="A Little Story",
            body_en="Aziz has a red bicycle. He rides it to school every day.",
            summary_uz="Aziz velosipedda maktabga boradi.",
        )
        passage.questions = [
            ReadingQuestion(
                question_order=1, prompt_en="What colour is the bicycle?",
                options_json=json.dumps(["Red", "Blue", "Green"]), answer_index=0,
            ),
            ReadingQuestion(
                question_order=2, prompt_en="Where does Aziz ride?",
                options_json=json.dumps(["To the park", "To school", "To the market"]),
                answer_index=1,
            ),
        ]
        db.add(passage)
        await db.commit()


async def auth_headers(client) -> dict:
    data = await register_user(client, email="reader@words.uz")
    return {"Authorization": "Bearer " + data["access_token"]}


async def test_reading_list_and_level_filter(client):
    await seed_passage()
    await seed_passage(slug="harder-b1", level="B1")
    headers = await auth_headers(client)

    all_items = (await client.get("/api/v1/skills/reading", headers=headers)).json()
    assert len(all_items) == 2
    assert all_items[0]["question_count"] == 2

    only_b1 = (await client.get("/api/v1/skills/reading?level=B1", headers=headers)).json()
    assert [p["slug"] for p in only_b1] == ["harder-b1"]


async def test_reading_detail_never_leaks_answers(client):
    await seed_passage()
    headers = await auth_headers(client)
    response = await client.get("/api/v1/skills/reading/little-story-a1", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["title_en"] == "A Little Story"
    assert len(body["questions"]) == 2
    assert body["questions"][0]["options"] == ["Red", "Blue", "Green"]
    assert "answer_index" not in response.text


async def test_reading_submit_scores_and_awards_xp(client):
    await seed_passage()
    headers = await auth_headers(client)
    response = await client.post(
        "/api/v1/skills/reading/little-story-a1/submit",
        json={"answers": [0, 1]},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["correct"] == 2 and body["total"] == 2
    assert body["results"] == [True, True]
    assert body["xp_gained"] == 10  # 2 correct × 5 XP

    stats = (await client.get("/api/v1/me/stats", headers=headers)).json()
    assert stats["xp"] >= 10


async def test_reading_submit_partial_and_missing_answers(client):
    await seed_passage()
    headers = await auth_headers(client)
    response = await client.post(
        "/api/v1/skills/reading/little-story-a1/submit",
        json={"answers": [2]},  # wrong, second unanswered
        headers=headers,
    )
    body = response.json()
    assert body["correct"] == 0
    assert body["results"] == [False, False]
    assert body["xp_gained"] == 0


async def test_reading_unknown_slug_404(client):
    headers = await auth_headers(client)
    response = await client.get("/api/v1/skills/reading/no-such", headers=headers)
    assert response.status_code == 404


async def test_writing_prompts_by_level(client):
    headers = await auth_headers(client)
    body = (await client.get("/api/v1/skills/writing/prompts?level=B1", headers=headers)).json()
    assert body["level"] == "B1"
    assert len(body["prompts"]) >= 3


async def test_listening_session_dictates_examples(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/listening", headers=headers)).json()
    assert len(body["questions"]) >= 4
    for q in body["questions"]:
        assert " " in q["answer"]  # a sentence, not a single word
        assert q["audio_text"] == q["answer"]  # the client speaks the answer


async def test_speaking_session_targets_headwords(client):
    headers, _ = await learner_with_cards(client, count=6)
    body = (await client.get("/api/v1/games/speaking", headers=headers)).json()
    assert len(body["questions"]) >= 4
    for q in body["questions"]:
        assert q["answer"].startswith("word")
        assert q["audio_text"] == q["answer"]


async def test_grammar_round_never_leaks_answers(client):
    headers = await auth_headers(client)
    # A1 is the free level; anything above needs Premium (tested separately).
    response = await client.get("/api/v1/skills/grammar?level=A1&count=10", headers=headers)
    assert response.status_code == 200
    questions = response.json()
    assert len(questions) == 10
    assert all(len(q["options"]) == 4 for q in questions)
    assert "answer_index" not in response.text


async def test_grammar_submit_grades_server_side(client):
    from app.services.grammar import QUESTIONS

    headers = await auth_headers(client)
    bank = QUESTIONS["A1"]
    right = bank[0]["options"][bank[0]["answer_index"]]
    wrong = next(o for o in bank[1]["options"] if o != bank[1]["options"][bank[1]["answer_index"]])
    response = await client.post(
        "/api/v1/skills/grammar/submit",
        headers=headers,
        json={"level": "A1", "answers": [
            {"prompt": bank[0]["prompt"], "answer": right},
            {"prompt": bank[1]["prompt"], "answer": wrong},
        ]},
    )
    body = response.json()
    assert body["results"] == [True, False]
    assert body["correct"] == 1 and body["xp_gained"] == 5


async def test_grammar_submit_rejects_invented_and_repeated_prompts(client):
    from app.services.grammar import QUESTIONS

    headers = await auth_headers(client)
    bank = QUESTIONS["A1"]
    right = bank[0]["options"][bank[0]["answer_index"]]
    response = await client.post(
        "/api/v1/skills/grammar/submit",
        headers=headers,
        json={"level": "A1", "answers": [
            {"prompt": "Invented ___ question?", "answer": "whatever"},
            {"prompt": bank[0]["prompt"], "answer": right},
            {"prompt": bank[0]["prompt"], "answer": right},  # repeat — no double XP
        ]},
    )
    body = response.json()
    assert body["results"] == [False, True, False]
    assert body["xp_gained"] == 5


async def test_free_grammar_stops_after_a1(client):
    """Free study covers A1 only — the curriculum runs A1-B2, so handing over
    more would be handing over most of the course."""
    headers = await auth_headers(client)
    for level in ("A2", "B1", "B2"):
        resp = await client.get(f"/api/v1/skills/grammar?level={level}&count=5", headers=headers)
        assert resp.status_code == 402, (level, resp.text)


async def test_free_grammar_submit_is_gated_too(client):
    """Grading awards XP, so it cannot stay open on a level you cannot study."""
    headers = await auth_headers(client)
    resp = await client.post(
        "/api/v1/skills/grammar/submit",
        headers=headers,
        json={"level": "B1", "answers": [{"prompt": "anything", "answer": "x"}]},
    )
    assert resp.status_code == 402


async def test_premium_reaches_every_grammar_level(client):
    headers = await auth_headers(client)
    await client.post(
        "/api/v1/billing/sandbox-activate", json={"plan_code": "premium_monthly"}, headers=headers
    )
    for level in ("A1", "A2", "B1", "B2"):
        resp = await client.get(f"/api/v1/skills/grammar?level={level}&count=5", headers=headers)
        assert resp.status_code == 200, (level, resp.text)
