"""Guesses at the dictionary base form of an inflected English word.

The vocabulary corpus indexes lemmas ("bicycle", "rely", "fast"), but reading
passages are running text full of their inflected forms ("bicycles",
"relied", "fastest") — an exact match against Word.headword misses most of
them. This deliberately over-generates candidates rather than trying to be
a correct stemmer: a wrong candidate just fails to match anything in the
corpus, so there is no cost to trying a few extra, and no dependency on an
NLP library for what is otherwise a plain equality lookup.
"""

VOWELS = "aeiou"


def inflection_candidates(word: str) -> list[str]:
    w = word.lower()
    candidates: list[str] = []

    def add(candidate: str) -> None:
        if candidate and candidate != w and candidate not in candidates:
            candidates.append(candidate)

    # Plural / third-person -s.
    if w.endswith("ies") and len(w) > 4:
        add(w[:-3] + "y")  # cities -> city
    if w.endswith("es") and len(w) > 3:
        add(w[:-2])  # buses -> bus, watches -> watch
    if w.endswith("s") and not w.endswith("ss") and len(w) > 3:
        add(w[:-1])  # bicycles -> bicycle, cars -> car

    # Past tense / past participle.
    if w.endswith("ied") and len(w) > 4:
        add(w[:-3] + "y")  # relied -> rely, studied -> study
    if w.endswith("ed") and len(w) > 3:
        add(w[:-2])  # underperformed -> underperform
        add(w[:-1])  # compared -> compare
        if len(w) > 4 and w[-3] == w[-4] and w[-3] not in VOWELS:
            add(w[:-3])  # stopped -> stop

    # Present participle / gerund.
    if w.endswith("ying") and len(w) > 4:
        add(w[:-4] + "ie")  # lying -> lie
    if w.endswith("ing") and len(w) > 4:
        add(w[:-3])  # walking -> walk
        add(w[:-3] + "e")  # making -> make, hoping -> hope
        if len(w) > 5 and w[-4] == w[-5] and w[-4] not in VOWELS:
            add(w[:-4])  # running -> run, stopping -> stop

    # Comparative / superlative.
    if w.endswith("iest") and len(w) > 5:
        add(w[:-4] + "y")  # easiest -> easy
    elif w.endswith("ier") and len(w) > 4:
        add(w[:-3] + "y")  # easier -> easy
    elif w.endswith("est") and len(w) > 4:
        add(w[:-3])  # fastest -> fast
    elif w.endswith("er") and len(w) > 3:
        add(w[:-2])  # faster -> fast

    # Adverb -ly.
    if w.endswith("ily") and len(w) > 5:
        add(w[:-3] + "y")  # happily -> happy, easily -> easy
    if w.endswith("ally") and len(w) > 6:
        add(w[:-4])  # basically -> basic, dramatically -> dramatic
    if w.endswith("ly") and len(w) > 3:
        add(w[:-2])  # slowly -> slow, slightly -> slight, totally -> total

    return candidates
