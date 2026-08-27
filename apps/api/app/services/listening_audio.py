"""Multi-voice narration for Full Mock listening sections.

Each section's script is a list of speaker turns (role "a"/"b"/"narrator").
Every turn is synthesized individually (and disk-cached individually by
services.tts's existing per-text cache), then concatenated in order and the
concatenated result is cached again under its own key so a repeat request
for the same section skips both the per-turn loop and the concatenation.

Concatenation is naive byte-concatenation of MP3 segments, not a proper
audio-library merge (no ffmpeg/pydub dependency exists in this project).
ELEVENLABS_OUTPUT_FORMAT is constant-bitrate ("mp3_44100_128"), which is
exactly the case naive concatenation works acceptably for — worst case is a
barely-audible click at a turn boundary, not corruption. Revisit with a real
audio library only if that turns out to be audibly bad in practice.
"""
import hashlib
import pathlib
from typing import Optional

from app.core.config import get_settings
from app.services import listening_content, tts


def _voice_for_role(role: str) -> Optional[str]:
    settings = get_settings()
    if role == "b":
        return settings.ELEVENLABS_VOICE_ID_B or settings.ELEVENLABS_VOICE_ID
    return settings.ELEVENLABS_VOICE_ID


def _section_cache_dir() -> pathlib.Path:
    # Not memoized: settings can change between calls (tests monkeypatch
    # get_settings per-case), and mkdir(exist_ok=True) is cheap enough that
    # caching this buys nothing but staleness risk.
    settings = get_settings()
    path = pathlib.Path(settings.TTS_CACHE_DIR) / "sections"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _section_cache_path(slug: str, section: int, turns: list) -> pathlib.Path:
    settings = get_settings()
    voice_b = settings.ELEVENLABS_VOICE_ID_B or settings.ELEVENLABS_VOICE_ID
    fingerprint = "|".join("{}:{}".format(t["role"], t["text"]) for t in turns)
    digest = hashlib.sha1(
        "{}:{}:{}:{}:{}:{}".format(
            slug, section, settings.ELEVENLABS_MODEL,
            settings.ELEVENLABS_VOICE_ID, voice_b, fingerprint,
        ).encode("utf-8")
    ).hexdigest()
    return _section_cache_dir() / "{}.mp3".format(digest)


async def synthesize_section(slug: str, section: int) -> Optional[bytes]:
    """Return the concatenated MP3 for one section, or None if the slug/
    section is unknown (the route turns that into a 404)."""
    turns = listening_content.get_section_turns(slug, section)
    if turns is None:
        return None

    cache_path = _section_cache_path(slug, section, turns)
    if cache_path.exists():
        return cache_path.read_bytes()

    parts = []
    for turn in turns:
        audio = await tts.synthesize(turn["text"], voice_id=_voice_for_role(turn["role"]))
        parts.append(audio)
    combined = b"".join(parts)
    cache_path.write_bytes(combined)
    return combined
