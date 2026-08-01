"""Add reviewed-source Russian translations to the expression corpus.

Only Uzbek teaching translations from bundled JSONL files are sent to Google
Translate. No account or user data is read by this script.
"""
from __future__ import annotations

import json
import pathlib
from concurrent.futures import ThreadPoolExecutor
import time
import urllib.parse
import urllib.request


DATA_DIR = pathlib.Path(__file__).parent / "data" / "expressions"
CACHE_PATH = pathlib.Path(__file__).parent / "data" / "expressions_ru_cache.json"


def translate(text: str) -> str:
    query = urllib.parse.urlencode(
        {"client": "gtx", "sl": "uz", "tl": "ru", "dt": "t", "q": text}
    )
    url = "https://translate.googleapis.com/translate_a/single?" + query
    for attempt in range(5):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Wordly/1.0"})
            with urllib.request.urlopen(request, timeout=25) as response:
                payload = json.loads(response.read().decode("utf-8"))
            result = "".join(part[0] for part in payload[0] if part[0]).strip()
            if result:
                time.sleep(0.1)
                return result
        except Exception:
            time.sleep(1 + attempt * 2)
    raise RuntimeError(f"Translation failed: {text}")


def main() -> None:
    cache = (
        json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        if CACHE_PATH.exists()
        else {}
    )
    files: list[tuple[pathlib.Path, list[dict]]] = []
    missing: list[str] = []
    for path in sorted(DATA_DIR.glob("*.jsonl")):
        rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]
        files.append((path, rows))
        for row in rows:
            text = str(row["uzbek"]).strip()
            if not str(row.get("russian", "")).strip() and text not in cache:
                missing.append(text)

    unique_missing = list(dict.fromkeys(missing))
    with ThreadPoolExecutor(max_workers=8) as executor:
        for index, (text, result) in enumerate(
            zip(unique_missing, executor.map(translate, unique_missing)), start=1
        ):
            cache[text] = result
            if index % 10 == 0 or index == len(unique_missing):
                CACHE_PATH.write_text(
                    json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8"
                )

    translated = 0
    for path, rows in files:
        changed = False
        for row in rows:
            if str(row.get("russian", "")).strip():
                continue
            row["russian"] = cache[str(row["uzbek"]).strip()]
            translated += 1
            changed = True
        if changed:
            temporary = path.with_suffix(".jsonl.tmp")
            temporary.write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n",
                encoding="utf-8",
            )
            temporary.replace(path)
    print(
        f"Russian expression translations added: {translated}; "
        f"remote: {len(unique_missing)}; cache: {len(cache)}"
    )


if __name__ == "__main__":
    main()
