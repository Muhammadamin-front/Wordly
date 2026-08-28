from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.core.security import utcnow
from app.db.session import get_db
from app.models.flashcards import Card
from app.models.gamification import GameRun
from app.models.user import User
from app.schemas.gamification import RewardOut
from app.schemas.games import (
    GameAnswerRequest,
    GameAnswerResult,
    GameQuestionOut,
    GameRunProgressOut,
    GameSessionOut,
)
from app.services import games as games_service
from app.services import statistics as stats_service
from app.services import subscriptions
from app.services.gamification import RewardSummary, apply_skill_xp
from app.services.leveling import local_today
from app.services.plans import FREE_GAME_TYPES
from app.services.quests import award_completed_quests
from app.services.review import record_review

router = APIRouter(
    prefix="/games",
    tags=["games"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("games"))],
)

# Fast correct answers earn "good"; slow-but-correct earn "hard"; wrong earns "again".
FAST_ANSWER_MS = 6000
GAME_COMPLETION_XP = 10
PERFECT_GAME_XP = 10


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
    if game_type not in FREE_GAME_TYPES and not await subscriptions.is_premium(db, user):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="This game requires Premium",
        )
    profile = await stats_service.recent_learning_profile(db, user)
    questions, usable = await games_service.build_session(
        db,
        user,
        game_type,
        count,
        level=level,
        category=category,
        difficulty=str(profile["difficulty"]),
    )
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Add at least {} words to play (you have {})".format(
                games_service.MIN_CARDS, usable
            ),
        )
    run = GameRun(
        user_id=user.id,
        game_type=game_type,
        source_category=category,
        day=local_today(user.profile.timezone or "UTC"),
        total_questions=len(questions),
        card_ids=[str(question.card_id) for question in questions],
    )
    db.add(run)
    # A level/category session may also have created cards for new words.
    await db.commit()
    return GameSessionOut(
        session_id=run.id,
        game_type=game_type,
        difficulty=str(profile["difficulty"]),
        recent_accuracy=float(profile["recent_accuracy"]),
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
    if payload.game_type not in games_service.GAME_TYPES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown game")

    run = None
    if payload.session_id is not None:
        run = await db.scalar(
            select(GameRun)
            .where(GameRun.id == payload.session_id, GameRun.user_id == user.id)
            .with_for_update()
        )
        if run is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game session not found")
        if run.game_type != payload.game_type or str(payload.card_id) not in run.card_ids:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question is not in this game")
        if str(payload.card_id) in run.answered_card_ids:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question already answered")

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
    quest_completions: list[str] = []
    run_progress = None

    if run is not None:
        run.answered_card_ids = [*run.answered_card_ids, str(payload.card_id)]
        run.answered_count += 1
        if correct:
            run.correct_count += 1
            run.current_combo += 1
            run.best_combo = max(run.best_combo, run.current_combo)
        else:
            run.current_combo = 0
        run.review_xp += reward.xp_gained

        completion_reward = RewardSummary()
        if run.answered_count >= run.total_questions and run.completed_at is None:
            run.completed_at = utcnow()
            completion_bonus = GAME_COMPLETION_XP
            if run.correct_count == run.total_questions:
                completion_bonus += PERFECT_GAME_XP
            run.completion_xp = completion_bonus
            completion_reward = await apply_skill_xp(db, user, completion_bonus)

        await db.flush()
        quest_completions, quest_reward = await award_completed_quests(db, user)
        for extra in (completion_reward, quest_reward):
            if extra.xp_gained <= 0:
                continue
            reward.xp_gained += extra.xp_gained
            reward.total_xp = extra.total_xp
            reward.level = extra.level
            reward.leveled_up = reward.leveled_up or extra.leveled_up

        run_progress = GameRunProgressOut(
            answered_count=run.answered_count,
            correct_count=run.correct_count,
            total_questions=run.total_questions,
            best_combo=run.best_combo,
            completed=run.completed_at is not None,
            xp_earned=run.review_xp + run.completion_xp,
            completion_bonus=run.completion_xp,
        )

    await db.commit()
    return GameAnswerResult(
        rating=rating,
        reward=RewardOut(**reward.__dict__),
        run=run_progress,
        quest_completions=quest_completions,
    )
