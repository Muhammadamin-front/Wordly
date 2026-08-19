from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_content_manager
from app.core.cache import cached_response
from app.core.config import get_settings
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.vocabulary import Category, Word
from app.models.expression import Expression
from app.models.user import User
from app.schemas.auth import MessageOut
from app.schemas.vocabulary import (
    CategoryOut,
    CatalogMeta,
    ImportReport,
    WordCreate,
    WordListItem,
    WordLookupEntry,
    WordLookupRequest,
    WordLookupResponse,
    WordOut,
    WordPage,
    WordUpdate,
)
from app.services import vocabulary as vocab_service
from app.services.admin_audit import record_admin_action

router = APIRouter(tags=["vocabulary"])
admin_router = APIRouter(
    prefix="/admin/words", tags=["admin"], dependencies=[Depends(require_content_manager)]
)

CEFR_QUERY_PATTERN = "^(A1|A2|B1|B2|C1|C2)$"
STATUS_QUERY_PATTERN = "^(draft|review|published)$"


def to_list_item(word: Word) -> WordListItem:
    item = WordListItem.model_validate(word)
    if word.senses:
        item.primary_translation_uz = word.senses[0].translation_uz
        item.primary_translation_ru = word.senses[0].translation_ru
        if word.senses[0].examples:
            item.primary_example_en = word.senses[0].examples[0].text_en
    return item


# Public corpus reads are cached (published data only, no per-user content) with
# Cache-Control + ETag/304; staleness after an admin edit is bounded by the TTL.


@router.get("/categories", response_model=List[CategoryOut])
async def list_categories(request: Request, db: AsyncSession = Depends(get_db)):
    async def produce():
        rows = await db.scalars(select(Category).order_by(Category.sort_order, Category.slug))
        return [CategoryOut.model_validate(c) for c in rows]

    return await cached_response(
        request, "categories", get_settings().CACHE_TTL_CATEGORIES, produce
    )


@router.get("/catalog/meta", response_model=CatalogMeta)
async def catalog_meta(request: Request, db: AsyncSession = Depends(get_db)):
    async def produce():
        rows = await db.execute(
            select(Word.cefr_level, func.count(Word.id))
            .where(Word.status == "published")
            .group_by(Word.cefr_level)
        )
        levels = {level: int(count) for level, count in rows.all()}
        word_total = sum(levels.values())
        expression_total = int(await db.scalar(select(func.count(Expression.id))) or 0)
        return CatalogMeta(
            word_total=word_total,
            expression_total=expression_total,
            learning_item_total=word_total + expression_total,
            levels=levels,
        )

    return await cached_response(
        request, "catalog-meta", get_settings().CACHE_TTL_CATEGORIES, produce
    )


@router.get("/words", response_model=WordPage)
async def browse_words(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    level: Optional[str] = Query(None, pattern=CEFR_QUERY_PATTERN),
    category: Optional[str] = Query(None, max_length=50),
    q: Optional[str] = Query(None, max_length=80),
    db: AsyncSession = Depends(get_db),
):
    async def produce():
        words, total = await vocab_service.list_words(
            db, page=page, page_size=page_size, level=level, category_slug=category, q=q,
            status="published",
        )
        return WordPage(
            items=[to_list_item(w) for w in words], total=total, page=page, page_size=page_size
        )

    key = "words:{}:{}:{}:{}:{}".format(page, page_size, level or "", category or "", q or "")
    return await cached_response(request, key, get_settings().CACHE_TTL_WORDS, produce)


@router.post(
    "/words/lookup",
    response_model=WordLookupResponse,
    dependencies=[Depends(rate_limit("default"))],
)
async def lookup_words(payload: WordLookupRequest, db: AsyncSession = Depends(get_db)):
    """Tap-to-translate while reading: one request per passage, not per tap."""
    normalized = sorted({w.strip().lower() for w in payload.headwords if w.strip()})
    if not normalized:
        return WordLookupResponse(entries={})

    rows = await db.scalars(
        select(Word)
        .where(Word.status == "published", func.lower(Word.headword).in_(normalized))
        .order_by(Word.frequency_rank.asc().nulls_last())
    )
    entries: dict[str, WordLookupEntry] = {}
    for word in rows.unique():
        key = word.headword.lower()
        if key in entries:
            continue  # a headword can have several pos entries; keep the most frequent
        sense = word.senses[0] if word.senses else None
        entries[key] = WordLookupEntry(
            headword=word.headword,
            pos=word.pos,
            slug=word.slug,
            translation_uz=sense.translation_uz if sense else None,
            translation_ru=sense.translation_ru if sense else None,
            definition_en=sense.definition_en if sense else None,
        )
    return WordLookupResponse(entries=entries)


@router.get("/words/{slug}", response_model=WordOut)
async def word_detail(slug: str, request: Request, db: AsyncSession = Depends(get_db)):
    async def produce():
        word = await db.scalar(
            select(Word).where(Word.slug == slug, Word.status == "published")
        )
        if word is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
        return WordOut.model_validate(word)

    return await cached_response(
        request, "word:{}".format(slug), get_settings().CACHE_TTL_WORD_DETAIL, produce
    )


# --- Admin CMS -------------------------------------------------------------


@admin_router.get("", response_model=WordPage)
async def admin_list_words(
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    level: Optional[str] = Query(None, pattern=CEFR_QUERY_PATTERN),
    word_status: Optional[str] = Query(None, alias="status", pattern=STATUS_QUERY_PATTERN),
    q: Optional[str] = Query(None, max_length=80),
    db: AsyncSession = Depends(get_db),
):
    words, total = await vocab_service.list_words(
        db, page=page, page_size=page_size, level=level, q=q, status=word_status
    )
    return WordPage(
        items=[to_list_item(w) for w in words], total=total, page=page, page_size=page_size
    )


@admin_router.get("/{word_id}", response_model=WordOut)
async def admin_get_word(word_id: UUID, db: AsyncSession = Depends(get_db)):
    word = await db.get(Word, word_id)
    if word is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    return WordOut.model_validate(word)


@admin_router.post("", response_model=WordOut, status_code=status.HTTP_201_CREATED)
async def admin_create_word(
    payload: WordCreate,
    request: Request,
    actor: User = Depends(require_content_manager),
    db: AsyncSession = Depends(get_db),
):
    word = await vocab_service.create_word(db, payload)
    await record_admin_action(
        db,
        actor=actor,
        request=request,
        action="word.create",
        target_type="word",
        target_id=str(word.id),
        new_value={"headword": word.headword, "status": word.status, "cefr_level": word.cefr_level},
    )
    await db.commit()
    return WordOut.model_validate(word)


@admin_router.patch("/{word_id}", response_model=WordOut)
async def admin_update_word(
    word_id: UUID,
    payload: WordUpdate,
    request: Request,
    actor: User = Depends(require_content_manager),
    db: AsyncSession = Depends(get_db),
):
    word = await db.get(Word, word_id)
    if word is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    previous_value = {
        "headword": word.headword,
        "status": word.status,
        "cefr_level": word.cefr_level,
    }
    word = await vocab_service.update_word(db, word, payload)
    await record_admin_action(
        db,
        actor=actor,
        request=request,
        action="word.update",
        target_type="word",
        target_id=str(word.id),
        previous_value=previous_value,
        new_value={
            "headword": word.headword,
            "status": word.status,
            "cefr_level": word.cefr_level,
            "changed_fields": sorted(payload.model_fields_set),
        },
    )
    await db.commit()
    return WordOut.model_validate(word)


@admin_router.delete("/{word_id}", response_model=MessageOut)
async def admin_delete_word(
    word_id: UUID,
    request: Request,
    actor: User = Depends(require_content_manager),
    db: AsyncSession = Depends(get_db),
):
    word = await db.get(Word, word_id)
    if word is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
    previous_value = {"headword": word.headword, "status": word.status, "cefr_level": word.cefr_level}
    await db.delete(word)
    await record_admin_action(
        db,
        actor=actor,
        request=request,
        action="word.delete",
        target_type="word",
        target_id=str(word_id),
        previous_value=previous_value,
    )
    await db.commit()
    return MessageOut(message="Word deleted")


@admin_router.post("/import", response_model=ImportReport)
async def admin_import_csv(
    file: UploadFile,
    request: Request,
    actor: User = Depends(require_content_manager),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ("text/csv", "application/vnd.ms-excel", "application/octet-stream"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Upload a CSV file"
        )
    raw = await file.read()
    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="CSV too large")
    report = await vocab_service.import_csv(db, raw.decode("utf-8-sig"))
    await record_admin_action(
        db,
        actor=actor,
        request=request,
        action="word.import_csv",
        target_type="word_catalog",
        target_id="csv_import",
        new_value={"created": report.created, "updated": report.updated, "errors": len(report.errors)},
    )
    await db.commit()
    return report
