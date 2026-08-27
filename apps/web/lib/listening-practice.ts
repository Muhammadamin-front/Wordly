/** Full Mock Listening — real 4-section IELTS-format tests: static content,
 *  graded 100% client-side (mirrors reading-practice.ts's precedent — the
 *  answer key already ships to the browser for Reading, same trade-off
 *  here). Audio is synthesized server-side per section from `turns` via
 *  ElevenLabs (see apps/api/app/services/listening_audio.py); `turns` is
 *  mirrored into apps/api/app/content/listening/<slug>.json by
 *  scripts/emit-listening-audio-content.mjs — run that after any content
 *  edit here, or the audio will lag the questions.
 */

export type ListeningSpeakerRole = "a" | "b" | "narrator";

export type ListeningTurn = {
  speaker: string;
  role: ListeningSpeakerRole;
  text: string;
};

/** A deliberate subset of ReadingQuestionKind (reading-practice.ts) — only
 *  the kinds that map to how IELTS Listening actually sets questions.
 *  matching-headings/true-false-not-given/yes-no-not-given/matching-information/
 *  diagram-labelling are Reading-only formats. */
export type ListeningQuestionKind =
  | "multiple-choice"
  | "multiple-answer"
  | "matching-features"
  | "sentence-completion"
  | "summary-completion"
  | "table-completion"
  | "form-completion"
  | "short-answer";

export type ListeningOption = { value: string; label: string };

export type ListeningQuestion = {
  id: string;
  number: number;
  section: 1 | 2 | 3 | 4;
  kind: ListeningQuestionKind;
  prompt: string;
  instruction?: string;
  options?: ListeningOption[];
  answer: string | string[];
  acceptedAnswers?: string[];
  explanation: string;
};

export type ListeningSection = {
  number: 1 | 2 | 3 | 4;
  title: string;
  turns: ListeningTurn[];
  questions: ListeningQuestion[];
};

export type ListeningFullTest = {
  slug: string;
  title: string;
  minutes: number;
  sections: ListeningSection[];
};

export const LISTENING_FULL_TESTS: ListeningFullTest[] = [
  // Phase-1 fixture — proves the pipeline (types, audio synthesis, grading,
  // leg UI) end to end before the real 4-section/40-question test is
  // authored and swapped in here.
  {
    slug: "listening-full-fixture-1",
    title: "Listening Practice Test (fixture)",
    minutes: 30,
    sections: [
      {
        number: 1,
        title: "Enrolling at a language centre",
        turns: [
          { speaker: "Receptionist", role: "a", text: "Good morning, City Language Centre. How can I help you today?" },
          { speaker: "Student", role: "b", text: "Hi, I'd like to ask about the evening English courses. What levels do you offer?" },
          { speaker: "Receptionist", role: "a", text: "We run three levels. The upper-intermediate class meets on Tuesdays and Thursdays, from six thirty to eight thirty." },
          { speaker: "Student", role: "b", text: "That sounds good. My name is Carlos Rivera, and my surname is spelled R-I-V-E-R-A." },
        ],
        questions: [
          {
            id: "fixture-1-1",
            number: 1,
            section: 1,
            kind: "multiple-choice",
            prompt: "When does the upper-intermediate class meet?",
            options: [
              { value: "A", label: "Mondays and Wednesdays" },
              { value: "B", label: "Tuesdays and Thursdays" },
              { value: "C", label: "Friday evenings only" },
              { value: "D", label: "Every weekday" },
            ],
            answer: "B",
            explanation: "The receptionist says the upper-intermediate class meets 'on Tuesdays and Thursdays'.",
          },
          {
            id: "fixture-1-2",
            number: 2,
            section: 1,
            kind: "form-completion",
            prompt: "Complete the form. Student's surname: ______",
            instruction: "Write ONE WORD ONLY.",
            answer: "Rivera",
            acceptedAnswers: ["rivera"],
            explanation: "The student spells his surname: 'R-I-V-E-R-A'.",
          },
        ],
      },
    ],
  },
];

/** Mirrors reading-practice.ts's isCorrect() semantics exactly, but is a
 *  fresh, small (~10-line) implementation rather than an import — the
 *  reading component that owns that logic is large, dual-purpose, and
 *  reading-type-specific; duplicating this little pure function is lower
 *  risk than adding a shared export surface to it. Keep the two in sync by
 *  hand if either's grading semantics change. */
export function isListeningCorrect(
  question: ListeningQuestion,
  value: string | string[] | undefined
): boolean {
  if (Array.isArray(question.answer)) {
    return (
      Array.isArray(value) &&
      [...value].sort().join("|") === [...question.answer].sort().join("|")
    );
  }
  if (Array.isArray(value)) return false;
  const normalise = (entry: string) => entry.trim().toLocaleLowerCase().replace(/[.]/g, "");
  const accepted = [question.answer, ...(question.acceptedAnswers ?? [])].map(normalise);
  return value ? accepted.includes(normalise(value)) : false;
}

/** Published raw-score conversion for the 40-question Academic Listening
 *  paper (as the ratio at the bottom of each band) — unlike Reading, IELTS
 *  Listening uses one table regardless of Academic/General Training. Close
 *  to but not identical to Reading Academic's table, so this is its own
 *  constant rather than a reuse of readingBand's. */
const LISTENING_BAND_TABLE: ReadonlyArray<readonly [number, number]> = [
  [0.975, 9], [0.925, 8.5], [0.875, 8], [0.8, 7.5], [0.75, 7],
  [0.65, 6.5], [0.575, 6], [0.45, 5.5], [0.4, 5], [0.325, 4.5],
  [0.25, 4], [0.175, 3.5],
];

export function listeningBand(score: number, total: number): { band: number; approximate: boolean } {
  const ratio = total ? score / total : 0;
  const match = LISTENING_BAND_TABLE.find(([threshold]) => ratio >= threshold);
  return { band: match ? match[1] : 2.5, approximate: total < 20 };
}
