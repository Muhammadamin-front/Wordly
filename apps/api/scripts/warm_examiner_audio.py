"""Synthesize the examiner's scripted lines once, into the TTS disk cache.

Usage: .venv/bin/python -m scripts.warm_examiner_audio [--dry-run]

Run once per deployment that changes the phrase bank, the voice, or the
model — all three are part of the cache key, so changing any of them orphans
the old audio and the next learner pays to re-synthesize mid-test. Warming
up front keeps that cost off the learner's first session, and off the clock:
a cold line is a multi-second pause in the middle of a speaking exam.

Safe to re-run: anything already cached is skipped without calling the API.
"""
import asyncio
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.core.config import get_settings  # noqa: E402
from app.services import examiner_script, tts  # noqa: E402


async def main(dry_run: bool = False) -> None:
    settings = get_settings()
    if not settings.tts_enabled and not dry_run:
        print("TTS is not configured (ELEVENLABS_API_KEY is empty) — nothing to warm.")
        raise SystemExit(1)

    voice = settings.ELEVENLABS_VOICE_ID
    total = len(examiner_script.PHRASE_ORDER)
    cached = synthesized = pending = failed = 0
    billed_chars = 0

    print(f"{total} phrases, {examiner_script.total_characters()} characters total")
    print(f"voice={voice} model={settings.ELEVENLABS_MODEL}\n")

    for phrase_id in examiner_script.PHRASE_ORDER:
        text = examiner_script.get_phrase(phrase_id)
        assert text is not None, phrase_id  # PHRASE_ORDER is checked against the bank in tests

        if tts.cached_audio(text, voice) is not None:
            cached += 1
            print(f"  = {phrase_id:<16} already cached")
            continue
        if dry_run:
            pending += 1
            billed_chars += len(text)
            print(f"  + {phrase_id:<16} would synthesize ({len(text)} chars)")
            continue
        try:
            audio = await tts.synthesize(text, voice_id=voice)
        except tts.TtsError as exc:
            failed += 1
            print(f"  ! {phrase_id:<16} FAILED: {exc}")
            continue
        synthesized += 1
        billed_chars += len(text)
        print(f"  + {phrase_id:<16} {len(audio):,} bytes ({len(text)} chars)")

    verb, count = ("would synthesize", pending) if dry_run else ("synthesized", synthesized)
    print(f"\n{cached} already cached, {verb} {count}, {failed} failed")
    print(f"{billed_chars} characters billed this run; 0 on every run after this one")
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main(dry_run="--dry-run" in sys.argv))
