"""Complete the 300/300 phrase corpus from reviewed local expressions.

The only remote operation is Uzbek-to-Russian translation through Google
Translate. No user data is read or transmitted.
"""
from __future__ import annotations

import csv
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request

DATA_DIR = pathlib.Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "phrasal_idioms_5.csv"
TRANSLATION_CACHE = DATA_DIR / "phrasal_idioms_ru_cache.json"

IDIOM_EXPRESSIONS = """
Get the ball rolling
Touch base
Stay in the loop
The bottom line
On the same page
A win-win situation
Think outside the box
at the end of the day
to move the goalposts
Bring to the table
to move the needle
Worth my while
A steep learning curve
down in the dumps
to be fuming
to be at one's wits' end
to be on edge
to be taken aback
to be at the end of one's tether
to take something to heart
to get a kick out of
to be sick and tired of
to have mixed feelings
hit it off
keep someone at arm's length
get on like a house on fire
to talk things through
to cut a long story short
as it turned out
at the crack of dawn
all of a sudden
the funny thing is
as fate would have it
as it happens
the icing on the cake
to make matters worse
I couldn't believe my eyes
as luck would have it
the final straw
It just so happens that
A turning point
the penny dropped
to my surprise
it goes without saying
all in all
to steer clear of
a stone's throw away
to soak up the atmosphere
to travel light
a tourist trap
to travel on a shoestring
to be a home away from home
on a shoestring budget
a pit stop
a flying visit
to be spoilt for choice
a hidden gem
it's a must-see
to broaden one's horizons
to see the sights
the hustle and bustle
to meet a deadline
to be snowed under
a nine-to-five job
to pull one's weight
to be tied up
to keep on top of things
get off the ground
to be under a lot of pressure
to be hooked on
the digital divide
digital footprint
glued to the screen
keep up with the latest trends
a game-changer
to keep up with the times
to be knackered
to be gutted
to wrap something up
to miss out on
my head is spinning
fed up with
to crack on
to pull my leg
to lose the plot
do a runner
to pop out
fair enough
to be chuffed
Buckets of rain
to be a bit of a nightmare
fancy doing something
my mind went blank
to run by (someone)
A bit of a long shot
out and about
to make up my mind
to make a point of doing something
to give someone a hand
to be up to
to slip one's mind
to be spot on
to give something a go
to be up for something
to do my head in
to make a go of it
I'm tied up at the moment
Catch you later
I'm not really into it
Make yourself at home
makes sense
a ballpark figure
take it easy
to make a move
to weigh up the options
to pull an all-nighter
to breeze through an exam
to scrape through
to sail through
to get to grips with
to pass with flying colours
foot the bill
take a toll on
be on the brink of
to be at a tipping point
a throwaway society
to be on the brink of disaster
take a heavy toll on
to be in jeopardy
to turn the tide
to put a strain on nature
foot the bill for environmental damage
to be at stake
to be at the mercy of nature
to wreak havoc on
to bear the brunt of
to do one's bit
to get back to nature
It’s a no-brainer
There's no harm in
Leaves a lot to be desired
There's a catch
It comes with its fair share of problems
One of the pitfalls is
A significant hurdle
It falls short
The flip side
A real turn-off
It's not without its problems
A real thorn in my side
A bit of a pain
It's a bit of a let-down
The only snag
There is a price to pay
Not without its faults
On the other hand
Having said that
Be that as it may
By the same token
For all that
On top of that
for the most part
A far cry from
On a par with
Nothing like
On the flip side
Much the same
nowhere near as... as
side by side
When it comes to
Work wonders
It really comes in handy
It has its perks
There's a lot to be said for
gives you the edge
brings a lot to the table
A clear-cut benefit
It gives you a head start
It works in one's favour
""".strip().splitlines()

PHRASAL_ROWS = [
    ("come down to", "bog'liq bo'lmoq", "to be mainly decided or explained by one thing",
     "Success often comes down to consistent practice.",
     "Muvaffaqiyat ko'pincha muntazam mashq qilishga bog'liq bo'ladi."),
    ("follow up on", "davomini tekshirmoq", "to take further action about something",
     "I will follow up on your application tomorrow.",
     "Ertaga arizangiz bo'yicha keyingi ishlarni tekshiraman."),
    ("go about", "kirishmoq", "to begin or deal with a task in a particular way",
     "She explained how to go about solving the problem.",
     "U muammoni yechishga qanday kirishishni tushuntirdi."),
    ("read up on", "batafsil o'rganib chiqmoq", "to study a subject by reading about it",
     "I read up on the company before my interview.",
     "Suhbatdan oldin kompaniya haqida batafsil o'rganib chiqdim."),
    ("knuckle down", "jiddiy kirishmoq", "to start working or studying hard",
     "We need to knuckle down before the final exam.",
     "Yakuniy imtihondan oldin o'qishga jiddiy kirishishimiz kerak."),
    ("look out for", "kuzatib turmoq", "to watch carefully for someone or something",
     "Look out for an email confirming your booking.",
     "Broningizni tasdiqlovchi xatni kuzatib turing."),
    ("put forward", "ilgari surmoq", "to suggest an idea or plan for consideration",
     "The committee put forward a practical solution.",
     "Qo'mita amaliy yechimni ilgari surdi."),
    ("set aside", "ajratib qo'ymoq", "to reserve time or money for a purpose",
     "Set aside an hour each day for vocabulary practice.",
     "Har kuni lug'at mashqi uchun bir soat ajratib qo'ying."),
    ("take apart", "qismlarga ajratmoq", "to separate something into its component parts",
     "The technician took the device apart to repair it.",
     "Texnik qurilmani ta'mirlash uchun qismlarga ajratdi."),
    ("set about", "ishga kirishmoq", "to start doing something with determination",
     "They set about improving the course immediately.",
     "Ular darhol kursni yaxshilashga kirishdilar."),
    ("work up", "asta-sekin rivojlantirmoq", "to gradually develop a feeling or ability",
     "He worked up the confidence to speak in public.",
     "U omma oldida gapirish uchun asta-sekin ishonch hosil qildi."),
    ("write up", "to'liq yozib chiqmoq", "to prepare a complete written version of notes or research",
     "Please write up the results in a formal report.",
     "Natijalarni rasmiy hisobot shaklida to'liq yozib chiqing."),
]

FIELDNAMES = [
    "headword", "pos", "cefr_level", "translation_uz", "translation_ru",
    "definition_en", "ipa", "frequency_rank", "category", "example_en",
    "example_uz", "example_ru", "synonyms", "antonyms", "word_family",
    "common_mistake",
]


def normalize(value: str) -> str:
    value = value.casefold().replace("’", "'").replace("…", "...")
    return re.sub(r"[^a-z0-9.']+", " ", value).strip()


def join_limited(values: list[str], limit: int = 80) -> str:
    selected: list[str] = []
    for value in values:
        candidate = " | ".join([*selected, value.strip()])
        if len(candidate) > limit:
            break
        selected.append(value.strip())
    return " | ".join(selected)


def load_expressions() -> dict[str, dict]:
    result = {}
    for path in sorted((DATA_DIR / "expressions").glob("*.jsonl")):
        for line in path.read_text(encoding="utf-8").splitlines():
            item = json.loads(line)
            result.setdefault(normalize(item["expression"]), item)
    return result


def translate_ru(text: str, cache: dict[str, str]) -> str:
    if text in cache:
        return cache[text]
    query = urllib.parse.urlencode({
        "client": "gtx", "sl": "uz", "tl": "ru", "dt": "t", "q": text,
    })
    url = "https://translate.googleapis.com/translate_a/single?" + query
    for attempt in range(4):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Wordly/1.0"})
            with urllib.request.urlopen(request, timeout=20) as response:
                payload = json.loads(response.read().decode("utf-8"))
            translated = "".join(part[0] for part in payload[0] if part[0]).strip()
            if translated:
                cache[text] = translated
                TRANSLATION_CACHE.write_text(
                    json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8"
                )
                time.sleep(0.12)
                return translated
        except Exception:
            time.sleep(1 + attempt * 2)
    raise RuntimeError(f"Google Translate failed for: {text}")


def main() -> None:
    rows = list(csv.DictReader(OUTPUT.open(encoding="utf-8")))
    rows = [row for row in rows if row.get("category") == "phrasal"]
    existing = {normalize(row["headword"]) for row in rows}
    cache = (
        json.loads(TRANSLATION_CACHE.read_text(encoding="utf-8"))
        if TRANSLATION_CACHE.exists() else {}
    )

    for headword, uzbek, definition, example_en, example_uz in PHRASAL_ROWS:
        if normalize(headword) in existing:
            continue
        rows.append({
            "headword": headword, "pos": "phrasal verb", "cefr_level": "B2",
            "translation_uz": uzbek, "translation_ru": translate_ru(uzbek, cache),
            "definition_en": definition, "ipa": "", "category": "phrasal",
            "example_en": example_en, "example_uz": example_uz, "example_ru": "",
            "synonyms": "", "antonyms": "", "word_family": "",
            "common_mistake": "",
        })
        existing.add(normalize(headword))

    expression_index = load_expressions()
    missing = [value for value in IDIOM_EXPRESSIONS if normalize(value) not in expression_index]
    if missing:
        raise RuntimeError(f"Missing local expressions: {missing}")
    if len(IDIOM_EXPRESSIONS) != 179:
        raise RuntimeError(f"Expected 179 idioms, found {len(IDIOM_EXPRESSIONS)}")

    idiom_seen: set[str] = set()
    for selected in IDIOM_EXPRESSIONS:
        item = expression_index[normalize(selected)]
        headword = item["expression"].strip().lower()
        key = normalize(headword)
        if key in idiom_seen:
            raise RuntimeError(f"Duplicate idiom selection: {headword}")
        idiom_seen.add(key)
        examples = item.get("example_sentences") or []
        rows.append({
            "headword": headword,
            "pos": "idiom",
            "cefr_level": item.get("cefr") if item.get("cefr") in {"A2", "B1", "B2", "C1"} else "B2",
            "translation_uz": item["uzbek"].strip(),
            "translation_ru": translate_ru(item["uzbek"].strip(), cache),
            "definition_en": item["usage"].strip(),
            "ipa": "",
            "category": "idioms",
            "example_en": examples[0].strip() if examples else "",
            "example_uz": "",
            "example_ru": "",
            "synonyms": " | ".join(item.get("synonyms") or item.get("alternatives") or []),
            "antonyms": " | ".join(item.get("opposites") or []),
            "word_family": join_limited(item.get("collocations") or []),
            "common_mistake": " ".join((item.get("common_mistakes") or [])[:1]),
        })

    counts = {
        category: sum(row.get("category") == category for row in rows)
        for category in ("phrasal", "idioms")
    }
    if counts != {"phrasal": 180, "idioms": 179}:
        raise RuntimeError(f"Unexpected generated counts: {counts}")

    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES)
        writer.writeheader()
        for index, row in enumerate(rows):
            row["frequency_rank"] = str(20001 + index * 2)
            writer.writerow({field: row.get(field, "") for field in FIELDNAMES})
    print(f"completed output: {counts}")


if __name__ == "__main__":
    main()
