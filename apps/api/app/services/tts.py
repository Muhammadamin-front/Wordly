"""ElevenLabs text-to-speech, proxied and disk-cached.

The browser never sees the API key: the web client asks our /tts endpoint,
which serves from the local cache or fetches from ElevenLabs exactly once per
unique (voice, model, text). Corpus words are a finite set, so the cache
converges to "everything free" quickly.
"""
import hashlib
import pathlib
from typing import Optional

import httpx

from app.core.config import get_settings

ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


class TtsError(Exception):
    """Upstream synthesis failed (quota, auth, network)."""


def _cache_path(text: str, voice_id: Optional[str] = None) -> pathlib.Path:
    settings = get_settings()
    resolved_voice = voice_id or settings.ELEVENLABS_VOICE_ID
    digest = hashlib.sha1(
        "{}:{}:{}".format(resolved_voice, settings.ELEVENLABS_MODEL, text)
        .encode("utf-8")
    ).hexdigest()
    return pathlib.Path(settings.TTS_CACHE_DIR) / "{}.mp3".format(digest)


def cached_audio(text: str, voice_id: Optional[str] = None) -> Optional[bytes]:
    path = _cache_path(text, voice_id)
    return path.read_bytes() if path.exists() else None


async def synthesize(text: str, voice_id: Optional[str] = None) -> bytes:
    """Return MP3 audio for `text`, from disk cache or ElevenLabs.

    `voice_id` overrides the default configured voice — used for multi-speaker
    content (e.g. Full Mock listening dialogues) where different turns need
    different voices. Cache key includes the resolved voice so two voices of
    the same text never collide on one cache file.
    """
    cached = cached_audio(text, voice_id)
    if cached is not None:
        return cached

    settings = get_settings()
    resolved_voice = voice_id or settings.ELEVENLABS_VOICE_ID
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            ELEVENLABS_URL.format(voice_id=resolved_voice),
            params={"output_format": settings.ELEVENLABS_OUTPUT_FORMAT},
            headers={
                "xi-api-key": settings.ELEVENLABS_API_KEY,
                "accept": "audio/mpeg",
                "content-type": "application/json",
            },
            json={
                "text": text,
                "model_id": settings.ELEVENLABS_MODEL,
                "voice_settings": {
                    "stability": settings.ELEVENLABS_STABILITY,
                    "similarity_boost": settings.ELEVENLABS_SIMILARITY_BOOST,
                    "style": settings.ELEVENLABS_STYLE,
                    "use_speaker_boost": settings.ELEVENLABS_USE_SPEAKER_BOOST,
                },
            },
        )
    if response.status_code != 200:
        detail = response.text[:240].replace("\n", " ")
        raise TtsError("elevenlabs returned {}: {}".format(response.status_code, detail))

    audio = response.content
    path = _cache_path(text, voice_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(audio)
    return audio
