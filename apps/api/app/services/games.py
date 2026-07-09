"""Game session builder. Every game draws from the user's own cards (due and
weak first) so playing a game *is* an SRS review — games are not a separate
silo. Answers are recorded through services.review.record_review."""
import random
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import utcnow
from app.models.flashcards import Card
from app.models.user import User
from app.models.vocabulary import Word, WordSense

GAME_TYPES = (
    "word_match",
    "speed_quiz",
    "fill_blank",
    "audio_guess",
    "typing_race",
    "memory",
)

# Games that show translation options need distractor translations; games that
# ask for the English word need distractor headwords.
ANSWER_IS_TRANSLATION = {"word_match", "speed_quiz", "audio_guess", "memory"}
MIN_CARDS = 4
DEFAULT_COUNT = 10
BOARD_GAME_MAX = 6  # word_match / memory board size (pairs)


class GameQuestion:
    def __init__(
        self,
        card_id: UUID,
        prompt: str,
        answer: str,
        distractors: List[str],
        audio_text: Optional[str] = None,
    ):
        self.card_id = card_id
        self.prompt = prompt
        self.answer = answer
        self.distractors = distractors
        self.audio_text = audio_text


def _blank_sentence(example: str, headword: str) -> str:
    """Replace the headword (case-insensitive, whole-ish) with a blank."""
    lowered = example.lower()
    index = lowered.find(headword.lower())
    if index == -1:
        return None
    return example[:index] + "____" + example[index + len(headword) :]


async def _distractor_pool(
    db: AsyncSession, exclude_card_ids: List[UUID], want_translation: bool, limit: int = 60
) -> List[str]:
    """A pool of alternative headwords or translations drawn from the published
    corpus, so multiple-choice options always fill even with few user cards."""
    column = WordSense.translation_uz if want_translation else Word.headword
    rows = await db.scalars(
        select(column)
        .select_from(Word)
        .join(WordSense, WordSense.word_id == Word.id)
        .where(Word.status == "published", WordSense.sense_order == 1)
        .order_by(func.random())
        .limit(limit)
    )
    return list(dict.fromkeys(rows.all()))  # de-duplicate, keep order


async def _pick_cards(db: AsyncSession, user: User, count: int) -> List[Card]:
    """Due and weak cards first, then fill with the rest — only word-linked
    cards (games need structured translations)."""
    now = utcnow()
    due = (
        await db.scalars(
            select(Card)
            .where(Card.user_id == user.id, Card.word_id.isnot(None), Card.due_at <= now)
            .order_by(Card.ease_factor.asc(), Card.due_at.asc())
            .limit(count)
        )
    ).unique().all()
    if len(due) >= count:
        return list(due)

    have = {c.id for c in due}
    filler = (
        await db.scalars(
            select(Card)
            .where(Card.user_id == user.id, Card.word_id.isnot(None))
            .order_by(func.random())
            .limit(count * 2)
        )
    ).unique().all()
    result = list(due)
    for card in filler:
        if card.id not in have:
            result.append(card)
            have.add(card.id)
        if len(result) >= count:
            break
    return result


def _card_translation(card: Card) -> Optional[str]:
    if card.word and card.word.senses:
        return card.word.senses[0].translation_uz
    return None


async def build_session(
    db: AsyncSession, user: User, game_type: str, count: int = DEFAULT_COUNT
) -> Tuple[List[GameQuestion], int]:
    if game_type in ("word_match", "memory"):
        count = min(count, BOARD_GAME_MAX)

    cards = await _pick_cards(db, user, count)
    usable = [c for c in cards if c.word and c.word.senses]
    if len(usable) < MIN_CARDS:
        return [], len(usable)

    want_translation = game_type in ANSWER_IS_TRANSLATION
    answers = set()
    for card in usable:
        answers.add(_card_translation(card) if want_translation else card.word.headword)
    pool = [p for p in await _distractor_pool(db, [], want_translation) if p not in answers]

    questions: List[GameQuestion] = []
    for card in usable:
        headword = card.word.headword
        translation = _card_translation(card)

        if game_type == "typing_race":
            questions.append(GameQuestion(card.id, translation, headword, []))
        elif game_type == "fill_blank":
            example = card.word.senses[0].examples[0].text_en if card.word.senses[0].examples else None
            blanked = _blank_sentence(example, headword) if example else None
            prompt = blanked or "“{}”".format(card.word.senses[0].definition_en)
            distractors = random.sample(pool, min(3, len(pool)))
            questions.append(GameQuestion(card.id, prompt, headword, distractors))
        elif game_type == "audio_guess":
            distractors = random.sample(pool, min(3, len(pool)))
            questions.append(
                GameQuestion(card.id, "", translation, distractors, audio_text=headword)
            )
        elif game_type in ("word_match", "memory"):
            questions.append(GameQuestion(card.id, headword, translation, []))
        else:  # speed_quiz
            distractors = random.sample(pool, min(3, len(pool)))
            questions.append(GameQuestion(card.id, headword, translation, distractors))

    return questions, len(usable)
