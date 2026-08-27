from dataclasses import dataclass
from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import DailyQuestClaim, GameRun
from app.models.user import User
from app.services.gamification import RewardSummary, apply_skill_xp
from app.services.leveling import local_today


@dataclass(frozen=True)
class QuestDefinition:
    code: str
    target: int
    xp_reward: int
    game_type: str
    source_category: Optional[str] = None


BASE_QUESTS = (
    QuestDefinition("correct_5", 5, 15, "speed_quiz"),
    QuestDefinition("combo_3", 3, 15, "speed_quiz"),
)

# One per weekday. Codes are unique across the tuple: DailyQuestClaim rows are
# keyed by code, so two slots sharing one would collide if both ever ran on the
# same day.
ROTATING_QUESTS = (
    QuestDefinition("match_1", 1, 20, "word_match"),
    QuestDefinition("phrasal_5", 5, 25, "speed_quiz", "phrasal"),
    QuestDefinition("memory_1", 1, 25, "memory"),
    QuestDefinition("complete_2", 2, 25, "speed_quiz"),
    QuestDefinition("phrasal_blank_5", 5, 25, "fill_blank", "phrasal"),
    QuestDefinition("perfect_1", 1, 30, "speed_quiz"),
    QuestDefinition("hangman_1", 1, 20, "hangman"),
)


def definitions_for(day: date) -> tuple[QuestDefinition, ...]:
    return (*BASE_QUESTS, ROTATING_QUESTS[day.weekday()])


def _progress_for(definition: QuestDefinition, runs: list[GameRun]) -> int:
    """Progress towards one quest, counted only from runs that actually match it.

    Progress used to be measured across every game played that day while the
    quest card linked to a specific one, so a card reading "play Word Match"
    was satisfied by a round of Hangman. The card names a game; only that game
    should count.
    """
    matching = [run for run in runs if run.game_type == definition.game_type]
    if definition.source_category:
        matching = [
            run for run in matching if run.source_category == definition.source_category
        ]
    finished = [run for run in matching if run.completed_at is not None]

    if definition.code in ("correct_5", "phrasal_5", "phrasal_blank_5"):
        return sum(run.correct_count for run in matching)
    if definition.code == "combo_3":
        return max((run.best_combo for run in matching), default=0)
    if definition.code in ("match_1", "complete_2", "memory_1", "hangman_1"):
        return len(finished)
    if definition.code == "perfect_1":
        return sum(
            run.correct_count == run.total_questions and run.total_questions > 0
            for run in finished
        )
    return 0


async def _day_state(
    db: AsyncSession, user: User, day: date
) -> tuple[list[GameRun], dict[str, DailyQuestClaim]]:
    runs = list(
        (
            await db.scalars(
                select(GameRun).where(GameRun.user_id == user.id, GameRun.day == day)
            )
        ).all()
    )
    claims = {
        claim.code: claim
        for claim in (
            await db.scalars(
                select(DailyQuestClaim).where(
                    DailyQuestClaim.user_id == user.id,
                    DailyQuestClaim.day == day,
                )
            )
        ).all()
    }
    return runs, claims


async def daily_quest_snapshot(db: AsyncSession, user: User) -> dict:
    day = local_today(user.profile.timezone or "UTC")
    runs, claims = await _day_state(db, user, day)
    quests = []
    for definition in definitions_for(day):
        progress = min(definition.target, _progress_for(definition, runs))
        quests.append(
            {
                "code": definition.code,
                "progress": progress,
                "target": definition.target,
                "xp_reward": definition.xp_reward,
                "completed": definition.code in claims,
                "game_type": definition.game_type,
                "source_category": definition.source_category,
            }
        )

    game_xp = sum(run.review_xp + run.completion_xp for run in runs)
    game_xp += sum(claim.xp_reward for claim in claims.values())
    return {
        "day": day,
        "game_xp_today": game_xp,
        "completed_count": sum(quest["completed"] for quest in quests),
        "total_count": len(quests),
        "quests": quests,
    }


async def award_completed_quests(
    db: AsyncSession, user: User
) -> tuple[list[str], RewardSummary]:
    day = local_today(user.profile.timezone or "UTC")
    runs, claims = await _day_state(db, user, day)
    completed = [
        definition
        for definition in definitions_for(day)
        if definition.code not in claims
        and _progress_for(definition, runs) >= definition.target
    ]
    if not completed:
        return [], RewardSummary()

    for definition in completed:
        db.add(
            DailyQuestClaim(
                user_id=user.id,
                day=day,
                code=definition.code,
                xp_reward=definition.xp_reward,
            )
        )
    await db.flush()
    reward = await apply_skill_xp(db, user, sum(item.xp_reward for item in completed))
    return [item.code for item in completed], reward
