from typing import Any

from app.api.v1.ielts import require_ai_client
from app.main import app
from app.services.ielts import band_from_ratio
from app.services.plans import WRITING_ESSAY_SUBCAP_PER_DAY
from tests.conftest import register_user

QUESTIONS = [
    {"prompt": "Q1?", "options": ["a", "b", "c", "d"], "answer_index": 0},
    {"prompt": "Q2?", "options": ["a", "b", "c", "d"], "answer_index": 1},
    {"prompt": "Q3?", "options": ["a", "b", "c", "d"], "answer_index": 2},
]

WRITING_ESSAY = (
    "Digital technology can improve access to education. "
    "Technology also helps students find useful resources. "
    "However, young people sometimes uses technology without clear limits."
)


class FakeIeltsAi:
    async def text(self, *, system, prompt, max_tokens) -> str:
        return "ok"

    async def chat(self, *, system, messages, max_tokens) -> str:
        return "ok"

    async def json(self, *, system, prompt, schema, max_tokens) -> Any:
        props = schema["properties"]
        if "questions" in props:
            return {"title": "The Ocean", "body": "A passage about the ocean.", "questions": QUESTIONS}
        assert "AI estimate" in system
        assert "not an official IELTS score" in system
        assert "contradictions" in system
        assert "5-8 good_points" in system and "5-8 areas_to_improve" in system
        assert "SERVER-NUMBERED SOURCE SENTENCES" in prompt
        assert "band_overall" not in props
        analysis_schema = props["analysis"]["properties"]
        assert "sentence" not in analysis_schema["sentence_feedback"]["items"]["properties"]
        assert "frequency" not in analysis_schema["repetitions"]["items"]["properties"]
        assert set(analysis_schema["band_plan"]["properties"]) == {"actions"}
        return {
            "task": {"band": 6.0, "comment": "Addresses the task."},
            "coherence": {"band": 6.5, "comment": "Mostly well organised."},
            "lexical": {"band": 7.0, "comment": "Good range of vocabulary."},
            "grammar": {"band": 6.0, "comment": "Some agreement errors."},
            "feedback": "Good structure; work on cohesion.",
            "improved": "A full band-8 model answer.",
            "analysis": {
                "sentence_feedback": [
                    {
                        "sentence_number": 1,
                        "highlight": "improve access",
                        "status": "good",
                        "category": "collocation",
                        "explanation": "This is a concise academic collocation.",
                        "use_instead": "",
                        "why": "",
                    },
                    {
                        "sentence_number": 2,
                        "highlight": "helps students",
                        "status": "improve",
                        "category": "vocabulary",
                        "explanation": "The verb is accurate but basic.",
                        "use_instead": "enables students",
                        "why": "The alternative is more precise in this context.",
                    },
                    {
                        "sentence_number": 3,
                        "highlight": "people sometimes uses",
                        "status": "error",
                        "category": "subject_verb_agreement",
                        "explanation": "The plural subject needs the base verb.",
                        "use_instead": "people sometimes use",
                        "why": "People is plural, so use is the correct verb form.",
                    },
                    {
                        "sentence_number": 1,
                        "highlight": "fabricated highlight",
                        "status": "error",
                        "category": "grammar",
                        "explanation": "This model-generated text is not in the essay.",
                        "use_instead": "replacement",
                        "why": "It must be filtered.",
                    },
                ],
                "good_points": [
                    {
                        "title": "Academic collocation",
                        "evidence": "improve access",
                        "explanation": "The phrase is concise and natural.",
                    },
                    {
                        "title": "Relevant subject",
                        "evidence": "Digital technology",
                        "explanation": "The response opens directly on topic.",
                    },
                    {
                        "title": "Clear benefit",
                        "evidence": "useful resources",
                        "explanation": "The benefit is concrete.",
                    },
                    {
                        "title": "Contrast signal",
                        "evidence": "However",
                        "explanation": "The linker marks a change in direction.",
                    },
                    {
                        "title": "Specific limitation",
                        "evidence": "clear limits",
                        "explanation": "The wording identifies a concrete concern.",
                    },
                    {
                        "title": "Invented strength",
                        "evidence": "evidence not in essay",
                        "explanation": "This must be filtered.",
                    },
                ],
                "areas_to_improve": [
                    {
                        "title": "Agreement",
                        "evidence": "people sometimes uses",
                        "action": "Use a plural verb with people.",
                    },
                    {
                        "title": "Basic verb",
                        "evidence": "helps students",
                        "action": "Choose a more precise verb where natural.",
                    },
                    {
                        "title": "Repetition",
                        "evidence": "technology",
                        "action": "Use accurate referencing to reduce repetition.",
                    },
                    {
                        "title": "Development",
                        "evidence": "useful resources",
                        "action": "Explain how those resources improve learning.",
                    },
                    {
                        "title": "Precision",
                        "evidence": "clear limits",
                        "action": "Define what appropriate limits would be.",
                    },
                ],
                "language_upgrades": [
                    {
                        "used": "helps students",
                        "use_instead": "enables students",
                        "why": "It is more precise here.",
                    },
                    {
                        "used": "invented wording",
                        "use_instead": "replacement",
                        "why": "This must be filtered.",
                    },
                ],
                "repetitions": [
                    {
                        "word": "technology",
                        "problem": "It appears too often in a short response.",
                        "alternatives": ["digital tools", "these systems"],
                    },
                    {
                        "word": "computers",
                        "problem": "This word is not actually present.",
                        "alternatives": ["devices"],
                    },
                ],
                "cohesion": {
                    "strengths": [
                        {"quote": "However", "explanation": "It marks contrast clearly."}
                    ],
                    "issues": [
                        {
                            "quote": "Technology also",
                            "explanation": "The repeated noun makes the link mechanical.",
                        },
                        {
                            "quote": "fabricated cohesion quote",
                            "explanation": "This must be filtered.",
                        },
                    ],
                    "opportunities": ["Use a pronoun where its reference remains clear."],
                },
                "grammar_profile": {
                    "strengths": [
                        {
                            "quote": "can improve",
                            "explanation": "The modal is followed by the base verb.",
                        }
                    ],
                    "weaknesses": [
                        {
                            "quote": "people sometimes uses",
                            "explanation": "Subject-verb agreement is inaccurate.",
                        }
                    ],
                },
                "band_plan": {
                    "actions": [
                        "Check agreement in every sentence.",
                        "Develop each main point with a consequence.",
                        "Reduce avoidable noun repetition.",
                        "Use precise but natural verbs.",
                    ]
                },
                "next_steps": [
                    "Correct the agreement error and rewrite the final sentence.",
                    "Practise cohesive referencing for technology-related essays.",
                    "Add one developed example to the response.",
                ],
            },
        }


def use_fake() -> None:
    app.dependency_overrides[require_ai_client] = lambda: FakeIeltsAi()


async def learner(client, email="ielts@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


def test_band_from_ratio_follows_the_published_tables():
    """Reference points from the 40-question papers.

    The previous table awarded band 6.0 for half marks; Academic Reading needs
    23/40 for a 6.0 and gives 20/40 a 5.5, so practice results were inflated and
    the stored "best band" was wrong.
    """
    # Academic Reading: 23/40 -> 6.0, 20/40 -> 5.5, 30/40 -> 7.0.
    assert band_from_ratio(23 / 40, "reading") == 6.0
    assert band_from_ratio(20 / 40, "reading") == 5.5
    assert band_from_ratio(30 / 40, "reading") == 7.0
    assert band_from_ratio(1.0, "reading") == 9.0

    # Listening is a little more forgiving in the middle: 23/40 -> 6.0,
    # 30/40 -> 7.0, 26/40 -> 6.5.
    assert band_from_ratio(26 / 40, "listening") == 6.5
    assert band_from_ratio(30 / 40, "listening") == 7.0

    # General Training Reading is stricter than Academic at the same raw score.
    assert band_from_ratio(30 / 40, "general_reading") <= band_from_ratio(
        30 / 40, "reading"
    )


def test_band_from_ratio_is_monotonic():
    previous = 0.0
    for step in range(0, 101):
        band = band_from_ratio(step / 100, "reading")
        assert band >= previous
        previous = band


async def test_ielts_requires_auth(client):
    assert (await client.get("/api/v1/ielts/overview")).status_code == 401


async def test_writing_tasks_lists_both(client):
    headers = await learner(client)
    body = (await client.get("/api/v1/ielts/writing/tasks", headers=headers)).json()
    assert "task1" in body and "task2" in body
    assert body["task1"][0]["prompt"]
    assert all(task.get("visual") for task in body["task1"])
    visual_kinds = {task["visual"]["kind"] for task in body["task1"]}
    # map-pair pulled entirely (pending real illustrated-map content — plain
    # coloured rectangles read as "ugly", not a placeholder worth keeping).
    # image: real diagrams and charts supplied as artwork, shown as-is rather
    # than redrawn from categories/series.
    assert {"bar", "line", "table", "image", "pie-pair", "bar-line"} <= visual_kinds
    assert "map-pair" not in visual_kinds
    assert "process" not in visual_kinds
    assert all(task["visual"]["title"] for task in body["task1"])
    assert all(
        task["visual"].get("image") for task in body["task1"] if task["visual"]["kind"] == "image"
    )


async def test_generate_requires_ai_configured(client):
    headers = await learner(client)
    resp = await client.post("/api/v1/ielts/reading/generate", json={"band": 6}, headers=headers)
    assert resp.status_code == 503  # no AI key in tests, no override


async def test_reading_generate_hides_answers_and_grades_serverside(client):
    use_fake()
    try:
        headers = await learner(client)
        gen = await client.post(
            "/api/v1/ielts/reading/generate", json={"band": 6}, headers=headers
        )
        assert gen.status_code == 200, gen.text
        test = gen.json()
        assert test["title"] == "The Ocean"
        assert len(test["questions"]) == 3
        # The answer key must NOT be exposed to the client.
        assert "answer_index" not in test["questions"][0]

        # All correct → top band.
        good = await client.post(
            "/api/v1/ielts/reading/submit",
            json={"test_id": test["test_id"], "answers": [0, 1, 2]},
            headers=headers,
        )
        assert good.status_code == 200, good.text
        gd = good.json()
        assert gd["correct"] == 3 and gd["total"] == 3
        assert gd["band"] == 9.0
        assert gd["answers"] == [0, 1, 2]  # revealed after grading
        assert gd["reward"]["xp_gained"] > 0

        # The test is one-shot: a second submit 404s.
        again = await client.post(
            "/api/v1/ielts/reading/submit",
            json={"test_id": test["test_id"], "answers": [0, 1, 2]},
            headers=headers,
        )
        assert again.status_code == 404
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_reading_wrong_answers_score_lower(client):
    use_fake()
    try:
        headers = await learner(client, email="ielts2@words.uz")
        test = (
            await client.post("/api/v1/ielts/reading/generate", json={"band": 6}, headers=headers)
        ).json()
        bad = await client.post(
            "/api/v1/ielts/reading/submit",
            json={"test_id": test["test_id"], "answers": [3, 3, 3]},  # all wrong
            headers=headers,
        )
        gd = bad.json()
        assert gd["correct"] == 0
        assert gd["band"] < 6.0
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_bank_lists_items_and_marks_done(client):
    headers = await learner(client, email="bank@words.uz")
    listing = (await client.get("/api/v1/ielts/reading/bank", headers=headers)).json()
    assert len(listing) >= 6
    first = listing[0]
    assert first["done"] is False
    assert first["word_count"] > 200

    # Start it — no AI needed, answer key hidden.
    started = await client.post(
        f"/api/v1/ielts/reading/bank/{first['id']}/start", headers=headers
    )
    assert started.status_code == 200, started.text
    test = started.json()
    assert "answer_index" not in test["questions"][0]

    # Submit (all A) — grading works and the item becomes done.
    graded = await client.post(
        "/api/v1/ielts/reading/submit",
        json={"test_id": test["test_id"], "answers": [0] * len(test["questions"])},
        headers=headers,
    )
    assert graded.status_code == 200, graded.text
    listing2 = (await client.get("/api/v1/ielts/reading/bank", headers=headers)).json()
    assert next(i for i in listing2 if i["id"] == first["id"])["done"] is True


async def test_bank_answer_keys_are_valid(client):
    # Every bank question's answer_index must point at a real option.
    from app.services.ielts_bank import LISTENING_BANK, READING_BANK

    for bank in (READING_BANK, LISTENING_BANK):
        ids = [item["id"] for item in bank]
        assert len(ids) == len(set(ids)), "duplicate bank id"
        for item in bank:
            assert len(item["body"].split()) > 150, item["id"]
            assert 4.0 <= item["band"] <= 9.0, item["id"]
            for q in item["questions"]:
                assert 0 <= q["answer_index"] < len(q["options"]), (item["id"], q["prompt"])


async def test_bank_list_is_sorted_by_band_and_exposes_it(client):
    headers = await learner(client, email="banksort@words.uz")
    listing = (await client.get("/api/v1/ielts/listening/bank", headers=headers)).json()
    assert len(listing) >= 10
    bands = [item["band"] for item in listing]
    assert bands == sorted(bands)  # easiest first


async def test_bank_unknown_item_404s(client):
    headers = await learner(client, email="bank404@words.uz")
    resp = await client.post("/api/v1/ielts/reading/bank/nope/start", headers=headers)
    assert resp.status_code == 404


async def test_listening_audio_streams_tts(client, monkeypatch):
    from types import SimpleNamespace

    from app.api.v1 import ielts as ielts_api

    headers = await learner(client, email="audio@words.uz")
    started = (
        await client.post("/api/v1/ielts/listening/bank/l1/start", headers=headers)
    ).json()

    # No ElevenLabs key in the test env → 503, and the client falls back.
    resp = await client.get(f"/api/v1/ielts/listening/{started['test_id']}/audio", headers=headers)
    assert resp.status_code == 503

    # With TTS configured, the script body is synthesized and streamed as MP3.
    spoken = {}

    async def fake_synthesize(text):
        spoken["text"] = text
        return b"MP3BYTES"

    monkeypatch.setattr(ielts_api, "get_settings", lambda: SimpleNamespace(tts_enabled=True))
    monkeypatch.setattr(ielts_api.tts, "synthesize", fake_synthesize)
    resp = await client.get(f"/api/v1/ielts/listening/{started['test_id']}/audio", headers=headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "audio/mpeg"
    assert resp.content == b"MP3BYTES"
    assert spoken["text"].startswith("Receptionist:")

    # Reading tests have no narration; other users' tests are invisible.
    reading = (
        await client.post("/api/v1/ielts/reading/bank/r1/start", headers=headers)
    ).json()
    resp = await client.get(f"/api/v1/ielts/listening/{reading['test_id']}/audio", headers=headers)
    assert resp.status_code == 404


async def test_writing_score_returns_bands(client):
    use_fake()
    try:
        headers = await learner(client, email="ieltsw@words.uz")
        resp = await client.post(
            "/api/v1/ielts/writing/score",
            json={
                "task_type": "task2",
                "prompt": "Some people think...",
                "essay": WRITING_ESSAY,
                "lang": "uz",
            },
            headers=headers,
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["band_overall"] == 6.5  # criterion average 6.375 -> 6.5
        assert data["lexical"]["band"] == 7.0
        assert data["lexical"]["comment"]
        assert data["errors"][0]["quote"] == "people sometimes uses"
        assert data["errors"][0]["fix"] == "people sometimes use"
        assert "improve access" in data["strengths"][0]
        assert data["feedback"]
        assert data["improved"]
        assert data["reward"]["xp_gained"] > 0

        analysis = data["analysis"]
        assert [item["status"] for item in analysis["sentence_feedback"]] == [
            "good",
            "improve",
            "error",
        ]
        assert analysis["sentence_feedback"][0]["sentence"] == (
            "Digital technology can improve access to education."
        )
        assert all(
            item["highlight"] in item["sentence"]
            for item in analysis["sentence_feedback"]
        )
        assert all(
            item["highlight"] != "fabricated highlight"
            for item in analysis["sentence_feedback"]
        )
        assert len(analysis["good_points"]) == 5
        assert analysis["language_upgrades"] == [
            {
                "used": "helps students",
                "use_instead": "enables students",
                "why": "It is more precise here.",
            }
        ]
        assert analysis["repetitions"][0]["frequency"] == 3
        assert len(analysis["repetitions"]) == 1
        assert len(analysis["cohesion"]["issues"]) == 1
        assert analysis["band_plan"]["current_band"] == 6.5
        assert analysis["band_plan"]["target_band"] == 7.0
        assert len(analysis["band_plan"]["actions"]) == 4
        assert len(analysis["next_steps"]) == 3

        # It shows up as the best Writing band on the overview.
        ov = (await client.get("/api/v1/ielts/overview", headers=headers)).json()
        assert ov["best_bands"]["writing"] == 6.5

        # …and as a history entry (Writing has no correct/total).
        assert ov["recent"][0]["skill"] == "writing"
        assert ov["recent"][0]["band"] == 6.5
        assert ov["recent"][0]["correct"] is None
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_free_tier_writing_checks_capped_at_three_per_week(client):
    use_fake()
    try:
        headers = await learner(client, email="ieltsw-cap@words.uz")
        for _ in range(3):
            resp = await client.post(
                "/api/v1/ielts/writing/score",
                json={"task_type": "task2", "prompt": "Some people think...", "essay": "x" * 60},
                headers=headers,
            )
            assert resp.status_code == 200, resp.text

        fourth = await client.post(
            "/api/v1/ielts/writing/score",
            json={"task_type": "task2", "prompt": "Some people think...", "essay": "x" * 60},
            headers=headers,
        )
        assert fourth.status_code == 429
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_premium_is_not_capped_by_the_free_weekly_writing_limit(client):
    use_fake()
    try:
        headers = await learner(client, email="ieltsw-premium@words.uz")
        await client.post(
            "/api/v1/billing/sandbox-activate", json={"plan_code": "plus_monthly"}, headers=headers
        )
        for _ in range(4):  # one more than the free-tier weekly cap
            resp = await client.post(
                "/api/v1/ielts/writing/score",
                json={"task_type": "task2", "prompt": "Some people think...", "essay": "x" * 60},
                headers=headers,
            )
            assert resp.status_code == 200, resp.text
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_plus_essay_checks_capped_at_five_per_day(client):
    """Plus is not unlimited: each essay check is a long, expensive model
    call, so it's sub-capped within the combined daily pool — five a day,
    same number the old flat premium cap enforced."""
    use_fake()
    try:
        headers = await learner(client, email="ieltsw-premium-cap@words.uz")
        await client.post(
            "/api/v1/billing/sandbox-activate", json={"plan_code": "plus_monthly"}, headers=headers
        )
        for _ in range(5):
            resp = await client.post(
                "/api/v1/ielts/writing/score",
                json={"task_type": "task2", "prompt": "Some people think...", "essay": "x" * 60},
                headers=headers,
            )
            assert resp.status_code == 200, resp.text

        sixth = await client.post(
            "/api/v1/ielts/writing/score",
            json={"task_type": "task2", "prompt": "Some people think...", "essay": "x" * 60},
            headers=headers,
        )
        assert sixth.status_code == 429
        assert str(WRITING_ESSAY_SUBCAP_PER_DAY["plus_monthly"]) in sixth.json()["detail"]
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_overview_recent_lists_graded_tests_newest_first(client):
    use_fake()
    try:
        headers = await learner(client, email="history@words.uz")
        ov = (await client.get("/api/v1/ielts/overview", headers=headers)).json()
        assert ov["recent"] == []

        test = (
            await client.post("/api/v1/ielts/reading/generate", json={"band": 6}, headers=headers)
        ).json()
        await client.post(
            "/api/v1/ielts/reading/submit",
            json={"test_id": test["test_id"], "answers": [0, 1, 2]},
            headers=headers,
        )

        ov = (await client.get("/api/v1/ielts/overview", headers=headers)).json()
        assert len(ov["recent"]) == 1
        entry = ov["recent"][0]
        assert entry["skill"] == "reading"
        assert entry["band"] == 9.0
        assert entry["correct"] == 3 and entry["total"] == 3
        assert entry["created_at"]
    finally:
        app.dependency_overrides.pop(require_ai_client, None)
