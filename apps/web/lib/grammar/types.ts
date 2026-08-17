export type GrammarLevel = "A1" | "A2" | "B1" | "B2" | "IELTS";

export interface GrammarExample {
  en: string;
  uz: string;
}

export interface GrammarMistake {
  wrong: string;
  right: string;
  note: string; // one-line explanation in Uzbek
}

export interface GrammarQuizItem {
  q: string; // question, may contain a ___ gap
  options: string[];
  answer: number; // index into options
}

export interface GrammarKeyPoint {
  title: string;
  body: string;
}

/** A lesson's teaching text in one language.
 *
 *  The base lesson is written in Uzbek — the app's first audience — so a
 *  translation supplies the same fields for another locale. Arrays must line up
 *  with the base lesson index for index, which `tests/grammar-translations`
 *  enforces; an empty string leaves that entry as it is, which is what English
 *  needs for gap-fill prompts that are already English.
 */
export interface GrammarLessonTranslation {
  /** The lesson name in this language, shown under the English grammar term. */
  name: string;
  explanation: string[];
  formula?: string;
  keyPoints?: GrammarKeyPoint[];
  importantNotes?: string[];
  examTips?: string[];
  /** One per example. Omitted for English, where translating an English
   *  sentence into English would say nothing — the view hides the row. */
  exampleTranslations?: string[];
  /** One per mistake, same order. */
  mistakeNotes: string[];
  /** One per quiz item, same order. Empty string = keep the base prompt. */
  quizPrompts?: string[];
}

/** One grammar lesson. The base text is Uzbek (the app's first audience) with
 *  English terminology kept inline; `translations` carries other locales. */
export interface GrammarLesson {
  slug: string;
  level: GrammarLevel;
  title: string; // English grammar name, e.g. "Present Simple"
  titleUz: string; // Uzbek name, e.g. "Oddiy hozirgi zamon"
  emoji: string;
  explanation: string[]; // paragraphs
  formula?: string;
  highlights?: string[]; // words/structures to visually mark inside explanations and examples
  keyPoints?: GrammarKeyPoint[]; // compact "why / how / when" teaching blocks
  importantNotes?: string[]; // short high-priority warnings or exam notes
  examTips?: string[]; // IELTS/CEFR usage tips for production practice
  examples: GrammarExample[];
  mistakes: GrammarMistake[];
  quiz: GrammarQuizItem[];
  /** Other locales. A missing entry falls back to the Uzbek base text. */
  translations?: Partial<Record<"ru" | "en", GrammarLessonTranslation>>;
}
