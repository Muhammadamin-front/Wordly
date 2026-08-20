from scripts.remove_teaching_note_examples import is_teaching_note
from scripts.localize_word_examples import is_teaching_note as translate_is_teaching_note


def test_flags_the_two_known_junk_patterns():
    assert is_teaching_note('"sister" means A girl or woman with the same parents as you.')
    assert is_teaching_note('In this lesson, "son" is used as noun and can mean "o\'g\'il" in Uzbek.')


def test_does_not_flag_a_genuine_example():
    assert not is_teaching_note("We've run out of milk, so can you pick some up on your way back?")
    assert not is_teaching_note("Stress is often what triggers his headaches.")


def test_matches_the_translation_script_s_own_filter():
    # Both scripts decide what counts as a real example independently — one
    # to skip translating it, the other to delete it outright. If they ever
    # disagree, either a genuine example gets silently deleted or a junk row
    # survives cleanup, so the two filters must stay identical.
    samples = [
        '"cat" means a small domesticated animal.',
        "In this lesson, we cover greetings.",
        "She adopted a cat from the shelter last spring.",
        "",
        'Some sentence that mentions "quotes" mid-way, not at the start.',
    ]
    for sentence in samples:
        assert is_teaching_note(sentence) == translate_is_teaching_note(sentence), sentence
