"""The examiner's scripted lines — a fixed bank so the ceremony is
synthesized once for everyone instead of per session."""
import pytest

from app.core.config import get_settings
from app.services import examiner_script, tts
from tests.conftest import register_user


async def learner(client, email="examiner@words.uz") -> dict:
    data = await register_user(client, email=email)
    return {"Authorization": "Bearer " + data["access_token"]}


def test_phrase_order_and_bank_agree():
    """A phrase in one and not the other means the warm-up silently skips it
    (or asserts), so the first learner pays for it mid-test."""
    assert sorted(examiner_script.PHRASE_ORDER) == sorted(examiner_script.EXAMINER_PHRASES)
    assert len(examiner_script.PHRASE_ORDER) == len(set(examiner_script.PHRASE_ORDER))


def test_every_phrase_is_non_empty_and_stripped():
    """Leading/trailing whitespace would be a different cache key from the
    same line typed cleanly, quietly doubling the audio for one phrase."""
    for phrase_id, text in examiner_script.EXAMINER_PHRASES.items():
        assert text == text.strip(), phrase_id
        assert len(text) > 10, phrase_id


def test_phrases_are_distinct():
    """Two ids sharing one string is not a bug for cost (they share a cache
    entry) but means one of them is unreachable as a distinct beat."""
    texts = list(examiner_script.EXAMINER_PHRASES.values())
    assert len(texts) == len(set(texts))


def test_get_phrase_returns_none_for_unknown_id():
    assert examiner_script.get_phrase("no-such-phrase") is None
    assert examiner_script.get_phrase("greeting") is not None


def test_total_characters_matches_the_bank():
    assert examiner_script.total_characters() == sum(
        len(t) for t in examiner_script.EXAMINER_PHRASES.values()
    )


async def test_examiner_audio_requires_auth(client):
    assert (await client.get("/api/v1/tts/examiner/greeting")).status_code == 401


async def test_unknown_phrase_id_is_404_not_synthesized(client, monkeypatch):
    """The route must never reach the provider for an id it doesn't know —
    that is the whole reason it takes an id instead of free text."""
    headers = await learner(client, email="examiner-404@words.uz")

    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key", raising=False)

    async def explode(*args, **kwargs):
        raise AssertionError("synthesize must not be called for an unknown phrase")

    monkeypatch.setattr(tts, "synthesize", explode)
    resp = await client.get("/api/v1/tts/examiner/definitely-not-a-phrase", headers=headers)
    assert resp.status_code == 404


async def test_known_phrase_is_synthesized_verbatim(client, monkeypatch):
    """The bytes are keyed on the exact string; if the route trimmed or
    reworded it the cache would miss and every request would re-bill."""
    headers = await learner(client, email="examiner-ok@words.uz")

    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key", raising=False)

    seen = {}

    async def fake_synthesize(text, voice_id=None):
        seen["text"] = text
        return b"ID3fake-mp3-bytes"

    monkeypatch.setattr(tts, "synthesize", fake_synthesize)
    resp = await client.get("/api/v1/tts/examiner/part3_intro", headers=headers)
    assert resp.status_code == 200, resp.text
    assert resp.headers["content-type"] == "audio/mpeg"
    assert resp.content == b"ID3fake-mp3-bytes"
    assert seen["text"] == examiner_script.EXAMINER_PHRASES["part3_intro"]


async def test_examiner_audio_is_publicly_cacheable(client, monkeypatch):
    """Same bytes for every learner, so it should cache anywhere on the way
    — a private header here would mean re-fetching per user."""
    headers = await learner(client, email="examiner-cache@words.uz")

    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "test-key", raising=False)

    async def fake_synthesize(text, voice_id=None):
        return b"ID3x"

    monkeypatch.setattr(tts, "synthesize", fake_synthesize)
    resp = await client.get("/api/v1/tts/examiner/test_end", headers=headers)
    assert resp.status_code == 200
    assert "public" in resp.headers["cache-control"]
    assert "immutable" in resp.headers["cache-control"]


async def test_examiner_audio_503s_when_tts_is_unconfigured(client, monkeypatch):
    headers = await learner(client, email="examiner-off@words.uz")
    settings = get_settings()
    monkeypatch.setattr(settings, "ELEVENLABS_API_KEY", "", raising=False)
    resp = await client.get("/api/v1/tts/examiner/greeting", headers=headers)
    assert resp.status_code == 503


@pytest.mark.parametrize("phrase_id", ["part1_end", "part2_intro", "part3_intro", "test_end"])
def test_the_transitions_the_learner_hears_every_test_are_in_the_bank(phrase_id):
    """These are the lines that repeat in every single session — the ones
    the bank exists to stop re-buying."""
    assert examiner_script.get_phrase(phrase_id)
