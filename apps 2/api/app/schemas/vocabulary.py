from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.vocabulary import CEFR_LEVELS, RELATION_TYPES, WORD_STATUSES

CEFR_PATTERN = "^({})$".format("|".join(CEFR_LEVELS))
STATUS_PATTERN = "^({})$".format("|".join(WORD_STATUSES))
RELATION_PATTERN = "^({})$".format("|".join(RELATION_TYPES))


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    name_en: str
    name_uz: str
    name_ru: str
    emoji: Optional[str] = None


class ExampleIn(BaseModel):
    text_en: str = Field(min_length=1)
    text_uz: Optional[str] = None
    text_ru: Optional[str] = None


class ExampleOut(ExampleIn):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    audio_url: Optional[str] = None


class SenseIn(BaseModel):
    definition_en: str = Field(min_length=1)
    translation_uz: str = Field(min_length=1, max_length=160)
    translation_ru: str = Field(min_length=1, max_length=160)
    definition_uz: Optional[str] = None
    definition_ru: Optional[str] = None
    usage_note: Optional[str] = None
    examples: List[ExampleIn] = Field(default_factory=list)


class SenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sense_order: int
    definition_en: str
    translation_uz: str
    translation_ru: str
    definition_uz: Optional[str] = None
    definition_ru: Optional[str] = None
    usage_note: Optional[str] = None
    examples: List[ExampleOut]


class RelationIn(BaseModel):
    relation_type: str = Field(pattern=RELATION_PATTERN)
    related_text: str = Field(min_length=1, max_length=120)


class RelationOut(RelationIn):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    related_word_id: Optional[UUID] = None


class WordCreate(BaseModel):
    headword: str = Field(min_length=1, max_length=80)
    pos: str = Field(min_length=1, max_length=20)
    cefr_level: str = Field(pattern=CEFR_PATTERN)
    ipa: Optional[str] = Field(default=None, max_length=80)
    audio_url: Optional[str] = None
    image_url: Optional[str] = None
    frequency_rank: Optional[int] = Field(default=None, ge=1)
    word_family: Optional[str] = Field(default=None, max_length=80)
    common_mistake: Optional[str] = None
    category_slug: Optional[str] = None
    status: str = Field(default="draft", pattern=STATUS_PATTERN)
    senses: List[SenseIn] = Field(min_length=1)
    relations: List[RelationIn] = Field(default_factory=list)


class WordUpdate(BaseModel):
    headword: Optional[str] = Field(default=None, min_length=1, max_length=80)
    pos: Optional[str] = Field(default=None, min_length=1, max_length=20)
    cefr_level: Optional[str] = Field(default=None, pattern=CEFR_PATTERN)
    ipa: Optional[str] = Field(default=None, max_length=80)
    audio_url: Optional[str] = None
    image_url: Optional[str] = None
    frequency_rank: Optional[int] = Field(default=None, ge=1)
    word_family: Optional[str] = Field(default=None, max_length=80)
    common_mistake: Optional[str] = None
    category_slug: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern=STATUS_PATTERN)
    # When provided, replaces all senses/relations (simplest correct semantics for a CMS form).
    senses: Optional[List[SenseIn]] = Field(default=None, min_length=1)
    relations: Optional[List[RelationIn]] = None


class WordListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    headword: str
    slug: str
    pos: str
    ipa: Optional[str] = None
    cefr_level: str
    frequency_rank: Optional[int] = None
    status: str
    category: Optional[CategoryOut] = None
    primary_translation_uz: Optional[str] = None
    primary_translation_ru: Optional[str] = None
    primary_example_en: Optional[str] = None
    image_url: Optional[str] = None


class WordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    headword: str
    slug: str
    pos: str
    ipa: Optional[str] = None
    audio_url: Optional[str] = None
    image_url: Optional[str] = None
    cefr_level: str
    frequency_rank: Optional[int] = None
    word_family: Optional[str] = None
    common_mistake: Optional[str] = None
    status: str
    category: Optional[CategoryOut] = None
    senses: List[SenseOut]
    relations: List[RelationOut]


class WordPage(BaseModel):
    items: List[WordListItem]
    total: int
    page: int
    page_size: int


class CatalogMeta(BaseModel):
    word_total: int
    expression_total: int
    learning_item_total: int
    levels: Dict[str, int]


class ImportReport(BaseModel):
    created: int
    updated: int
    errors: List[str]
