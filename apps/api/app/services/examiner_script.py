"""The examiner's fixed lines — the parts of a Speaking test that are read
from a script rather than improvised.

A real examiner recites the same ceremony every test: the greeting, the
hand-off into each part, the cue-card instructions, the closing. Only the
questions themselves vary. Our examiner, though, is an LLM writing every
utterance fresh, so those ceremonial lines came out slightly different each
session ("Now let's move to part two" / "Let's move on to Part 2, shall
we") — and services.tts caches per exact string, so no two sessions ever
shared a cache entry for them. Every test re-bought audio the learner had
already heard.

Holding the ceremony as fixed strings makes it synthesizable exactly once,
for everyone, forever. It is also more faithful: these lines are scripted in
the real exam, so improvising them was wrong on its own terms.

The model still writes every question. This bank covers only what a real
examiner reads verbatim.
"""
from typing import Dict, List, Optional

# Keys are stable ids: they are part of the audio cache key by way of the
# text, and clients request phrases by id, so renaming one is a breaking
# change. Wording is the standard British examiner script.
EXAMINER_PHRASES: Dict[str, str] = {
    # --- Opening ceremony -------------------------------------------------
    "greeting": (
        "Good morning. My name is Vocora, and this is the IELTS Speaking test. "
        "Could you tell me your full name, please?"
    ),
    "id_check": "Thank you. And could you tell me where you're from?",
    "part1_intro": (
        "Now, in this first part, I'd like to ask you some questions about yourself."
    ),
    # --- Part 1 to Part 2 -------------------------------------------------
    "part1_end": "Thank you. That is the end of Part 1.",
    "part2_intro": (
        "Now I'm going to give you a topic, and I'd like you to talk about it for one to "
        "two minutes. Before you talk, you'll have one minute to think about what you're "
        "going to say. You can make some notes if you wish. Do you understand?"
    ),
    "part2_prepare": "Here is your topic. You have one minute to prepare.",
    "part2_begin": "All right. Remember, you have one to two minutes for this. Please begin.",
    "part2_end": "Thank you. Thank you very much.",
    # --- Part 2 to Part 3 -------------------------------------------------
    "part3_intro": (
        "Now let's move on to Part 3. I'd like to discuss some more general questions "
        "related to that topic."
    ),
    # --- Closing ----------------------------------------------------------
    "test_end": "That is the end of the speaking test. Thank you very much.",
    # --- Housekeeping the examiner may need mid-test -----------------------
    "repeat": "I'm sorry, could you say that again, please?",
    "moving_on": "Thank you. Let's move on.",
    "time_up": "I'm afraid that's the end of the time for this part.",
}

# Order matters only for warm-up reporting and for the client that walks a
# test start-to-finish; the bank itself is addressed by id.
PHRASE_ORDER: List[str] = [
    "greeting",
    "id_check",
    "part1_intro",
    "part1_end",
    "part2_intro",
    "part2_prepare",
    "part2_begin",
    "part2_end",
    "part3_intro",
    "test_end",
    "repeat",
    "moving_on",
    "time_up",
]


def get_phrase(phrase_id: str) -> Optional[str]:
    """The exact text for a phrase id, or None if the id is unknown.

    Callers must synthesize this string verbatim — trimming or rewording it
    produces a different cache key and re-bills the synthesis.
    """
    return EXAMINER_PHRASES.get(phrase_id)


def total_characters() -> int:
    """Characters across the whole bank — what one full warm-up costs, and
    the per-test spend it replaces for every session after the first."""
    return sum(len(text) for text in EXAMINER_PHRASES.values())


# --- Audio routing -----------------------------------------------------------
#
# Which of the examiner's utterances can be played from pre-rendered audio and
# which have to be synthesized on the spot.
#
# The model is NOT the authority here. It is told the catalogue and asked to
# reuse a line verbatim when one fits, and it may hint at the id it used, but
# the routing decision is taken server-side by matching the text it actually
# produced. Trusting the hint breaks in three ways that all cost money or
# credibility: a hint of "part3_intro" attached to different words plays audio
# that contradicts the transcript; an invented id 404s in the middle of an
# exam; and a line that IS in the bank but is marked dynamic gets re-bought.
# Resolving from the text is self-correcting — if the model reproduced the
# line, it routes to cache no matter what it claimed.

import re
from dataclasses import dataclass


def _normalize(text: str) -> str:
    """Fold the differences that don't change what a listener hears.

    Case, surrounding whitespace, doubled spaces and the curly/straight
    apostrophe split all produce a different cache key for identical speech,
    and the model varies all four freely. Terminal punctuation is kept: "Do
    you understand?" and "Do you understand." are different deliveries.
    """
    folded = text.strip().casefold().replace("’", "'")
    return re.sub(r"\s+", " ", folded)


_PHRASE_ID_BY_NORMALIZED = {
    _normalize(text): phrase_id for phrase_id, text in EXAMINER_PHRASES.items()
}


@dataclass(frozen=True)
class AudioRoute:
    """How one examiner utterance should be voiced."""

    audio_type: str  # "static" | "dynamic"
    static_audio_id: Optional[str]  # set iff audio_type == "static"

    @property
    def is_static(self) -> bool:
        return self.audio_type == "static"


DYNAMIC = AudioRoute(audio_type="dynamic", static_audio_id=None)


def resolve_audio(text: str) -> AudioRoute:
    """Route one examiner utterance to pre-rendered audio or live synthesis.

    Matching is on normalized text, so the model gets the routing for free by
    reproducing a scripted line — it never has to name an id correctly.
    """
    phrase_id = _PHRASE_ID_BY_NORMALIZED.get(_normalize(text))
    if phrase_id is None:
        return DYNAMIC
    return AudioRoute(audio_type="static", static_audio_id=phrase_id)


def catalogue_for_prompt() -> str:
    """The scripted lines, formatted for a system prompt.

    Listed verbatim because reproducing a line exactly is what routes it to
    cached audio; paraphrasing silently costs a synthesis.
    """
    return "\n".join(
        '- {}: "{}"'.format(phrase_id, EXAMINER_PHRASES[phrase_id])
        for phrase_id in PHRASE_ORDER
    )


# --- Part progression --------------------------------------------------------
#
# The ceremonial line IS the state transition: an examiner who has just said
# "Now let's move on to Part 3" is, by definition, in Part 3. Deriving the
# progression from the line it spoke keeps one mechanism instead of two, so
# the spoken test and the stored ielts_part cannot disagree — which they can
# if the model reports a part number in a field alongside unrelated speech.
PART_ENTERED_BY_PHRASE: Dict[str, int] = {
    "part1_intro": 1,
    "part2_intro": 2,
    "part3_intro": 3,
}

# Saying this ends the test, whatever part it was in.
CLOSING_PHRASE_ID = "test_end"


def part_entered(phrase_id: Optional[str]) -> Optional[int]:
    """The part this scripted line moves the test into, if it moves it."""
    if phrase_id is None:
        return None
    return PART_ENTERED_BY_PHRASE.get(phrase_id)
