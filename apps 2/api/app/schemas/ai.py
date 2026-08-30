from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

CEFR_PATTERN = "^(A1|A2|B1|B2|C1|C2)$"


class QuotaOut(BaseModel):
    remaining: int
    daily_quota: int
    enabled: bool


class AiTextOut(BaseModel):
    text: str
    ai_generated: bool = True  # every AI output is labeled


class ExplainRequest(BaseModel):
    word_id: UUID


class MnemonicRequest(BaseModel):
    word_id: UUID


class StoryRequest(BaseModel):
    # Optional explicit words; otherwise the user's due/learning words are used.
    word_ids: Optional[List[UUID]] = Field(default=None, max_length=12)


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1, max_length=20)
    level: str = Field(default="A2", pattern=CEFR_PATTERN)


class QuizRequest(BaseModel):
    word_ids: Optional[List[UUID]] = Field(default=None, max_length=20)
    cefr_level: Optional[str] = Field(default=None, pattern=CEFR_PATTERN)
    count: int = Field(default=5, ge=3, le=10)


class QuizQuestionOut(BaseModel):
    prompt: str
    options: List[str]
    answer_index: int
    ai_generated: bool = True


class QuizOut(BaseModel):
    questions: List[QuizQuestionOut]


class WritingCheckRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class WritingCheckOut(BaseModel):
    corrected: str
    feedback: str
    ai_generated: bool = True


class ReportRequest(BaseModel):
    kind: str = Field(min_length=1, max_length=24)
    output: str = Field(min_length=1, max_length=4000)
    prompt: Optional[str] = Field(default=None, max_length=4000)
    reason: Optional[str] = Field(default=None, max_length=300)


class MessageOut(BaseModel):
    message: str
