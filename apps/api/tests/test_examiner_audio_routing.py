"""Hybrid audio routing: scripted examiner lines play from pre-rendered
audio, everything the model writes for this learner is synthesized live."""
import pytest

from app.services import examiner_script


@pytest.mark.parametrize("phrase_id", list(examiner_script.EXAMINER_PHRASES))
def test_every_scripted_line_routes_to_its_own_recording(phrase_id):
    route = examiner_script.resolve_audio(examiner_script.EXAMINER_PHRASES[phrase_id])
    assert route.audio_type == "static"
    assert route.static_audio_id == phrase_id
    assert route.is_static


@pytest.mark.parametrize(
    "text",
    [
        "So, tell me about your hometown.",
        "Why do you think that is?",
        "",
        "   ",
        "That is the end of the speaking test. Thanks a lot.",  # paraphrase, not the script
    ],
)
def test_anything_not_in_the_script_is_synthesized_live(text):
    route = examiner_script.resolve_audio(text)
    assert route.audio_type == "dynamic"
    assert route.static_audio_id is None
    assert not route.is_static


@pytest.mark.parametrize(
    "mutate",
    [
        lambda t: t.upper(),
        lambda t: t.lower(),
        lambda t: f"   {t}  ",
        lambda t: t.replace(" ", "  "),
        lambda t: t.replace("'", "’"),
        lambda t: f"\n{t}\n",
    ],
)
def test_cosmetic_variation_still_hits_the_recording(mutate):
    """The model varies case, spacing and apostrophe style freely. Each
    variant is a different cache key, so folding them is what stops the same
    sentence being bought several times over."""
    canonical = examiner_script.EXAMINER_PHRASES["part2_intro"]
    route = examiner_script.resolve_audio(mutate(canonical))
    assert route.static_audio_id == "part2_intro"


def test_terminal_punctuation_is_not_folded():
    """"Do you understand?" and "Do you understand." are different deliveries,
    so they must not share one recording."""
    canonical = examiner_script.EXAMINER_PHRASES["part2_intro"]
    assert canonical.endswith("?")
    assert examiner_script.resolve_audio(canonical[:-1] + ".").audio_type == "dynamic"


def test_a_line_with_anything_appended_is_not_treated_as_scripted():
    """The prompt demands the fixed line be the whole reply. If the model
    tacks a question on, the recording no longer matches what was said."""
    canonical = examiner_script.EXAMINER_PHRASES["part3_intro"]
    route = examiner_script.resolve_audio(canonical + " So, why do people travel?")
    assert route.audio_type == "dynamic"


def test_part_transitions_are_derived_from_the_line_spoken():
    assert examiner_script.part_entered("part1_intro") == 1
    assert examiner_script.part_entered("part2_intro") == 2
    assert examiner_script.part_entered("part3_intro") == 3
    assert examiner_script.part_entered("greeting") is None
    assert examiner_script.part_entered(None) is None


def test_every_transition_id_exists_in_the_bank():
    """A transition keyed on an id that isn't in the bank can never fire,
    so the test would silently never leave Part 1."""
    for phrase_id in examiner_script.PART_ENTERED_BY_PHRASE:
        assert phrase_id in examiner_script.EXAMINER_PHRASES
    assert examiner_script.CLOSING_PHRASE_ID in examiner_script.EXAMINER_PHRASES


def test_catalogue_lists_every_line_verbatim():
    """The prompt must carry the exact wording — a truncated or reworded
    catalogue teaches the model a line that will not match the recording."""
    catalogue = examiner_script.catalogue_for_prompt()
    for phrase_id, text in examiner_script.EXAMINER_PHRASES.items():
        assert phrase_id in catalogue
        assert text in catalogue
