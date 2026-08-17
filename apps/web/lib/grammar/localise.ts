import type { GrammarLesson } from "./types";

/** Returns the lesson with its teaching text in the requested locale.
 *
 *  The base lesson is Uzbek. Where a translation is missing — most levels are
 *  not translated yet — the Uzbek text is returned unchanged, so the lesson
 *  still works rather than rendering blanks.
 */
export function localiseLesson(lesson: GrammarLesson, locale: string): GrammarLesson {
  const translation =
    locale === "uz" ? undefined : lesson.translations?.[locale as "ru" | "en"];

  // `translations` is dropped from the result either way: it is server-side
  // source data, and serialising every locale into the page payload would ship
  // three copies of each lesson to the browser.
  const { translations, ...base } = lesson;
  void translations;
  if (!translation) return base;

  const pick = <T,>(index: number, translated: T[] | undefined, base: T): T => {
    const value = translated?.[index];
    return value === undefined || value === "" ? base : value;
  };

  return {
    ...base,
    titleUz: translation.name,
    explanation: translation.explanation,
    formula: translation.formula ?? lesson.formula,
    keyPoints: translation.keyPoints ?? lesson.keyPoints,
    importantNotes: translation.importantNotes ?? lesson.importantNotes,
    examTips: translation.examTips ?? lesson.examTips,
    examples: lesson.examples.map((example, index) => ({
      ...example,
      // English needs no translation of an English sentence; an empty string
      // tells the view to hide the row.
      uz: translation.exampleTranslations ? (translation.exampleTranslations[index] ?? "") : "",
    })),
    mistakes: lesson.mistakes.map((mistake, index) => ({
      ...mistake,
      note: pick(index, translation.mistakeNotes, mistake.note),
    })),
    quiz: lesson.quiz.map((item, index) => ({
      ...item,
      q: pick(index, translation.quizPrompts, item.q),
    })),
  };
}
