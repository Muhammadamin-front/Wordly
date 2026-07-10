from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.user import User
from app.schemas.skills import (
    PassageListItem,
    PassageOut,
    QuestionOut,
    ReadingResult,
    ReadingSubmit,
    WritingPromptsOut,
)
from app.services import skills

router = APIRouter(
    prefix="/skills",
    tags=["skills"],
    dependencies=[Depends(get_current_user), Depends(rate_limit("default"))],
)

CEFR_PATTERN = "^(A1|A2|B1|B2|C1|C2)$"


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
    prompts = skills.WRITING_PROMPTS.get(level) or skills.WRITING_PROMPTS["A1"]
    return WritingPromptsOut(level=level, prompts=prompts)
