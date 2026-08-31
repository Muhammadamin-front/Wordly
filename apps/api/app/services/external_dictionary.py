"""Free Dictionary API fallback for a vocabulary search that came back
empty — no API key, no AI quota, English-only (no Uzbek/Russian
translation). See api.v1.vocabulary's define-external route for how this
feeds the corpus, and services.vocabulary.find_existing_word for the
dedup this shares with the AI fallback (api.v1.ai's define-word)."""
from dataclasses import dataclass
from typing import Optional

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


async def fetch_external_definition(word: str) -> Optional[ExternalDefinition]:
    """Best-effort: any network/parse failure, or a genuine "not found"
    (HTTP 200 with an empty entries[] — this API doesn't 404), resolves to
    None. This is a nice-to-have fallback, never something that should
    surface as a 500 to the learner."""
    term = word.strip()
    if not term:
        return None
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                _URL.format(word=term.lower()), headers={"Accept": "application/json"}
            )
        if response.status_code != 200:
            return None
        data = response.json()
    except (httpx.HTTPError, ValueError):
        return None

    for entry in data.get("entries") or []:
        senses = entry.get("senses") or []
        definition = str(senses[0].get("definition", "")).strip() if senses else ""
        if not definition:
            continue
        examples = senses[0].get("examples") or []
        pronunciations = entry.get("pronunciations") or []
        ipa = next((p.get("text") for p in pronunciations if p.get("text")), None)
        pos = _POS_MAP.get(str(entry.get("partOfSpeech", "")).strip().lower(), "noun")
        return ExternalDefinition(
            headword=str(data.get("word") or term).strip()[:80],
            pos=pos,
            ipa=str(ipa)[:80] if ipa else None,
            definition_en=definition[:1000],
            example_en=str(examples[0]).strip()[:500] if examples else None,
        )
    return None
