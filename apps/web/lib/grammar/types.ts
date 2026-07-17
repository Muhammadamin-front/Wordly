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

/** One grammar lesson. Explanations are written in Uzbek (the app's audience)
 *  with English terminology kept inline; examples are bilingual. */
export interface GrammarLesson {
  slug: string;
  level: GrammarLevel;
  title: string; // English grammar name, e.g. "Present Simple"
  titleUz: string; // Uzbek name, e.g. "Oddiy hozirgi zamon"
  emoji: string;
  explanation: string[]; // paragraphs
  formula?: string;
  examples: GrammarExample[];
  mistakes: GrammarMistake[];
  quiz: GrammarQuizItem[];
}
