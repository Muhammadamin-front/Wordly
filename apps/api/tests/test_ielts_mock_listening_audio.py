"""Multi-voice section-audio route for the Full Mock's Listening leg."""
import tempfile
from types import SimpleNamespace

from app.api.v1 import ielts_mock as ielts_mock_api
from app.services import listening_audio, listening_content
from app.services import tts as tts_service
from tests.test_ielts_mock import learner, premium_learner

FAKE_TURNS = [
    {"speaker": "Receptionist", "role": "a", "text": "Good morning, how can I help?"},
    {"speaker": "Student", "role": "b", "text": "I'd like to ask about enrolling."},
]


async def test_free_user_can_fetch_section_audio_same_as_premium(client):
    # No premium/coin gate on this route by design (see its docstring): the
    # real gate is paying to start the session; a free user re-fetching
    # narration for a session they already paid for must not be blocked or
    # re-charged. Absent test TTS config, the only observable difference
    # from a premium user is none — both get 503 (not 402).
    headers = await learner(client, email="listen-audio-free@words.uz")
    resp = await client.get("/api/v1/ielts/mock/listening/test-1/section/1/audio", headers=headers)
    assert resp.status_code == 503


async def test_tts_not_configured_returns_503(client):
    headers = await premium_learner(client, email="listen-audio-503@words.uz")
    resp = await client.get("/api/v1/ielts/mock/listening/test-1/section/1/audio", headers=headers)
    assert resp.status_code == 503


async def test_unknown_section_number_404s(client, monkeypatch):
    headers = await premium_learner(client, email="listen-audio-badsection@words.uz")
    monkeypatch.setattr(ielts_mock_api, "get_settings", lambda: SimpleNamespace(tts_enabled=True))
    resp = await client.get("/api/v1/ielts/mock/listening/test-1/section/5/audio", headers=headers)
    assert resp.status_code == 404


async def test_unknown_slug_404s(client, monkeypatch):
    headers = await premium_learner(client, email="listen-audio-badslug@words.uz")
    monkeypatch.setattr(ielts_mock_api, "get_settings", lambda: SimpleNamespace(tts_enabled=True))
    monkeypatch.setattr(listening_content, "get_section_turns", lambda slug, section: None)
    resp = await client.get("/api/v1/ielts/mock/listening/nope/section/1/audio", headers=headers)
    assert resp.status_code == 404


async def test_section_audio_concatenates_turns_with_per_role_voice(client, monkeypatch):
    headers = await premium_learner(client, email="listen-audio-ok@words.uz")

    calls = []

    async def fake_synthesize(text, voice_id=None):
        calls.append((text, voice_id))
        return b"A" if voice_id != "voice-b" else b"B"

    # A fresh dir per test run — a fixed path would let the section-level
    # disk cache short-circuit synthesis on a repeat run and hide bugs (or,
    # as happened once, make a passing test start failing on its assertion
    # about *how many times* fake_synthesize was called).
    cache_dir = tempfile.mkdtemp()
    monkeypatch.setattr(ielts_mock_api, "get_settings", lambda: SimpleNamespace(
        tts_enabled=True,
        TTS_CACHE_DIR=cache_dir,
        ELEVENLABS_MODEL="eleven_flash_v2_5",
        ELEVENLABS_VOICE_ID="voice-a",
        ELEVENLABS_VOICE_ID_B="voice-b",
    ))
    monkeypatch.setattr(listening_audio, "get_settings", lambda: SimpleNamespace(
        TTS_CACHE_DIR=cache_dir,
        ELEVENLABS_MODEL="eleven_flash_v2_5",
        ELEVENLABS_VOICE_ID="voice-a",
        ELEVENLABS_VOICE_ID_B="voice-b",
    ))
    monkeypatch.setattr(listening_content, "get_section_turns", lambda slug, section: FAKE_TURNS)
    monkeypatch.setattr(tts_service, "synthesize", fake_synthesize)

    resp = await client.get("/api/v1/ielts/mock/listening/test-1/section/1/audio", headers=headers)
    assert resp.status_code == 200, resp.text
    assert resp.headers["content-type"] == "audio/mpeg"
    assert resp.content == b"AB"  # concatenated, in turn order
    assert calls == [
        ("Good morning, how can I help?", "voice-a"),
        ("I'd like to ask about enrolling.", "voice-b"),
    ]
