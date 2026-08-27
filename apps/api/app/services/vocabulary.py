import csv
import io
import re
import unicodedata
from typing import List, Optional, Tuple
from uuid import UUID, uuid4

from sqlalchemy import func, select, union
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vocabulary import (
    CEFR_LEVELS,
    Category,
    Word,
    WordExample,
    WordRelation,
    WordSense,
)
from app.services.inflection import inflection_candidates
from app.schemas.vocabulary import (
    ExampleIn,
    ImportReport,
    RelationIn,
    SenseIn,
    WordCreate,
    WordUpdate,
)


def slugify(headword: str, pos: str) -> str:
    base = unicodedata.normalize("NFKD", headword).encode("ascii", "ignore").decode()
    base = re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-") or "word"
    return "{}-{}".format(base, pos.lower())


async def get_category_by_slug(db: AsyncSession, slug: Optional[str]) -> Optional[Category]:
    if not slug:
        return None
    return await db.scalar(select(Category).where(Category.slug == slug))


def _build_senses(payload: List[SenseIn]) -> List[WordSense]:
    senses = []
    for order, sense_in in enumerate(payload, start=1):
        sense = WordSense(
            sense_order=order,
            definition_en=sense_in.definition_en,
            translation_uz=sense_in.translation_uz,
            translation_ru=sense_in.translation_ru,
            definition_uz=sense_in.definition_uz,
            definition_ru=sense_in.definition_ru,
            usage_note=sense_in.usage_note,
        )
        sense.examples = [
            WordExample(
                example_order=i,
                text_en=example.text_en,
                text_uz=example.text_uz,
                text_ru=example.text_ru,
            )
            for i, example in enumerate(sense_in.examples, start=1)
        ]
        senses.append(sense)
    return senses


async def _build_relations(db: AsyncSession, payload: List[RelationIn]) -> List[WordRelation]:
    relations = []
    seen = set()
    for relation_in in payload:
        key = (relation_in.relation_type, relation_in.related_text.lower())
        if key in seen:
            continue
        seen.add(key)
        # Link to a corpus word when one exists with this headword.
        linked_id = await db.scalar(
            select(Word.id).where(func.lower(Word.headword) == relation_in.related_text.lower())
        )
        relations.append(
            WordRelation(
                relation_type=relation_in.relation_type,
                related_text=relation_in.related_text,
                related_word_id=linked_id,
            )
        )
    return relations


async def create_word(db: AsyncSession, payload: WordCreate) -> Word:
    category = await get_category_by_slug(db, payload.category_slug)
    slug = slugify(payload.headword, payload.pos)
    if await db.scalar(select(Word.id).where(Word.slug == slug)):
        slug = "{}-{}".format(slug, uuid4().hex[:6])

    # All awaited lookups happen before the Word is built: once the object is
    # in the session, further awaits could autoflush it and turn collection
    # assignments into sync lazy-loads (greenlet errors under asyncio).
    senses = _build_senses(payload.senses)
    relations = await _build_relations(db, payload.relations)

    word = Word(
        headword=payload.headword.strip(),
        slug=slug,
        pos=payload.pos.lower().strip(),
        ipa=payload.ipa,
        audio_url=payload.audio_url,
        image_url=payload.image_url,
        cefr_level=payload.cefr_level,
        frequency_rank=payload.frequency_rank,
        word_family=payload.word_family,
        common_mistake=payload.common_mistake,
        status=payload.status,
        category=category,
    )
    word.senses = senses
    word.relations = relations
    db.add(word)
    await db.flush()
    return word


async def update_word(db: AsyncSession, word: Word, payload: WordUpdate) -> Word:
    data = payload.model_dump(exclude_unset=True)
    if "category_slug" in data:
        word.category = await get_category_by_slug(db, data.pop("category_slug"))
    senses = data.pop("senses", None)
    relations = data.pop("relations", None)
    for field, value in data.items():
        setattr(word, field, value)
    if senses is not None:
        word.senses = _build_senses([SenseIn(**s) for s in senses])
    if relations is not None:
        # Flush the removal first: replacements may reuse the same unique key
        # (word_id, type, text) and inserts are flushed before deletes.
        word.relations.clear()
        await db.flush()
        word.relations = await _build_relations(db, [RelationIn(**r) for r in relations])
    await db.flush()
    return word


async def list_words(
    db: AsyncSession,
    page: int,
    page_size: int,
    level: Optional[str] = None,
    category_slug: Optional[str] = None,
    q: Optional[str] = None,
    status: Optional[str] = None,
) -> Tuple[List[Word], int]:
    query = select(Word)
    if status:
        query = query.where(Word.status == status)
    if level:
        query = query.where(Word.cefr_level == level)
    if category_slug:
        query = query.join(Category, Word.category_id == Category.id).where(
            Category.slug == category_slug
        )
    if q:
        term = q.lower()
        needle = "%{}%".format(term)
        # A join + OR across both tables can't use either trigram index — the
        # planner has to hash-join everything first, then filter. Three
        # separately indexed id lookups, combined with UNION, let each branch
        # hit its own GIN index and only join the (small) matching id set
        # back to words.
        branches = [
            select(Word.id).where(func.lower(Word.headword).like(needle)),
            select(WordSense.word_id).where(func.lower(WordSense.translation_uz).like(needle)),
            select(WordSense.word_id).where(func.lower(WordSense.translation_ru).like(needle)),
        ]
        # The corpus indexes base lemmas ("slight"), but a searched term may be
        # an inflected form ("slightly") that isn't a substring of its lemma —
        # match those against the guessed base form too.
        candidates = inflection_candidates(term)
        if candidates:
            branches.append(select(Word.id).where(func.lower(Word.headword).in_(candidates)))
        matching_ids = union(*branches).subquery()
        query = query.where(Word.id.in_(select(matching_ids.c.id)))

    total = (
        await db.scalar(select(func.count()).select_from(query.subquery()))
    ) or 0
    rows = await db.scalars(
        query.order_by(Word.frequency_rank.asc().nulls_last(), Word.headword.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(rows.unique()), int(total)


# --- CSV import -----------------------------------------------------------
# Column reference (header row required). Required: headword, pos, cefr_level,
# translation_uz, translation_ru, definition_en. Optional: ipa, frequency_rank,
# category (slug), word_family, common_mistake, example_en, example_uz, example_ru,
# synonyms (pipe-separated), antonyms (pipe-separated), status.

REQUIRED_COLUMNS = {
    "headword",
    "pos",
    "cefr_level",
    "translation_uz",
    "translation_ru",
    "definition_en",
}


async def import_csv(db: AsyncSession, content: str, default_status: str = "review") -> ImportReport:
    reader = csv.DictReader(io.StringIO(content))
    columns = set(reader.fieldnames or [])
    missing = REQUIRED_COLUMNS - columns
    if missing:
        return ImportReport(
            created=0, updated=0, errors=["Missing columns: {}".format(", ".join(sorted(missing)))]
        )

    created = 0
    updated = 0
    errors: List[str] = []

    for line_number, row in enumerate(reader, start=2):
        savepoint = None
        try:
            # SAVEPOINT per row: a failed row rolls back alone, the import continues.
            savepoint = await db.begin_nested()
            headword = (row.get("headword") or "").strip()
            pos = (row.get("pos") or "").strip().lower()
            level = (row.get("cefr_level") or "").strip().upper()
            if not headword or not pos:
                raise ValueError("headword/pos required")
            if level not in CEFR_LEVELS:
                raise ValueError("bad cefr_level {!r}".format(level))

            examples = []
            if (row.get("example_en") or "").strip():
                examples.append(
                    ExampleIn(
                        text_en=row["example_en"].strip(),
                        text_uz=(row.get("example_uz") or "").strip() or None,
                        text_ru=(row.get("example_ru") or "").strip() or None,
                    )
                )
            relations = [
                RelationIn(relation_type=rel_type, related_text=item.strip())
                for column, rel_type in (("synonyms", "synonym"), ("antonyms", "antonym"))
                for item in (row.get(column) or "").split("|")
                if item.strip()
            ]
            rank_raw = (row.get("frequency_rank") or "").strip()
            payload = WordCreate(
                headword=headword,
                pos=pos,
                cefr_level=level,
                ipa=(row.get("ipa") or "").strip() or None,
                frequency_rank=int(rank_raw) if rank_raw else None,
                word_family=(row.get("word_family") or "").strip() or None,
                common_mistake=(row.get("common_mistake") or "").strip() or None,
                category_slug=(row.get("category") or "").strip() or None,
                status=(row.get("status") or "").strip() or default_status,
                senses=[
                    SenseIn(
                        definition_en=row["definition_en"].strip(),
                        translation_uz=row["translation_uz"].strip(),
                        translation_ru=row["translation_ru"].strip(),
                        examples=examples,
                    )
                ],
                relations=relations,
            )

            existing = await db.scalar(select(Word).where(Word.slug == slugify(headword, pos)))
            if existing is not None:
                await update_word(
                    db,
                    existing,
                    # Never reset enrichment fields (image_url/audio_url) that
                    # corpus CSVs don't carry — a re-import must preserve them.
                    WordUpdate(**payload.model_dump(
                        exclude={"status", "image_url", "audio_url"}
                    )),
                )
                updated += 1
            else:
                await create_word(db, payload)
                created += 1
            await savepoint.commit()
        except Exception as exc:  # keep importing; report the bad row
            if savepoint is not None and savepoint.is_active:
                await savepoint.rollback()
            errors.append("line {}: {}".format(line_number, exc))

    return ImportReport(created=created, updated=updated, errors=errors)
