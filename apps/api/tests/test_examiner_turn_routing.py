"""The examiner turn end to end: a scripted line comes back marked static
and advances the part; an improvised question comes back dynamic."""
from typing import Any, List

from app.api.v1.coach import require_ai_client
from app.main import app
from app.services import examiner_script
from tests.conftest import register_user


class ScriptedExaminerAi:
    """Returns whatever reply the test asks for, so routing can be checked
    against exactly what the model 'said'."""

    def __init__(self, reply: str) -> None:
        self.reply = reply
        self.systems: List[str] = []

    async def text(self, *, system, prompt, max_tokens) -> str:
        return self.reply

    async def chat(self, *, system, messages, max_tokens) -> str:
        return self.reply

    async def json(self, *, system, prompt, schema, max_tokens) -> Any:
        self.systems.append(system)
        if "reply" in schema["properties"]:
            return {"reply": self.reply, "corrections": []}
        return {
            "band_overall": 6.0, "fluency": 6.0, "lexical": 6.0, "grammar": 6.0,
            "pronunciation": 6.0, "strengths": "-", "improvements": "-", "homework": "-",
        }


async def learner(client, email) -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


async def _start(client, headers, mode="ielts_full", part=1):
    resp = await client.post(
        "/api/v1/coach/sessions",
        json={"character": "examiner", "mode": mode, "ielts_part": part},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


async def _say(client, headers, session_id, reply):
    fake = ScriptedExaminerAi(reply)
    app.dependency_overrides[require_ai_client] = lambda: fake
    try:
        resp = await client.post(
            f"/api/v1/coach/sessions/{session_id}/message",
            json={"text": "I live in Tashkent."},
            headers=headers,
        )
    finally:
        app.dependency_overrides.pop(require_ai_client, None)
    return resp, fake


async def test_a_scripted_line_is_returned_as_static_audio(client):
    headers = await learner(client, "examiner-static@words.uz")
    session_id = await _start(client, headers)
    resp, _ = await _say(client, headers, session_id, examiner_script.EXAMINER_PHRASES["part3_intro"])
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["audio_type"] == "static"
    assert body["static_audio_id"] == "part3_intro"


async def test_an_improvised_question_is_returned_as_dynamic(client):
    headers = await learner(client, "examiner-dynamic@words.uz")
    session_id = await _start(client, headers)
    resp, _ = await _say(client, headers, session_id, "And what do you enjoy most about living there?")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["audio_type"] == "dynamic"
    assert body["static_audio_id"] is None


async def test_speaking_the_transition_advances_the_part(client):
    """The ceremonial line is the state change — the stored part must follow
    what the examiner actually said."""
    headers = await learner(client, "examiner-advance@words.uz")
    session_id = await _start(client, headers)

    resp, _ = await _say(client, headers, session_id, examiner_script.EXAMINER_PHRASES["part2_intro"])
    assert resp.json()["ielts_part"] == 2
    session = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
    assert session["ielts_part"] == 2

    resp, _ = await _say(client, headers, session_id, examiner_script.EXAMINER_PHRASES["part3_intro"])
    assert resp.json()["ielts_part"] == 3
    session = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
    assert session["ielts_part"] == 3


async def test_an_ordinary_reply_does_not_move_the_part(client):
    headers = await learner(client, "examiner-stay@words.uz")
    session_id = await _start(client, headers)
    resp, _ = await _say(client, headers, session_id, "Tell me about your daily routine.")
    assert resp.json()["ielts_part"] is None
    session = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
    assert session["ielts_part"] == 1


async def test_a_single_part_session_does_not_advance(client):
    """mode="ielts" is one part by definition; only a continuous test walks."""
    headers = await learner(client, "examiner-singlepart@words.uz")
    session_id = await _start(client, headers, mode="ielts")
    resp, _ = await _say(client, headers, session_id, examiner_script.EXAMINER_PHRASES["part3_intro"])
    assert resp.json()["ielts_part"] is None
    session = (await client.get(f"/api/v1/coach/sessions/{session_id}", headers=headers)).json()
    assert session["ielts_part"] == 1
    # Routing still applies — the line is recorded whatever the mode.
    assert resp.json()["audio_type"] == "static"


async def test_the_examiner_is_shown_the_script(client):
    """If the catalogue stops reaching the prompt, the model stops
    reproducing the lines and every one of them gets synthesized again."""
    headers = await learner(client, "examiner-prompt@words.uz")
    session_id = await _start(client, headers)
    _, fake = await _say(client, headers, session_id, "Tell me about your hometown.")
    system = fake.systems[0]
    assert examiner_script.EXAMINER_PHRASES["part2_intro"] in system
    assert "WORD FOR WORD" in system


async def test_a_non_examiner_character_is_never_routed_to_static(client):
    """Gordon saying the examiner's closing line must not play the
    examiner's recording in Gordon's voice."""
    headers = await learner(client, "examiner-other-char@words.uz")
    resp = await client.post(
        "/api/v1/coach/sessions", json={"character": "gordon", "mode": "chat"}, headers=headers
    )
    assert resp.status_code == 201, resp.text
    session_id = resp.json()["id"]
    resp, _ = await _say(client, headers, session_id, examiner_script.EXAMINER_PHRASES["test_end"])
    assert resp.json()["audio_type"] == "dynamic"
    assert resp.json()["static_audio_id"] is None
