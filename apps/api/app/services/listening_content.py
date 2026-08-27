"""Loader for Full Mock listening-test audio content.

Content (section scripts, turns, speaker roles) is authored once as TS in
apps/web/lib/listening-practice.ts and mirrored here as JSON by
apps/web/scripts/emit-listening-audio-content.mjs — this module never sees
questions or answers, only the text/voice data needed to synthesize audio.
Keeping the answer key out of this catalog entirely means this route can
never leak it, by construction, not by convention.
"""
import json
import pathlib
from functools import lru_cache
from typing import Any, Dict, List, Optional

CONTENT_DIR = pathlib.Path(__file__).resolve().parent.parent / "content" / "listening"


@lru_cache(maxsize=None)
def _load(slug: str) -> Optional[Dict[str, Any]]:
    path = CONTENT_DIR / "{}.json".format(slug)
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def get_section_turns(slug: str, section: int) -> Optional[List[Dict[str, str]]]:
    test = _load(slug)
    if test is None:
        return None
    for entry in test.get("sections", []):
        if entry.get("number") == section:
            return entry.get("turns", [])
    return None


def known_slugs() -> List[str]:
    if not CONTENT_DIR.exists():
        return []
    return sorted(p.stem for p in CONTENT_DIR.glob("*.json"))
