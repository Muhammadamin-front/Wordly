"""TTS proxy: auth, graceful 503, disk cache, no key leakage to clients."""
import pytest

from app.core.config import get_settings
from app.services import tts
from tests.conftest import register_user
from tests.test_vocabulary import WORD_PAYLOAD, make_admin


async def auth_headers(client) -> dict:
    data = await register_user(client, email="speaker@words.uz")
    return {"Authorization": "Bearer " + data["access_token"]}


async def seed_word(client, **overrides) -> dict:
    admin_headers = await make_admin(client)
    response = await client.post(
        "/api/v1/admin/words", json={**WORD_PAYLOAD, **overrides}, headers=admin_headers
    )
    assert response.status_code == 201, response.text
    return response.json()


async def test_tts_requires_auth(client):
    response = await client.get("/api/v1/tts?text=hello")
    assert response.status_code == 401


async def test_tts_503_when_not_configured(client):
    headers = await auth_headers(client)
    response = await client.get("/api/v1/tts?text=hello", headers=headers)
    assert response.status_code == 503


async def test_tts_serves_audio_when_configured(client, tmp_path, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key")
    monkeypatch.setattr(settings, "TTS_CACHE_DIR", str(tmp_path))

    async def fake_synthesize(text):
        return b"ID3fake-mp3-bytes"

    monkeypatch.setattr(tts, "synthesize", fake_synthesize)
    headers = await auth_headers(client)
    response = await client.get("/api/v1/tts?text=facilitate", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert "max-age" in response.headers["cache-control"]
    assert response.content == b"ID3fake-mp3-bytes"


async def test_tts_rejects_overlong_text(client, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key")
    headers = await auth_headers(client)
    response = await client.get("/api/v1/tts?text=" + "a" * 300, headers=headers)
    assert response.status_code == 422


async def test_tts_word_503_when_not_configured(client):
    # No Authorization header anywhere in this test — that's the point.
    response = await client.get("/api/v1/tts/word?headword=facilitate")
    assert response.status_code == 503


async def test_tts_word_needs_no_auth_but_only_covers_published_words(client, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key")

    async def fake_synthesize(text):
        return b"ID3fake-mp3-bytes"

    monkeypatch.setattr(tts, "synthesize", fake_synthesize)
    await seed_word(client, headword="facilitate")
    found = await client.get("/api/v1/tts/word?headword=facilitate")
    assert found.status_code == 200
    assert "public" in found.headers["cache-control"]

    made_up = await client.get("/api/v1/tts/word?headword=zzz-not-a-real-word")
    assert made_up.status_code == 404


async def test_tts_word_cannot_be_used_for_arbitrary_text(client, monkeypatch):
    """The guest endpoint must reject anything that isn't a real published
    headword — otherwise it's an anonymous, unrate-limited-by-account proxy
    onto a paid synthesis provider."""
    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key")

    async def fail_if_called(text):
        raise AssertionError("synthesize() must not run for an unknown headword")

    monkeypatch.setattr(tts, "synthesize", fail_if_called)
    response = await client.get(
        "/api/v1/tts/word?headword=this is not a single published headword"
    )
    assert response.status_code == 404


async def test_synthesize_hits_network_once_then_disk(tmp_path, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key")
    monkeypatch.setattr(settings, "TTS_CACHE_DIR", str(tmp_path))
    calls = {"n": 0}

    class FakeResponse:
        status_code = 200
        content = b"AUDIO"

    class FakeClient:
        def __init__(self, **kwargs): ...
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            return False
        async def post(self, *args, **kwargs):
            calls["n"] += 1
            assert kwargs["headers"]["accept"] == "audio/mpeg"
            assert kwargs["params"]["output_format"] == settings.ELEVENLABS_OUTPUT_FORMAT
            assert kwargs["json"]["voice_settings"]["use_speaker_boost"] is True
            return FakeResponse()

    monkeypatch.setattr(tts.httpx, "AsyncClient", FakeClient)
    assert await tts.synthesize("cached word") == b"AUDIO"
    assert await tts.synthesize("cached word") == b"AUDIO"  # served from disk
    assert calls["n"] == 1


async def test_synthesize_raises_on_upstream_error(tmp_path, monkeypatch):
    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key")
    monkeypatch.setattr(settings, "TTS_CACHE_DIR", str(tmp_path))

    class FakeResponse:
        status_code = 402
        content = b"{}"
        text = '{"detail":"quota exceeded"}'

    class FakeClient:
        def __init__(self, **kwargs): ...
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            return False
        async def post(self, *args, **kwargs):
            return FakeResponse()

    monkeypatch.setattr(tts.httpx, "AsyncClient", FakeClient)
    with pytest.raises(tts.TtsError):
        await tts.synthesize("no quota")
