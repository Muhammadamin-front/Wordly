"""IELTS band-scoring primitives — the one place these live.

Previously duplicated: `_half_band()` existed identically in both
`services/ielts.py` and `services/coach.py`, both using Python's
banker's-rounding `round()`, which is wrong for IELTS's actual convention
(a mean ending in .25 or .75 always rounds UP to the nearest half band —
e.g. 6.25 -> 6.5 — not to the nearest even value). `round(6.25 * 2) / 2`
gives 6.0, not 6.5. `_round_half_up_to_half()` fixes that.

Also consolidates the raw-score -> band conversion tables, which had
drifted between a server copy (`services/ielts.py`) and a client copy
(`apps/web/lib/reading-practice.ts`).
"""
import math
from typing import Any

# Published raw-score conversions for the 40-question papers, expressed as
# the ratio at the bottom of each band.
_ACADEMIC_READING_BANDS = [
    (0.975, 9.0), (0.925, 8.5), (0.875, 8.0), (0.825, 7.5), (0.750, 7.0),
    (0.675, 6.5), (0.575, 6.0), (0.475, 5.5), (0.375, 5.0), (0.325, 4.5),
    (0.250, 4.0), (0.200, 3.5), (0.150, 3.0),
]

# General Training Reading is marked more strictly than Academic.
#
# BUG FIX: this table previously had (0.375, 5.5) immediately above
# (0.375, 5.0) — identical thresholds. band_from_ratio() returns on the
# first threshold a ratio clears, so any ratio in [0.375, 0.600) matched
# the 5.5 row first, making band 5.0 unreachable. Corrected the 5.5
# threshold to 0.500 (stricter than Academic's 0.475, per this table's own
# "marked more strictly" comment, and evenly spaced between the unchanged
# neighboring 6.0/0.600 and 5.0/0.375 rows). Not independently re-verified
# against a published Cambridge/IDP conversion table — flag for a content
# review before this table backs a paid, official-feeling exam.
_GENERAL_READING_BANDS = [
    (1.000, 9.0), (0.975, 8.5), (0.900, 8.0), (0.850, 7.5), (0.775, 7.0),
    (0.700, 6.5), (0.600, 6.0), (0.500, 5.5), (0.375, 5.0), (0.300, 4.5),
    (0.225, 4.0), (0.150, 3.5), (0.100, 3.0),
]

_LISTENING_BANDS = [
    (0.975, 9.0), (0.925, 8.5), (0.875, 8.0), (0.800, 7.5), (0.750, 7.0),
    (0.650, 6.5), (0.575, 6.0), (0.450, 5.5), (0.400, 5.0), (0.325, 4.5),
    (0.250, 4.0), (0.200, 3.5), (0.150, 3.0),
]

_BAND_TABLES = {
    "reading": _ACADEMIC_READING_BANDS,
    "general_reading": _GENERAL_READING_BANDS,
    "listening": _LISTENING_BANDS,
}

# Below this many questions one answer moves the band by a whole step or
# more, so the figure is reported as approximate and the UI shows a range.
RELIABLE_QUESTION_COUNT = 20


def band_from_ratio(ratio: float, kind: str = "reading") -> float:
    """Map a correct-answer ratio to an IELTS band using the published tables."""
    for threshold, band in _BAND_TABLES.get(kind, _ACADEMIC_READING_BANDS):
        if ratio >= threshold:
            return band
    return 2.5


def _round_half_up_to_half(value: float) -> float:
    """Round to the nearest 0.5, with .25/.75 remainders rounding UP — the
    actual IELTS convention, not Python's banker's rounding."""
    return math.floor(value * 2 + 0.5) / 2


def half_band(value: Any) -> float:
    """Clamp to the IELTS 0-9 scale and round to the nearest half band."""
    try:
        band = float(value)
    except (TypeError, ValueError):
        band = 5.0
    return max(0.0, min(9.0, _round_half_up_to_half(band)))


def combine_writing_band(task1: float, task2: float) -> float:
    """Task 2 counts double toward the Writing band, per real IELTS weighting."""
    return half_band((task1 + 2 * task2) / 3)


def overall_band(listening: float, reading: float, writing: float, speaking: float) -> float:
    """The four skill bands, unweighted, rounded to the nearest half band."""
    return half_band((listening + reading + writing + speaking) / 4)
