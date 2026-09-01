"""Free Dictionary API fallback for a vocabulary search that came back
empty — no API key, no AI quota, English-only (no Uzbek/Russian
translation). See api.v1.vocabulary's define-external route for how this
feeds the corpus, and services.vocabulary.find_existing_word for the
dedup this shares with the AI fallback (api.v1.ai's define-word)."""
from dataclasses import dataclass
from typing import Literal, Optional

import httpx

_URL = "https://freedictionaryapi.com/api/v1/entries/en/{word}"

# The API's partOfSpeech strings aren't guaranteed to match ours — map what
# we recognize, default the rest to "noun" rather than reject a real word
# over an unfamiliar POS label (WordCreate.pos has no hard enum either way).
_POS_MAP = {
    "noun": "noun", "proper noun": "noun",
    "verb": "verb",
    "adjective": "adjective",
    "adverb": "adverb",
    "preposition": "preposition",
    "conjunction": "conjunction",
    "pronoun": "pronoun",
    "interjection": "interjection",
    "phrase": "phrase", "idiom": "phrase",
}


@dataclass
class ExternalDefinition:
    headword: str
    pos: str
    ipa: Optional[str]
    definition_en: str
    example_en: Optional[str]


@dataclass
class ExternalLookup:
    status: Literal["found", "not_found", "unavailable"]
    definition: Optional[ExternalDefinition] = None


def _parse_definition(data: object, term: str) -> Optional[ExternalDefinition]:
    """Defensively parse an untrusted third-party response shape."""

    if not isinstance(data, dict):
        return None
    entries = data.get("entries")
    if not isinstance(entries, list):
        return None
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        senses = entry.get("senses")
        first_sense = senses[0] if isinstance(senses, list) and senses else None
        if not isinstance(first_sense, dict):
            continue
        definition = str(first_sense.get("definition", "")).strip()
        if not definition:
            continue
        examples = first_sense.get("examples")
        examples = examples if isinstance(examples, list) else []
        pronunciations = entry.get("pronunciations")
        pronunciations = pronunciations if isinstance(pronunciations, list) else []
        ipa = next(
            (
                pronunciation.get("text")
                for pronunciation in pronunciations
                if isinstance(pronunciation, dict) and pronunciation.get("text")
            ),
            None,
        )
        pos = _POS_MAP.get(str(entry.get("partOfSpeech", "")).strip().lower(), "noun")
        return ExternalDefinition(
            headword=str(data.get("word") or term).strip()[:80],
            pos=pos,
            ipa=str(ipa)[:80] if ipa else None,
            definition_en=definition[:1000],
            example_en=str(examples[0]).strip()[:500] if examples else None,
        )
    return None


async def lookup_external_word(word: str) -> ExternalLookup:
    """Return a three-state result so games can distinguish a miss from an outage."""
    term = word.strip()
    if not term:
        return ExternalLookup("not_found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                _URL.format(word=term.lower()), headers={"Accept": "application/json"}
            )
        if response.status_code != 200:
            return ExternalLookup("unavailable")
        data = response.json()
    except (httpx.HTTPError, ValueError):
        return ExternalLookup("unavailable")
    definition = _parse_definition(data, term)
    return ExternalLookup("found", definition) if definition else ExternalLookup("not_found")


async def fetch_external_definition(word: str) -> Optional[ExternalDefinition]:
    """Best-effort: any network/parse failure, or a genuine "not found"
    (HTTP 200 with an empty entries[] — this API doesn't 404), resolves to
    None. This is a nice-to-have fallback, never something that should
    surface as a 500 to the learner."""
    result = await lookup_external_word(word)
    return result.definition if result.status == "found" else None
