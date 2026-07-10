from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PassageListItem(BaseModel):
    id: UUID
    slug: str
    cefr_level: str
    title_en: str
    question_count: int


class QuestionOut(BaseModel):
    prompt_en: str
    options: List[str]  # answer_index is never sent to the client


class PassageOut(BaseModel):
    id: UUID
    slug: str
    cefr_level: str
    title_en: str
    body_en: str
    summary_uz: Optional[str]
    questions: List[QuestionOut]


class ReadingSubmit(BaseModel):
    answers: List[int] = Field(max_length=20)


class ReadingResult(BaseModel):
    correct: int
    total: int
    results: List[bool]
    xp_gained: int
    total_xp: int
    level: int
    leveled_up: bool


class WritingPromptsOut(BaseModel):
    level: str
    prompts: List[str]


class GrammarQuestionOut(BaseModel):
    prompt: str
    options: List[str]  # answer never sent; grading is server-side


class GrammarAnswer(BaseModel):
    prompt: str = Field(max_length=200)
    answer: str = Field(max_length=100)


class GrammarSubmit(BaseModel):
    level: str = Field(pattern="^(A1|A2|B1|B2|C1|C2)$")
    answers: List[GrammarAnswer] = Field(max_length=30)
