"""TTS proxy: auth, graceful 503, disk cache, no key leakage to clients."""
import pytest

from app.core.config import get_settings
from app.services import tts
from tests.conftest import register_user


async def auth_headers(client) -> dict:
    data = await register_user(client, email="speaker@words.uz")
    return {"Authorization": "Bearer " + data["access_token"]}


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
