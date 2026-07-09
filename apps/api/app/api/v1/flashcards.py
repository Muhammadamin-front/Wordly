import csv
import io
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.flashcards import Card, Deck, ReviewLog
from app.models.user import User
from app.models.vocabulary import Category, Word
from app.schemas.auth import MessageOut
from app.schemas.flashcards import (
    AddByLevelRequest,
    AddByLevelResult,
    CardCreate,
    CardOut,
    CardUpdate,
    DeckCreate,
    DeckImportReport,
    DeckOut,
    DeckUpdate,
    QueueOut,
    ReviewRequest,
    ReviewResult,
)
from app.services.srs import SrsState, get_scheduler
from app.core.security import utcnow

router = APIRouter(tags=["flashcards"], dependencies=[Depends(get_current_user)])


def card_state(card: Card) -> SrsState:
    return SrsState(
        state=card.srs_state,
        step=card.srs_step,
        ease_factor=card.ease_factor,
        interval_days=card.interval_days,
        repetitions=card.repetitions,
        lapses=card.lapses,
        due_at=card.due_at,
    )


def apply_state(card: Card, state: SrsState) -> None:
    card.srs_state = state.state
    card.srs_step = state.step
    card.ease_factor = state.ease_factor
    card.interval_days = state.interval_days
    card.repetitions = state.repetitions
    card.lapses = state.lapses
    card.due_at = state.due_at


async def get_own_deck(db: AsyncSession, user: User, deck_id: UUID) -> Deck:
    deck = await db.scalar(select(Deck).where(Deck.id == deck_id, Deck.user_id == user.id))
    if deck is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return deck


async def get_own_card(db: AsyncSession, user: User, card_id: UUID) -> Card:
    card = await db.scalar(select(Card).where(Card.id == card_id, Card.user_id == user.id))
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    return card


# --- Decks ------------------------------------------------------------------


@router.get("/decks", response_model=list[DeckOut])
async def list_decks(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    now = utcnow()
    rows = await db.execute(
        select(
            Deck,
            func.count(Card.id),
            func.count(Card.id).filter(Card.due_at <= now),
        )
        .outerjoin(Card, Card.deck_id == Deck.id)
        .where(Deck.user_id == user.id)
        .group_by(Deck.id)
        .order_by(Deck.created_at)
    )
    decks = []
    for deck, card_count, due_count in rows:
        out = DeckOut.model_validate(deck)
        out.card_count = int(card_count)
        out.due_count = int(due_count)
        decks.append(out)
    return decks


@router.post("/decks", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
async def create_deck(
    payload: DeckCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = Deck(user_id=user.id, name=payload.name.strip(), description=payload.description)
    db.add(deck)
    await db.commit()
    return DeckOut.model_validate(deck)


@router.patch("/decks/{deck_id}", response_model=DeckOut)
async def update_deck(
    deck_id: UUID,
    payload: DeckUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await get_own_deck(db, user, deck_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(deck, field, value)
    await db.commit()
    return DeckOut.model_validate(deck)


@router.delete("/decks/{deck_id}", response_model=MessageOut)
async def delete_deck(
    deck_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await get_own_deck(db, user, deck_id)
    await db.delete(deck)
    await db.commit()
    return MessageOut(message="Deck deleted")


@router.post("/decks/{deck_id}/import", response_model=DeckImportReport)
async def import_deck_csv(
    deck_id: UUID,
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Quizlet/Anki-style import: CSV or TSV, two columns (front, back).
    A header row of 'front,back' is optional."""
    await get_own_deck(db, user, deck_id)
    raw = await file.read()
    if len(raw) > 2 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE, detail="File too large")
    text = raw.decode("utf-8-sig", errors="replace")
    delimiter = "\t" if "\t" in text.splitlines()[0] else ","

    existing_fronts = set(
        (
            await db.scalars(
                select(func.lower(Card.front_text)).where(
                    Card.user_id == user.id, Card.deck_id == deck_id, Card.front_text.isnot(None)
                )
            )
        ).all()
    )

    created = 0
    skipped = 0
    errors = []
    for line_number, row in enumerate(csv.reader(io.StringIO(text), delimiter=delimiter), start=1):
        if not row or all(not cell.strip() for cell in row):
            continue
        if line_number == 1 and [c.strip().lower() for c in row[:2]] == ["front", "back"]:
            continue
        if len(row) < 2 or not row[0].strip() or not row[1].strip():
            errors.append("line {}: need two columns (front, back)".format(line_number))
            continue
        front, back = row[0].strip()[:2000], row[1].strip()[:2000]
        if front.lower() in existing_fronts:
            skipped += 1
            continue
        existing_fronts.add(front.lower())
        db.add(Card(user_id=user.id, deck_id=deck_id, front_text=front, back_text=back))
        created += 1

    await db.commit()
    return DeckImportReport(created=created, skipped=skipped, errors=errors[:20])


@router.get("/decks/{deck_id}/export")
async def export_deck_csv(
    deck_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Your data is yours: always exportable, importable back into Anki/Quizlet."""
    deck = await get_own_deck(db, user, deck_id)
    cards = await db.scalars(
        select(Card).where(Card.user_id == user.id, Card.deck_id == deck_id)
    )
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["front", "back"])
    for card in cards:
        if card.word is not None:
            front = card.word.headword
            back = card.word.senses[0].translation_uz if card.word.senses else ""
        else:
            front, back = card.front_text or "", card.back_text or ""
        writer.writerow([front, back])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="{}.csv"'.format(deck.name or "deck")
        },
    )


# --- Cards ------------------------------------------------------------------


@router.post("/cards", response_model=CardOut, status_code=status.HTTP_201_CREATED)
async def create_card(
    payload: CardCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.word_id is None and not (payload.front_text and payload.back_text):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Provide word_id or front_text + back_text",
        )
    if payload.deck_id is not None:
        await get_own_deck(db, user, payload.deck_id)

    if payload.word_id is not None:
        word = await db.scalar(
            select(Word).where(Word.id == payload.word_id, Word.status == "published")
        )
        if word is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found")
        duplicate = await db.scalar(
            select(Card.id).where(Card.user_id == user.id, Card.word_id == payload.word_id)
        )
        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Word already in your cards"
            )

    card = Card(
        user_id=user.id,
        deck_id=payload.deck_id,
        word_id=payload.word_id,
        front_text=payload.front_text,
        back_text=payload.back_text,
    )
    db.add(card)
    await db.commit()
    card = await get_own_card(db, user, card.id)  # reload with joined word
    return CardOut.model_validate(card)


@router.post("/cards/add-by-level", response_model=AddByLevelResult)
async def add_cards_by_level(
    payload: AddByLevelRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bulk-start learning: adds the next `limit` published words of a level
    (by frequency rank) that the user doesn't have yet."""
    already = select(Card.word_id).where(Card.user_id == user.id, Card.word_id.isnot(None))
    query = (
        select(Word.id)
        .where(
            Word.status == "published",
            Word.cefr_level == payload.cefr_level,
            Word.id.not_in(already),
        )
        .order_by(Word.frequency_rank.asc().nulls_last(), Word.headword)
        .limit(payload.limit)
    )
    if payload.category_slug:
        query = query.join(Category, Word.category_id == Category.id).where(
            Category.slug == payload.category_slug
        )
    word_ids = (await db.scalars(query)).all()
    for word_id in word_ids:
        db.add(Card(user_id=user.id, word_id=word_id))
    await db.commit()

    total_available = (
        await db.scalar(
            select(func.count(Word.id)).where(
                Word.status == "published", Word.cefr_level == payload.cefr_level
            )
        )
    ) or 0
    total_added_before = total_available - len(word_ids)
    return AddByLevelResult(added=len(word_ids), already_added=max(0, total_added_before))


@router.patch("/cards/{card_id}", response_model=CardOut)
async def update_card(
    card_id: UUID,
    payload: CardUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await get_own_card(db, user, card_id)
    data = payload.model_dump(exclude_unset=True)
    if "deck_id" in data and data["deck_id"] is not None:
        await get_own_deck(db, user, data["deck_id"])
    for field, value in data.items():
        setattr(card, field, value)
    await db.commit()
    return CardOut.model_validate(card)


@router.delete("/cards/{card_id}", response_model=MessageOut)
async def delete_card(
    card_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await get_own_card(db, user, card_id)
    await db.delete(card)
    await db.commit()
    return MessageOut(message="Card deleted")


# --- Review -----------------------------------------------------------------


@router.get("/review/queue", response_model=QueueOut)
async def review_queue(
    deck_id: Optional[UUID] = Query(None),
    limit: int = Query(30, ge=1, le=100),
    new_limit: int = Query(10, ge=0, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = utcnow()
    base = select(Card).where(Card.user_id == user.id)
    if deck_id is not None:
        base = base.where(Card.deck_id == deck_id)

    due_cards = (
        await db.scalars(
            base.where(Card.srs_state != "new", Card.due_at <= now)
            .order_by(Card.due_at)
            .limit(limit)
        )
    ).unique().all()
    remaining = max(0, limit - len(due_cards))
    new_cards = []
    if remaining and new_limit:
        new_cards = (
            await db.scalars(
                base.where(Card.srs_state == "new")
                .order_by(Card.created_at)
                .limit(min(remaining, new_limit))
            )
        ).unique().all()

    learning_count = (
        await db.scalar(
            select(func.count(Card.id)).where(
                Card.user_id == user.id, Card.srs_state.in_(("learning", "relearning"))
            )
        )
    ) or 0

    cards = list(due_cards) + list(new_cards)
    return QueueOut(
        cards=[CardOut.model_validate(c) for c in cards],
        due_count=len(due_cards),
        new_count=len(new_cards),
        learning_count=int(learning_count),
    )


@router.post("/review/{card_id}", response_model=ReviewResult)
async def review_card(
    card_id: UUID,
    payload: ReviewRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await get_own_card(db, user, card_id)
    before = card_state(card)
    after = get_scheduler().schedule(before, payload.rating, utcnow())
    apply_state(card, after)

    db.add(
        ReviewLog(
            user_id=user.id,
            card_id=card.id,
            rating=payload.rating,
            state_before=before.state,
            interval_before=before.interval_days,
            interval_after=after.interval_days,
            ease_before=before.ease_factor,
            ease_after=after.ease_factor,
            duration_ms=payload.duration_ms,
        )
    )
    await db.commit()
    return ReviewResult(card=CardOut.model_validate(card), next_due_at=after.due_at)
