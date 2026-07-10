"""Skills section (M11): reading passages + writing prompts.

Listening and speaking are game types (services/games.py) — they draw from the
user's own cards and feed SRS through /games/answer like every other game.
Reading is corpus-shared content with its own tables; writing pairs a prompt
bank with the M6 AI writing-check.
"""
import json
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reading import ReadingPassage
from app.models.user import User
from app.services.gamification import RewardSummary, apply_skill_xp

XP_PER_CORRECT_ANSWER = 5

# Writing prompt bank. Static on purpose: prompts are cheap, editorial, and
# versioned with the code; the graded feedback comes from /ai/writing-check.
WRITING_PROMPTS = {
    "A1": [
        "Introduce yourself. Write 3–4 sentences about your name, age, and family.",
        "Describe your house or apartment in 4 sentences.",
        "What do you eat for breakfast? Write 3 sentences.",
        "Describe your best friend in 4 sentences.",
    ],
    "A2": [
        "Describe your last holiday. Where did you go and what did you do? (5–6 sentences)",
        "Write about your daily routine on a school or work day. (5–6 sentences)",
        "What is your favourite season? Explain why in 5 sentences.",
        "Write a short message inviting a friend to your birthday party.",
    ],
    "B1": [
        "Do you think students should wear uniforms? Give your opinion with two reasons. (~80 words)",
        "Describe a person who has influenced your life and explain how. (~80 words)",
        "What are the advantages and disadvantages of living in a big city? (~100 words)",
        "Write about a skill you want to learn and how you plan to learn it. (~80 words)",
    ],
    "B2": [
        "Some people believe technology makes us less social. To what extent do you agree? (~150 words)",
        "Describe a challenge you overcame and what it taught you. (~150 words)",
        "Should education be free for everyone? Discuss both sides and give your view. (~150 words)",
    ],
}


def question_options(question) -> List[str]:
    return json.loads(question.options_json)


async def list_passages(
    db: AsyncSession, level: Optional[str] = None
) -> List[ReadingPassage]:
    query = select(ReadingPassage).where(ReadingPassage.status == "published")
    if level:
        query = query.where(ReadingPassage.cefr_level == level)
    query = query.order_by(ReadingPassage.cefr_level, ReadingPassage.title_en)
    return list((await db.scalars(query)).unique())


async def get_passage(db: AsyncSession, slug: str) -> Optional[ReadingPassage]:
    return await db.scalar(
        select(ReadingPassage).where(
            ReadingPassage.slug == slug, ReadingPassage.status == "published"
        )
    )


async def score_submission(
    db: AsyncSession, user: User, passage: ReadingPassage, answers: List[int]
) -> tuple[List[bool], RewardSummary]:
    """Grade the answers in question order and award XP for correct ones.
    Mutates within the caller's transaction; the caller commits."""
    results: List[bool] = []
    for i, question in enumerate(passage.questions):
        picked = answers[i] if i < len(answers) else -1
        results.append(picked == question.answer_index)
    reward = await apply_skill_xp(db, user, sum(results) * XP_PER_CORRECT_ANSWER)
    return results, reward
