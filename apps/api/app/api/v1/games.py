from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.flashcards import Card
from app.models.user import User
from app.schemas.gamification import RewardOut
from app.schemas.games import (
    GameAnswerRequest,
    GameAnswerResult,
    GameQuestionOut,
    GameSessionOut,
)
from app.services import games as games_service
from app.services.review import record_review

router = APIRouter(
    prefix="/games",
    tags=["games"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("games"))],
)

# Fast correct answers earn "good"; slow-but-correct earn "hard"; wrong earns "again".
FAST_ANSWER_MS = 6000


CEFR_PATTERN = "^(A1|A2|B1|B2|C1|C2)$"
CATEGORY_PATTERN = "^[a-z-]{2,30}$"


@router.get("/{game_type}", response_model=GameSessionOut)
async def game_session(
    game_type: str,
    count: int = Query(games_service.DEFAULT_COUNT, ge=4, le=20),
    level: Optional[str] = Query(None, pattern=CEFR_PATTERN),
    category: Optional[str] = Query(None, pattern=CATEGORY_PATTERN),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if game_type not in games_service.GAME_TYPES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown game")
    questions, usable = await games_service.build_session(
        db, user, game_type, count, level=level, category=category
    )
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Add at least {} words to play (you have {})".format(
                games_service.MIN_CARDS, usable
            ),
        )
    # A level/category session may have created cards for new words.
    if level or category:
        await db.commit()
    return GameSessionOut(
        game_type=game_type,
        questions=[
            GameQuestionOut(
                card_id=q.card_id,
                prompt=q.prompt,
                answer=q.answer,
                distractors=q.distractors,
                audio_text=q.audio_text,
            )
            for q in questions
        ],
    )


@router.post("/answer", response_model=GameAnswerResult)
async def game_answer(
    payload: GameAnswerRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    card = await db.scalar(
        select(Card).where(Card.id == payload.card_id, Card.user_id == user.id)
    )
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")

    # Grade server-side from the submitted answer — never from a client flag.
    correct = games_service.grade_answer(card, payload.game_type, payload.answer)
    if not correct:
        rating = "again"
    elif payload.duration_ms is not None and payload.duration_ms <= FAST_ANSWER_MS:
        rating = "good"
    else:
        rating = "hard"

    _, reward = await record_review(db, user, card, rating, payload.duration_ms)
    await db.commit()
    return GameAnswerResult(rating=rating, reward=RewardOut(**reward.__dict__))
