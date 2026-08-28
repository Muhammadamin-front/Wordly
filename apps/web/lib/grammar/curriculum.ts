import { expansionLessons } from "./curriculum-expansion";
import type {
  CefrGrammarLevel,
  GrammarCategory,
  GrammarExercise,
  GrammarLesson,
  GrammarLessonSummary,
} from "./types";

export const TARGET_LESSON_COUNTS: Record<CefrGrammarLevel, number> = {
  A1: 30,
  A2: 35,
  B1: 45,
  B2: 50,
  C1: 40,
};

export const MASTERY_THRESHOLDS = {
  mastered: 90,
  good: 70,
  needsReview: 50,
} as const;

export type GrammarMasteryStatus = "not-started" | "weak" | "needs-review" | "good" | "mastered";

export function masteryStatus(score: number | null | undefined): GrammarMasteryStatus {
  if (score == null) return "not-started";
  if (score >= MASTERY_THRESHOLDS.mastered) return "mastered";
  if (score >= MASTERY_THRESHOLDS.good) return "good";
  if (score >= MASTERY_THRESHOLDS.needsReview) return "needs-review";
  return "weak";
}

function categoryFor(lesson: GrammarLesson): GrammarCategory {
  const value = `${lesson.slug} ${lesson.title}`.toLowerCase();
  if (/condition|wish|if only|unless/.test(value)) return "Conditionals";
  if (/passive|causative|something done/.test(value)) return "Passive";
  if (/report/.test(value)) return "Reported speech";
  if (/relative/.test(value)) return "Relative clauses";
  if (/modal|must|should|can |can't|could|might/.test(value)) return "Modal verbs";
  if (/tense|present|past|future|used to|time clause/.test(value)) return "Tenses";
  if (/article|noun|plural|nominali/.test(value)) return "Nouns & articles";
  if (/pronoun|possess|determiner|quantifier|some|many|much/.test(value)) return "Pronouns & determiners";
  if (/preposition/.test(value)) return "Prepositions";
  if (/gerund|infinitive|verb pattern/.test(value)) return "Verb patterns";
  if (/question/.test(value)) return "Questions";
  if (/compar|superlative/.test(value)) return "Comparison";
  if (/clause|link|cohesion|concession|despite|although|parallel|punctuation/.test(value)) return "Clauses & linking";
  if (/inversion|cleft|fronting|ellipsis|substitution|hedging|subjunctive|emphasis|academic/.test(value)) return "Advanced grammar";
  if (/word order|adverb|adjective/.test(value)) return "Word order";
  return "Foundations";
}

function explanationFor(lesson: GrammarLesson, correct: string): string {
  return lesson.mistakes[0]?.note ?? `${correct} varianti darsdagi formula va gap ma’nosiga mos.`;
}

function legacyExercises(lesson: GrammarLesson): GrammarExercise[] {
  const exercises: GrammarExercise[] = [];
  const quiz = lesson.quiz.length ? lesson.quiz : [{ q: lesson.examples[0]?.en ?? lesson.title, options: [lesson.formula ?? lesson.title], answer: 0 }];
  for (let index = 0; index < 3; index += 1) {
    const item = quiz[index % quiz.length];
    const correct = item.options[item.answer];
    exercises.push({
      id: `${lesson.slug}-mcq-${index + 1}`,
      type: "multiple-choice",
      prompt: item.q,
      options: item.options,
      correctAnswer: correct,
      explanation: item.explanation ?? explanationFor(lesson, correct),
    });
  }
  for (let index = 0; index < 3; index += 1) {
    const item = quiz[(index + 2) % quiz.length];
    const correct = item.options[item.answer];
    exercises.push({
      id: `${lesson.slug}-fill-${index + 1}`,
      type: "fill-blank",
      prompt: item.q.includes("___") ? item.q : `To‘g‘ri shaklni yozing: ${item.q}`,
      correctAnswer: correct,
      explanation: item.explanation ?? explanationFor(lesson, correct),
    });
  }
  for (let index = 0; index < 3; index += 1) {
    const mistake = lesson.mistakes[index % lesson.mistakes.length];
    exercises.push({
      id: `${lesson.slug}-error-${index + 1}`,
      type: "error-correction",
      prompt: `Xatoni tuzating: ${mistake.wrong}`,
      correctAnswer: mistake.right,
      explanation: mistake.note,
    });
  }
  for (let index = 0; index < 2; index += 1) {
    const example = lesson.examples[index % lesson.examples.length].en;
    exercises.push({
      id: `${lesson.slug}-builder-${index + 1}`,
      type: "sentence-builder",
      prompt: "So‘zlardan to‘g‘ri gap tuzing.",
      words: [...example.replace(/[?.!,]/g, "").split(/\s+/).slice(1), example.replace(/[?.!,]/g, "").split(/\s+/)[0]],
      correctAnswer: example,
      explanation: `So‘z tartibi ${lesson.formula ?? lesson.title} qolipiga mos bo‘lishi kerak.`,
    });
  }
  for (let index = 0; index < 2; index += 1) {
    const mistake = lesson.mistakes[index % lesson.mistakes.length];
    exercises.push({
      id: `${lesson.slug}-rewrite-${index + 1}`,
      type: "rewrite",
      prompt: `Ma’noni saqlab, gapni to‘g‘ri qayta yozing: ${mistake.wrong}`,
      correctAnswer: mistake.right,
      explanation: mistake.note,
    });
  }
  for (let index = 0; index < 2; index += 1) {
    const example = lesson.examples[(index + 2) % lesson.examples.length].en;
    const mistake = lesson.mistakes[index % lesson.mistakes.length];
    exercises.push({
      id: `${lesson.slug}-context-${index + 1}`,
      type: "context-choice",
      context: lesson.explanation[index] ?? lesson.introduction,
      prompt: "Kontekstga mos grammatik jihatdan to‘g‘ri gapni tanlang.",
      options: [mistake.wrong, example, mistake.right].filter((value, optionIndex, all) => all.indexOf(value) === optionIndex),
      correctAnswer: example,
      explanation: `${example} darsdagi qoida va kontekstga mos tuzilgan.`,
    });
  }
  return exercises;
}

function enrichLegacy(lesson: GrammarLesson, level: CefrGrammarLevel, order: number): GrammarLesson {
  const category = lesson.category ?? categoryFor(lesson);
  const examples = lesson.examples.slice(0, 8);
  const comparisons = lesson.comparisons?.length ? lesson.comparisons : [{
    title: `${lesson.title}: correct form vs common error`,
    left: lesson.mistakes[0]?.right ?? examples[0]?.en ?? lesson.title,
    right: lesson.mistakes[0]?.wrong ?? examples[1]?.en ?? lesson.title,
    explanation: lesson.mistakes[0]?.note ?? "Birinchi gap darsdagi formulaga mos; ikkinchi gapda shakl yoki so‘z tartibi buzilgan.",
  }];
  return {
    ...lesson,
    level,
    category,
    order,
    introduction: lesson.introduction ?? lesson.explanation[0],
    forms: lesson.forms ?? examples.slice(0, 3).map((example, index) => ({
      label: (["Positive", "Negative", "Question"] as const)[index],
      formula: lesson.formula ?? lesson.title,
      example: example.en,
    })),
    comparisons,
    quiz: lesson.quiz.map((item) => ({
      ...item,
      explanation: item.explanation ?? explanationFor(lesson, item.options[item.answer]),
    })),
    exercises: lesson.exercises?.length ? lesson.exercises : legacyExercises(lesson),
    prerequisites: lesson.prerequisites ?? [],
    relatedLessons: lesson.relatedLessons ?? [],
    estimatedMinutes: lesson.estimatedMinutes ?? (level === "C1" ? 20 : level === "B2" ? 18 : level === "B1" ? 16 : level === "A2" ? 14 : 12),
    difficulty: lesson.difficulty ?? (level === "A1" ? 1 : level === "A2" ? 2 : level === "B1" ? 3 : level === "B2" ? 4 : 5),
  };
}

export function buildCurriculum(legacyByLevel: Record<CefrGrammarLevel, GrammarLesson[]>): Record<CefrGrammarLevel, GrammarLesson[]> {
  const result = {} as Record<CefrGrammarLevel, GrammarLesson[]>;
  for (const level of Object.keys(TARGET_LESSON_COUNTS) as CefrGrammarLevel[]) {
    const legacy = legacyByLevel[level].map((lesson, index) => enrichLegacy(lesson, level, index + 1));
    const expanded = expansionLessons(level, legacy.length + 1).map((lesson, index) =>
      enrichLegacy(lesson, level, legacy.length + index + 1)
    );
    const combined = [...legacy, ...expanded];
    const slugs = new Set(combined.map((lesson) => lesson.slug));
    result[level] = combined.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
      prerequisites: lesson.prerequisites?.length ? lesson.prerequisites : index > 0 ? [combined[index - 1].slug] : [],
      relatedLessons: lesson.relatedLessons?.length
        ? lesson.relatedLessons
        : combined.filter((candidate) => candidate.slug !== lesson.slug && candidate.category === lesson.category).slice(0, 3).map((candidate) => candidate.slug),
    }));
    if (combined.length !== TARGET_LESSON_COUNTS[level]) {
      throw new Error(`${level} curriculum has ${combined.length} lessons; expected ${TARGET_LESSON_COUNTS[level]}`);
    }
    if (slugs.size !== combined.length) throw new Error(`${level} curriculum contains duplicate slugs`);
  }
  return result;
}

export function lessonSummary(lesson: GrammarLesson): GrammarLessonSummary {
  return {
    slug: lesson.slug,
    level: lesson.level as CefrGrammarLevel,
    title: lesson.title,
    titleUz: lesson.titleUz,
    category: lesson.category ?? "Foundations",
    order: lesson.order ?? 0,
    estimatedMinutes: lesson.estimatedMinutes ?? 15,
    prerequisites: lesson.prerequisites ?? [],
  };
}
