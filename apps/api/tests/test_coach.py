from typing import Any, List

from app.api.v1.coach import require_ai_client
from app.main import app
from tests.conftest import register_user


class FakeCoachAi:
    """Deterministic stand-in. `json` branches on the schema: the turn schema
    carries a 'reply' property, the IELTS schema carries 'band_overall'."""

    def __init__(self) -> None:
        self.calls: List[str] = []

    async def text(self, *, system, prompt, max_tokens) -> str:
        return "ok"

    async def chat(self, *, system, messages, max_tokens) -> str:
        return "ok"

    async def json(self, *, system, prompt, schema, max_tokens) -> Any:
        props = schema["properties"]
        if "reply" in props:
            self.calls.append("turn")
            return {
                "reply": "Right, tell me more about your weekend. What did you get up to?",
                "corrections": [
                    {
                        "original": "I go to park yesterday",
                        "correction": "I went to the park yesterday",
                        "explanation": "Past tense + article 'the'.",
                        "category": "grammar",
                    }
                ],
            }
        self.calls.append("ielts")
        return {
            "band_overall": 6.4,  # should round to 6.5
            "fluency": 6.0,
            "lexical": 6.7,  # -> 6.5
            "grammar": 5.8,  # -> 6.0
            "pronunciation": 6.0,
            "strengths": "Good range of everyday vocabulary.",
            "improvements": "Work on past-tense accuracy.",
            "homework": "1) Describe yesterday in 5 sentences. 2) Learn 10 collocations.",
        }


def use_fake(fake: FakeCoachAi) -> None:
    app.dependency_overrides[require_ai_client] = lambda: fake


async def learner(client, email="coach-learner@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


class FakeStreamAi:
    async def text(self, *, system, prompt, max_tokens) -> str:
        return "That sounds lovely! What did you enjoy most? Tell me more."


async def test_coach_requires_auth(client):
    assert (await client.get("/api/v1/coach/characters")).status_code == 401


async def test_stream_turn_persists_across_session_boundary(client, monkeypatch):
    # The streaming body runs after the request handler returns; it must use its
    # own DB session (regression test for the closed-session bug).
    import app.services.coach_streaming as streaming

    monkeypatch.setattr(streaming, "get_ai_client", lambda: FakeStreamAi())
    headers = await learner(client, email="stream@words.uz")
    created = await client.post(
        "/api/v1/coach/sessions", json={"character": "alex", "mode": "chat"}, headers=headers
    )
    session_id = created.json()["id"]

    resp = await client.post(
        f"/api/v1/coach/sessions/{session_id}/stream-turn",
        json={"text": "I went hiking on Sunday"},
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.text
    assert '"type": "token"' in body
    assert '"type": "done"' in body
    assert '"xp_gained"' in body

    # The turn was actually persisted by the streaming body's own session.
    detail = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
    assert detail["turns"] == 1
    assert [m["role"] for m in detail["messages"]] == ["user", "assistant"]


def test_deepgram_url_encodes_sample_rate():
    from app.services.coach_live import deepgram_url

    url = deepgram_url(16000)
    assert url.startswith("wss://api.deepgram.com/v1/listen?")
    assert "sample_rate=16000" in url
    assert "encoding=linear16" in url
    assert "endpointing=400" in url


async def test_live_context_and_persist_turn(client, monkeypatch):
    from app.core.security import decode_access_token
    from app.services import coach_live

    data = await register_user(client, email="live@words.uz")
    headers = {"Authorization": "Bearer " + data["access_token"]}
    user_id = decode_access_token(data["access_token"])
    created = await client.post(
        "/api/v1/coach/sessions", json={"character": "alex", "mode": "chat"}, headers=headers
    )
    session_id = created.json()["id"]
    from uuid import UUID

    # Valid context loads a system prompt + (empty) history.
    system, history, error = await coach_live.load_live_context(user_id, UUID(session_id))
    assert error is None
    assert system and history == []

    # A bogus session id is rejected.
    _, _, err2 = await coach_live.load_live_context(user_id, UUID(int=0))
    assert err2 == "not_found"

    # Persisting a turn stores both messages, bumps turns, and awards XP.
    reward = await coach_live.persist_turn(user_id, UUID(session_id), "I like coffee", "Lovely!")
    assert reward is not None and reward["xp_gained"] > 0
    detail = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
    assert detail["turns"] == 1
    assert [m["role"] for m in detail["messages"]] == ["user", "assistant"]


async def test_generate_reply_uses_ai_client(client, monkeypatch):
    from app.services import coach_live

    monkeypatch.setattr(coach_live, "get_ai_client", lambda: FakeStreamAi())
    reply = await coach_live.generate_reply("system", [{"role": "user", "content": "hi"}])
    assert "lovely" in reply.lower()


async def test_stream_turn_without_ai_emits_error_event(client, monkeypatch):
    import app.services.coach_streaming as streaming

    monkeypatch.setattr(streaming, "get_ai_client", lambda: None)
    headers = await learner(client, email="stream-noai@words.uz")
    created = await client.post(
        "/api/v1/coach/sessions", json={"character": "mochi", "mode": "chat"}, headers=headers
    )
    session_id = created.json()["id"]
    resp = await client.post(
        f"/api/v1/coach/sessions/{session_id}/stream-turn",
        json={"text": "Hello"},
        headers=headers,
    )
    assert resp.status_code == 200  # stream opens, then emits an error event
    assert '"type": "error"' in resp.text


async def test_characters_lists_five_personas(client):
    headers = await learner(client)
    body = (await client.get("/api/v1/coach/characters", headers=headers)).json()
    keys = {c["key"] for c in body}
    assert keys == {"gordon", "mochi", "alex", "examiner", "raj"}
    gordon = next(c for c in body if c["key"] == "gordon")
    assert gordon["pitch"] and gordon["rate"]  # voice hints present


async def test_message_when_ai_not_configured_returns_503(client):
    headers = await learner(client)
    created = await client.post(
        "/api/v1/coach/sessions", json={"character": "alex", "mode": "chat"}, headers=headers
    )
    session_id = created.json()["id"]
    # No dependency override → require_ai_client sees no configured key.
    resp = await client.post(
        f"/api/v1/coach/sessions/{session_id}/message",
        json={"text": "Hello there"},
        headers=headers,
    )
    assert resp.status_code == 503


async def test_full_chat_turn_grades_and_awards_xp(client):
    fake = FakeCoachAi()
    use_fake(fake)
    try:
        headers = await learner(client)
        created = await client.post(
            "/api/v1/coach/sessions",
            json={"character": "gordon", "mode": "chat", "topic": "weekend"},
            headers=headers,
        )
        assert created.status_code == 201
        session_id = created.json()["id"]

        resp = await client.post(
            f"/api/v1/coach/sessions/{session_id}/message",
            json={"text": "I go to park yesterday"},
            headers=headers,
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "tell me more" in data["reply"].lower()
        assert len(data["corrections"]) == 1
        assert data["corrections"][0]["correction"] == "I went to the park yesterday"
        assert data["reward"]["xp_gained"] > 0

        # The turn is persisted with its correction, and the error is mined.
        detail = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
        assert detail["turns"] == 1
        roles = [m["role"] for m in detail["messages"]]
        assert roles == ["user", "assistant"]
        assert detail["messages"][0]["corrections"][0]["category"] == "grammar"

        dash = (await client.get("/api/v1/coach/dashboard", headers=headers)).json()
        assert dash["total_turns"] == 1
        assert dash["total_errors"] == 1
        assert any(p["character"] == "gordon" for p in dash["progress"])
        assert dash["recent_errors"][0]["original"] == "I go to park yesterday"
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_ielts_scoring_rounds_to_half_bands_and_completes(client):
    fake = FakeCoachAi()
    use_fake(fake)
    try:
        headers = await learner(client)
        created = await client.post(
            "/api/v1/coach/sessions",
            json={"character": "examiner", "mode": "ielts", "ielts_part": 1, "topic": "hometown"},
            headers=headers,
        )
        session_id = created.json()["id"]
        await client.post(
            f"/api/v1/coach/sessions/{session_id}/message",
            json={"text": "My hometown is small but I like it."},
            headers=headers,
        )

        score = await client.post(
            f"/api/v1/coach/sessions/{session_id}/score", headers=headers
        )
        assert score.status_code == 200, score.text
        report = score.json()["report"]
        assert report["band_overall"] == 6.5  # 6.4 -> nearest half band
        assert report["lexical"] == 6.5
        assert report["grammar"] == 6.0
        assert report["homework"].startswith("1)")

        detail = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
        assert detail["status"] == "done"

        # A finished session rejects further messages.
        resp = await client.post(
            f"/api/v1/coach/sessions/{session_id}/message",
            json={"text": "one more"},
            headers=headers,
        )
        assert resp.status_code == 409
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_score_rejects_non_ielts_session(client):
    fake = FakeCoachAi()
    use_fake(fake)
    try:
        headers = await learner(client)
        created = await client.post(
            "/api/v1/coach/sessions", json={"character": "mochi", "mode": "chat"}, headers=headers
        )
        session_id = created.json()["id"]
        resp = await client.post(f"/api/v1/coach/sessions/{session_id}/score", headers=headers)
        assert resp.status_code == 400
    finally:
        app.dependency_overrides.pop(require_ai_client, None)


async def test_cannot_open_another_users_session(client):
    fake = FakeCoachAi()
    use_fake(fake)
    try:
        alice = await learner(client, email="alice-coach@words.uz")
        created = await client.post(
            "/api/v1/coach/sessions", json={"character": "alex", "mode": "chat"}, headers=alice
        )
        session_id = created.json()["id"]
        bob = await learner(client, email="bob-coach@words.uz")
        resp = await client.get(f"/api/v1/coach/sessions/{session_id}", headers=bob)
        assert resp.status_code == 404
    finally:
        app.dependency_overrides.pop(require_ai_client, None)
