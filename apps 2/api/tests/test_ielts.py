from typing import Any

from app.api.v1.ielts import require_ai_client
from app.main import app
from app.services.ielts import band_from_ratio
from tests.conftest import register_user

QUESTIONS = [
    {"prompt": "Q1?", "options": ["a", "b", "c", "d"], "answer_index": 0},
    {"prompt": "Q2?", "options": ["a", "b", "c", "d"], "answer_index": 1},
    {"prompt": "Q3?", "options": ["a", "b", "c", "d"], "answer_index": 2},
]


class FakeIeltsAi:
    async def text(self, *, system, prompt, max_tokens) -> str:
        return "ok"

    async def chat(self, *, system, messages, max_tokens) -> str:
        return "ok"

    async def json(self, *, system, prompt, schema, max_tokens) -> Any:
        props = schema["properties"]
        if "questions" in props:
            return {"title": "The Ocean", "body": "A passage about the ocean.", "questions": QUESTIONS}
        return {
            "band_overall": 6.4,
            "task": {"band": 6.0, "comment": "Addresses the task."},
            "coherence": {"band": 6.5, "comment": "Mostly well organised."},
            "lexical": {"band": 7.0, "comment": "Good range of vocabulary."},
            "grammar": {"band": 6.0, "comment": "Some agreement errors."},
            "errors": [
                {"quote": "peoples is", "fix": "people are", "note": "'People' is already plural.", "type": "grammar"},
            ],
            "strengths": ["Clear position", "Good paragraphing"],
            "feedback": "Good structure; work on cohesion.",
            "improved": "A full band-8 model answer.",
        }


def use_fake() -> None:
    app.dependency_overrides[require_ai_client] = lambda: FakeIeltsAi()


async def learner(client, email="ielts@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


def test_band_from_ratio_monotonic():
    assert band_from_ratio(1.0) == 9.0
    assert band_from_ratio(0.5) == 6.0
    assert band_from_ratio(0.0) == 3.0
    assert band_from_ratio(0.67) >= band_from_ratio(0.5)


async def test_ielts_requires_auth(client):
    assert (await client.get("/api/v1/ielts/overview")).status_code == 401


async def test_writing_tasks_lists_both(client):
    headers = await learner(client)
    body = (await client.get("/api/v1/ielts/writing/tasks", headers=headers)).json()
    assert "task1" in body and "task2" in body
    assert body["task1"][0]["prompt"]
    assert all(task.get("visual") for task in body["task1"])
    visual_kinds = {task["visual"]["kind"] for task in body["task1"]}
    assert {"bar", "line", "table", "process", "map-pair", "pie-pair", "bar-line"} <= visual_kinds
    assert all(task["visual"]["title"] for task in body["task1"])
    assert all(task["visual"].get("categories") for task in body["task1"] if task["visual"]["kind"] == "process")


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
            json={"task_type": "task2", "prompt": "Some people think...", "essay": "x" * 60, "lang": "uz"},
            headers=headers,
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["band_overall"] == 6.5  # 6.4 -> nearest half band
        assert data["lexical"]["band"] == 7.0
        assert data["lexical"]["comment"]
        assert data["errors"][0]["fix"] == "people are"
        assert data["strengths"]
        assert data["feedback"]
        assert data["improved"]
        assert data["reward"]["xp_gained"] > 0

        # It shows up as the best Writing band on the overview.
        ov = (await client.get("/api/v1/ielts/overview", headers=headers)).json()
        assert ov["best_bands"]["writing"] == 6.5

        # …and as a history entry (Writing has no correct/total).
        assert ov["recent"][0]["skill"] == "writing"
        assert ov["recent"][0]["band"] == 6.5
        assert ov["recent"][0]["correct"] is None
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
