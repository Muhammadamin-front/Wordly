from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RewardOut(BaseModel):
    xp_gained: int
    total_xp: int
    level: int
    leveled_up: bool


class WritingTask(BaseModel):
    title: str
    prompt: str
    # Task 1 prompts may include a compact chart description for the web client.
    # Keeping the data alongside the prompt lets learners see the visual before
    # they start writing, without fetching a separate image asset.
    visual: Optional[Dict[str, Any]] = None


class HistoryItemOut(BaseModel):
    skill: str
    band: float
    correct: Optional[int] = None  # Reading/Listening only
    total: Optional[int] = None
    created_at: datetime


class OverviewOut(BaseModel):
    best_bands: Dict[str, float]  # skill -> best band
    recent: List[HistoryItemOut]  # newest first
    enabled: bool


class QuestionOut(BaseModel):
    prompt: str
    options: List[str]


class BankItemOut(BaseModel):
    id: str
    title: str
    band: float  # approximate difficulty, for sorting/labelling
    question_count: int
    word_count: int
    done: bool


class GenerateRequest(BaseModel):
    band: float = Field(default=6.0, ge=4.0, le=9.0)


class GeneratedTestOut(BaseModel):
    test_id: UUID
    title: str
    body: str  # reading passage OR listening script (spoken by the browser)
    questions: List[QuestionOut]


class SubmitRequest(BaseModel):
    test_id: UUID
    answers: List[int]
    # Set when this submission is one leg of an IELTS Full Mock exam, so the
    # resulting IeltsResult row can be tied back to that session.
    mock_session_id: Optional[UUID] = None


class GradeOut(BaseModel):
    correct: int
    total: int
    band: float
    # Short practice sets cannot resolve a single band; the client shows a range.
    approximate: bool = False
    answers: List[int]  # correct indices, revealed after grading
    explanations: List[str] = []  # why each answer is right, same order
    reward: RewardOut


class WritingScoreRequest(BaseModel):
    task_type: str = Field(pattern="^(task1|task2)$")
    prompt: str = Field(min_length=10, max_length=1200)
    essay: str = Field(min_length=20, max_length=6000)
    lang: str = Field(default="en", pattern="^(uz|ru|en)$")  # feedback language
    mock_session_id: Optional[UUID] = None


class CriterionOut(BaseModel):
    band: float
    comment: str


class WritingErrorOut(BaseModel):
    quote: str  # exact fragment from the essay
    fix: str  # corrected fragment
    note: str  # one-sentence explanation in the requested language
    type: str  # grammar|vocabulary|spelling|punctuation|style


WritingFeedbackStatus = Literal["good", "improve", "error"]
WritingFeedbackCategory = Literal[
    "grammar",
    "vocabulary",
    "collocation",
    "articles",
    "prepositions",
    "word_form",
    "tense",
    "subject_verb_agreement",
    "sentence_structure",
    "punctuation",
    "cohesion",
    "logic",
    "style",
    "spelling",
]


class WritingSentenceFeedbackOut(BaseModel):
    sentence_number: int
    sentence: str
    highlight: str
    status: WritingFeedbackStatus
    category: WritingFeedbackCategory
    explanation: str
    use_instead: str
    why: str


class WritingGoodPointOut(BaseModel):
    title: str
    evidence: str
    explanation: str


class WritingAreaToImproveOut(BaseModel):
    title: str
    evidence: str
    action: str


class WritingLanguageUpgradeOut(BaseModel):
    used: str
    use_instead: str
    why: str


class WritingRepetitionOut(BaseModel):
    word: str
    frequency: int
    problem: str
    alternatives: List[str]


class WritingQuotedAnalysisPointOut(BaseModel):
    quote: str
    explanation: str


class WritingCohesionOut(BaseModel):
    strengths: List[WritingQuotedAnalysisPointOut]
    issues: List[WritingQuotedAnalysisPointOut]
    opportunities: List[str]


class WritingGrammarProfileOut(BaseModel):
    strengths: List[WritingQuotedAnalysisPointOut]
    weaknesses: List[WritingQuotedAnalysisPointOut]


class WritingBandPlanOut(BaseModel):
    current_band: float
    target_band: float
    actions: List[str]


class WritingAnalysisOut(BaseModel):
    sentence_feedback: List[WritingSentenceFeedbackOut]
    good_points: List[WritingGoodPointOut]
    areas_to_improve: List[WritingAreaToImproveOut]
    language_upgrades: List[WritingLanguageUpgradeOut]
    repetitions: List[WritingRepetitionOut]
    cohesion: WritingCohesionOut
    grammar_profile: WritingGrammarProfileOut
    band_plan: WritingBandPlanOut
    next_steps: List[str]


class WritingQuotaOut(BaseModel):
    """What the essay composer shows before the learner starts writing, so a
    limit is never discovered by hitting it."""

    # "week" on the free plan, "day" on a paid one — the two tiers are capped
    # over different windows.
    period: Literal["week", "day"]
    limit: int
    used: int
    remaining: int
    premium: bool


class MockQuotaOut(BaseModel):
    free_attempt_available: bool
    premium: bool
    coin_cost: int
    coin_balance: int


class QueuedJobOut(BaseModel):
    """202 response for work handed to the background worker; poll
    GET /jobs/{job_id} for the result."""

    job_id: UUID


def writing_score_out(score) -> "WritingScoreOut":
    """Builds the response from a services.ielts WritingScore.

    Lives here rather than in the route because the queue worker produces the
    very same payload out of band — see services/job_handlers.py."""
    return WritingScoreOut(
        band_overall=score.band_overall,
        task=CriterionOut(band=score.task.band, comment=score.task.comment),
        coherence=CriterionOut(band=score.coherence.band, comment=score.coherence.comment),
        lexical=CriterionOut(band=score.lexical.band, comment=score.lexical.comment),
        grammar=CriterionOut(band=score.grammar.band, comment=score.grammar.comment),
        errors=[
            WritingErrorOut(quote=e.quote, fix=e.fix, note=e.note, type=e.type)
            for e in score.errors
        ],
        strengths=score.strengths,
        feedback=score.feedback,
        improved=score.improved,
        analysis=WritingAnalysisOut(**score.analysis),
        reward=RewardOut(
            xp_gained=score.reward.xp_gained,
            total_xp=score.reward.total_xp,
            level=score.reward.level,
            leveled_up=score.reward.leveled_up,
        ),
    )


class WritingScoreOut(BaseModel):
    band_overall: float
    task: CriterionOut
    coherence: CriterionOut
    lexical: CriterionOut
    grammar: CriterionOut
    errors: List[WritingErrorOut]
    strengths: List[str]
    feedback: str
    improved: str  # full band-8 model rewrite
    analysis: WritingAnalysisOut
    reward: RewardOut
