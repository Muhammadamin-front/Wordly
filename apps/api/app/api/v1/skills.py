from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.skills import (
    GrammarQuestionOut,
    GrammarSubmit,
    PassageListItem,
    PassageOut,
    QuestionOut,
    ReadingResult,
    ReadingSubmit,
    WritingPromptsOut,
)
from app.services import skills, subscriptions
from app.services.grammar import nearest_available_level
from app.services.plans import FREE_GRAMMAR_LEVELS

router = APIRouter(
    prefix="/skills",
    tags=["skills"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("default"))],
)

CEFR_PATTERN = "^(A1|A2|B1|B2|C1|C2)$"


async def _require_grammar_level(db: AsyncSession, user: User, level: str) -> None:
    """Free study stops after A1. The curriculum only runs A1-B2, so this
    is one level of four, not a token sample."""
    if level in FREE_GRAMMAR_LEVELS:
        return
    if await subscriptions.is_premium(db, user):
        return
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail="This grammar level requires Premium",
    )


@router.get("/reading", response_model=List[PassageListItem])
async def reading_list(
    level: Optional[str] = Query(None, pattern=CEFR_PATTERN),
    db: AsyncSession = Depends(get_db),
):
    passages = await skills.list_passages(db, level)
    return [
        PassageListItem(
            id=p.id, slug=p.slug, cefr_level=p.cefr_level,
            title_en=p.title_en, question_count=len(p.questions),
        )
        for p in passages
    ]


@router.get("/reading/{slug}", response_model=PassageOut)
async def reading_detail(slug: str, db: AsyncSession = Depends(get_db)):
    passage = await skills.get_passage(db, slug)
    if passage is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Passage not found")
    return PassageOut(
        id=passage.id, slug=passage.slug, cefr_level=passage.cefr_level,
        title_en=passage.title_en, body_en=passage.body_en, summary_uz=passage.summary_uz,
        questions=[
            QuestionOut(prompt_en=q.prompt_en, options=skills.question_options(q))
            for q in passage.questions
        ],
    )


@router.post("/reading/{slug}/submit", response_model=ReadingResult)
async def reading_submit(
    slug: str,
    payload: ReadingSubmit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    passage = await skills.get_passage(db, slug)
    if passage is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Passage not found")
    results, reward = await skills.score_submission(db, user, passage, payload.answers)
    await db.commit()
    return ReadingResult(
        correct=sum(results), total=len(results), results=results,
        xp_gained=reward.xp_gained, total_xp=reward.total_xp,
        level=reward.level, leveled_up=reward.leveled_up,
    )


@router.get("/writing/prompts", response_model=WritingPromptsOut)
async def writing_prompts(level: str = Query("A1", pattern=CEFR_PATTERN)):
    # Prompts stop at B2; a C1 request gets B2 rather than A1, and the response
    # reports the level actually served so the UI can say so.
    served = nearest_available_level(level, skills.WRITING_PROMPTS)
    return WritingPromptsOut(level=served, prompts=skills.WRITING_PROMPTS[served])


@router.get("/grammar", response_model=List[GrammarQuestionOut])
async def grammar_round(
    level: str = Query("A1", pattern=CEFR_PATTERN),
    count: int = Query(10, ge=1, le=20),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _require_grammar_level(db, user, level)
    return [GrammarQuestionOut(**q) for q in skills.grammar_round(level, count)]


@router.post("/grammar/submit", response_model=ReadingResult)
async def grammar_submit(
    payload: GrammarSubmit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Gated as well as the question route: grading awards XP, so leaving it
    # open would let a free learner bank progress on a level they cannot study.
    await _require_grammar_level(db, user, payload.level)
    results, reward = await skills.score_grammar(
        db, user, payload.level, [a.model_dump() for a in payload.answers]
    )
    await db.commit()
    return ReadingResult(
        correct=sum(results), total=len(results), results=results,
        xp_gained=reward.xp_gained, total_xp=reward.total_xp,
        level=reward.level, leveled_up=reward.leveled_up,
    )
