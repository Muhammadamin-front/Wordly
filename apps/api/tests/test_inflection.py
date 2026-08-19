from app.services.inflection import inflection_candidates


def test_plurals():
    assert "bicycle" in inflection_candidates("bicycles")
    assert "car" in inflection_candidates("cars")
    assert "bus" in inflection_candidates("buses")
    assert "city" in inflection_candidates("cities")


def test_past_tense():
    assert "underperform" in inflection_candidates("underperformed")
    assert "compare" in inflection_candidates("compared")
    assert "stop" in inflection_candidates("stopped")
    assert "rely" in inflection_candidates("relied")


def test_gerund():
    assert "walk" in inflection_candidates("walking")
    assert "make" in inflection_candidates("making")
    assert "run" in inflection_candidates("running")
    assert "lie" in inflection_candidates("lying")


def test_comparative_superlative():
    assert "fast" in inflection_candidates("faster")
    assert "fast" in inflection_candidates("fastest")
    assert "easy" in inflection_candidates("easier")
    assert "easy" in inflection_candidates("easiest")


def test_never_returns_the_input_word_itself():
    for word in ("bicycles", "underperformed", "running", "fastest", "explain"):
        assert word not in inflection_candidates(word)


def test_short_words_are_left_alone():
    # Short enough that stripping a suffix would produce nonsense/empty
    # strings ("is" -> "i", "as" -> "a").
    assert inflection_candidates("is") == []
    assert inflection_candidates("as") == []
