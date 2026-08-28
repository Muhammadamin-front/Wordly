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
