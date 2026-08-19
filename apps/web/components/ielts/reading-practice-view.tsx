"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eraser,
  FileText,
  Flag,
  Highlighter,
  LibraryBig,
  Maximize2,
  Minimize2,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Save,
  SearchCheck,
  Send,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  READING_FULL_TESTS,
  READING_PRACTICE_TESTS,
  READING_QUESTION_TYPE_GUIDES,
  allReadingQuestions,
  getReadingTest,
  readingBand,
  getQuestionsForReadingQuestionType,
  type ReadingParagraph,
  type ReadingPracticeTest,
  type ReadingQuestion,
  type ReadingQuestionTypeGuideId,
} from "@/lib/reading-practice";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { lookupWords, type WordLookupEntry } from "@/lib/vocab";
import { cn } from "@/lib/utils";
import { ReadingQuestionTypePractice } from "./reading-question-type-practice";

type StudyMode = "practice" | "exam";
type Screen = "library" | "question-types" | "start" | "test" | "result";
type AnswerValue = string | string[];
type HighlightColor = "yellow" | "green" | "blue" | "pink";
type Drawer = "notes" | "vocabulary" | null;
type ReadingPartId = "part1" | "part2" | "part3";

type Highlight = {
  id: string;
  passageId: string;
  paragraphIndex: number;
  start: number;
  end: number;
  text: string;
  color: HighlightColor;
};

type PassageNote = {
  id: string;
  quote: string;
  body: string;
};

type SavedVocabulary = {
  id: string;
  word: string;
  translation: string;
  definition: string;
  example: string;
  passageTitle: string;
  note: string;
  color: HighlightColor;
  favourite: boolean;
  learned: boolean;
};

type TestHistory = Record<string, { bestScore: number; completed: boolean; lastScore?: number }>;

type SelectedRange = {
  passageId: string;
  paragraphIndex: number;
  start: number;
  end: number;
  text: string;
  x: number;
  y: number;
};

type TestResult = {
  score: number;
  total: number;
  timeUsed: number;
  unanswered: number[];
};

const STORAGE_PREFIX = "vocora-reading-practice";
const READING_PARTS: Array<{
  key: ReadingPartId;
  label: string;
  helper: string;
  title: string;
  testId: string;
}> = [
  {
    key: "part1",
    label: "Part 1",
    helper: "Urban resilience",
    title: "Build confidence with a clear academic passage",
    testId: "academic-roof-gardens",
  },
  {
    key: "part2",
    label: "Part 2",
    helper: "Science + design",
    title: "Follow denser ideas and precise evidence",
    testId: "academic-aerofoil",
  },
  {
    key: "part3",
    label: "Part 3",
    helper: "Society + culture",
    title: "Handle the most demanding academic questions",
    testId: "academic-libraries",
  },
];
const HIGHLIGHT_STYLE: Record<HighlightColor, string> = {
  yellow: "bg-[#f4d35e]/55 text-ink",
  green: "bg-brand-300/55 text-ink",
  blue: "bg-accent-300/55 text-ink",
  pink: "bg-brand-300/55 text-ink",
};

const VOCABULARY_HELP: Record<string, { translation: string; definition: string }> = {
  resilience: { translation: "chidamlilik", definition: "the ability to recover or adapt after difficulty" },
  drainage: { translation: "drenaj", definition: "a system for carrying water away" },
  vegetation: { translation: "o'simliklar qoplami", definition: "plants growing in a particular area" },
  turbulence: { translation: "havo oqimi beqarorligi", definition: "violent or irregular movement of air or water" },
  aerofoil: { translation: "aerofoil, qanot profili", definition: "a shaped surface designed to create lift in air or water" },
  airflow: { translation: "havo oqimi", definition: "the movement of air through an area" },
  durability: { translation: "chidamlilik", definition: "the ability to remain useful for a long time" },
  excluded: { translation: "chetlatilgan", definition: "prevented from taking part or having access" },
  privacy: { translation: "maxfiylik", definition: "control over personal information" },
  surveys: { translation: "so'rovnomalar", definition: "sets of questions used to collect information" },
};

function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

export function restoreHighlights(test: ReadingPracticeTest): Highlight[] {
  const key = `${STORAGE_PREFIX}:${test.id}:highlights`;
  const saved = readStore<Highlight[]>(key, []);
  let changed = false;
  const repaired = saved.map((highlight) => {
    const source = test.passages
      .find((passage) => passage.id === highlight.passageId)
      ?.paragraphs[highlight.paragraphIndex]?.text;
    if (!source || source.slice(highlight.start, highlight.end) === highlight.text) return highlight;

    // Earlier versions counted the visible A/B/C paragraph label as one character.
    const legacyStart = highlight.start - 1;
    if (
      legacyStart >= 0 &&
      source.slice(legacyStart, legacyStart + highlight.text.length) === highlight.text
    ) {
      changed = true;
      return {
        ...highlight,
        start: legacyStart,
        end: legacyStart + highlight.text.length,
      };
    }
    return highlight;
  });
  if (changed) writeStore(key, repaired);
  return repaired;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(Math.max(seconds, 0) / 60);
  const remainder = Math.max(seconds, 0) % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

function isCorrect(question: ReadingQuestion, value: AnswerValue | undefined) {
  if (Array.isArray(question.answer)) {
    return Array.isArray(value) && [...value].sort().join("|") === [...question.answer].sort().join("|");
  }
  if (Array.isArray(value)) return false;
  const normalise = (entry: string) => entry.trim().toLocaleLowerCase().replace(/[.]/g, "");
  const accepted = [question.answer, ...(question.acceptedAnswers ?? [])].map(normalise);
  return value ? accepted.includes(normalise(value)) : false;
}

/** The old version applied one hand-made curve to every test: it read band
 *  "6.0-6.5" at 58% for a 40-question Academic paper and for a 10-question
 *  General Training set alike. Academic needs 23/40 for a 6.0 and General
 *  Training is stricter again, so both were flattered. */
function bandGuidance(
  score: number,
  total: number,
  track: ReadingPracticeTest["track"],
  t: Copy
) {
  const { band, approximate } = readingBand(score, total, track);
  const label =
    band >= 8
      ? t.bandExcellent
      : band >= 7
        ? t.bandStrong
        : band >= 6
          ? t.bandGood
          : t.bandBuild;
  const tone =
    band >= 8
      ? "text-success"
      : band >= 7
        ? "text-brand-600 dark:text-brand-300"
        : band >= 6
          ? "text-accent-500"
          : "text-warning";
  // A short set cannot resolve a single band, so show the half-band either side.
  const display = approximate
    ? `${(band - 0.5).toFixed(1)}-${(band + 0.5).toFixed(1)}`
    : band.toFixed(1);
  return { band: display, label, tone, approximate };
}

function countQuestions(test: ReadingPracticeTest) {
  return allReadingQuestions(test).length;
}

type Copy = Dictionary["readingPractice"];

export function ReadingPracticeView({ t }: { t: Copy }) {
  const [screen, setScreen] = useState<Screen>("library");
  const [selectedTestId, setSelectedTestId] = useState(READING_PRACTICE_TESTS[0].id);
  const [selectedQuestionType, setSelectedQuestionType] = useState<ReadingQuestionTypeGuideId>("matching-headings");
  const [studyMode, setStudyMode] = useState<StudyMode>("exam");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestHistory>({});

  const test = getReadingTest(selectedTestId);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHistory(readStore(`${STORAGE_PREFIX}:history`, {}));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const openStart = (testId: string) => {
    setSelectedTestId(testId);
    setResult(null);
    setScreen("start");
  };

  const launchTest = (mode: StudyMode) => {
    const selected = getReadingTest(selectedTestId);
    setStudyMode(mode);
    setAnswers(readStore<Record<string, AnswerValue>>(`${STORAGE_PREFIX}:${selected.id}:answers`, {}));
    setFlagged(readStore<string[]>(`${STORAGE_PREFIX}:${selected.id}:flags`, []));
    setCurrentPassageIndex(0);
    setSecondsLeft(selected.minutes * 60);
    setIsPaused(false);
    setStartedAt(Date.now());
    setResult(null);
    setScreen("test");
  };

  const saveHistory = useCallback(
    (next: TestHistory) => {
      setHistory(next);
      writeStore(`${STORAGE_PREFIX}:history`, next);
    },
    []
  );

  const submitTest = useCallback(() => {
    const selected = getReadingTest(selectedTestId);
    const questions = allReadingQuestions(selected);
    const score = questions.filter((question) => isCorrect(question, answers[question.id])).length;
    const unanswered = questions.filter((question) => !answers[question.id] || (Array.isArray(answers[question.id]) && !answers[question.id].length)).map((question) => question.number);
    const used = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : 0;
    const summary = { score, total: questions.length, timeUsed: studyMode === "exam" ? selected.minutes * 60 - secondsLeft : used, unanswered };
    setResult(summary);
    saveHistory({
      ...history,
      [selected.id]: {
        bestScore: Math.max(history[selected.id]?.bestScore ?? 0, score),
        completed: true,
        lastScore: score,
      },
    });
    setScreen("result");
  }, [answers, history, saveHistory, secondsLeft, selectedTestId, startedAt, studyMode]);

  useEffect(() => {
    if (screen !== "test" || studyMode !== "exam" || isPaused) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          window.setTimeout(submitTest, 0);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPaused, screen, studyMode, submitTest]);

  const resetTest = () => {
    window.localStorage.removeItem(`${STORAGE_PREFIX}:${test.id}:answers`);
    window.localStorage.removeItem(`${STORAGE_PREFIX}:${test.id}:flags`);
    setAnswers({});
    setFlagged([]);
    setResult(null);
    setScreen("start");
  };

  if (screen === "start") {
    return <ReadingStartScreen t={t} test={test} mode={studyMode} onBack={() => setScreen("library")} onStart={launchTest} />;
  }

  if (screen === "question-types") {
    return <ReadingQuestionTypePractice key={selectedQuestionType} typeId={selectedQuestionType} onBack={() => setScreen("library")} />;
  }

  if (screen === "test") {
    return (
      <ReadingWorkspace t={t}
        key={test.id}
        test={test}
        studyMode={studyMode}
        answers={answers}
        flagged={flagged}
        secondsLeft={secondsLeft}
        paused={isPaused}
        passageIndex={currentPassageIndex}
        onAnswer={(questionId, answer) => {
          const next = { ...answers, [questionId]: answer };
          setAnswers(next);
          writeStore(`${STORAGE_PREFIX}:${test.id}:answers`, next);
        }}
        onToggleFlag={(questionId) => {
          const next = flagged.includes(questionId) ? flagged.filter((id) => id !== questionId) : [...flagged, questionId];
          setFlagged(next);
          writeStore(`${STORAGE_PREFIX}:${test.id}:flags`, next);
        }}
        onPassageChange={setCurrentPassageIndex}
        onPause={() => setIsPaused((value) => !value)}
        onEnd={submitTest}
        onExit={() => setScreen("library")}
      />
    );
  }

  if (screen === "result" && result) {
    return (
      <ReadingResultScreen t={t}
        test={test}
        result={result}
        answers={answers}
        onLibrary={() => setScreen("library")}
        onRetry={resetTest}
        onReview={() => setScreen("test")}
        onNext={() => {
          const next = READING_PRACTICE_TESTS.find((candidate) => candidate.id !== test.id) ?? test;
          openStart(next.id);
        }}
      />
    );
  }

  return <ReadingLibrary t={t} history={history} onOpen={openStart} onQuestionType={(typeId) => { setSelectedQuestionType(typeId); setScreen("question-types"); }} />;
}

function ReadingLibrary({ history, onOpen, onQuestionType, t }: { history: TestHistory; onOpen: (id: string) => void; onQuestionType: (typeId: ReadingQuestionTypeGuideId) => void; t: Copy }) {
  const [activePart, setActivePart] = useState<ReadingPartId>("part1");
  const selectedPart = READING_PARTS.find((part) => part.key === activePart) ?? READING_PARTS[0];
  const selectedTest = getReadingTest(selectedPart.testId);
  const generalTraining = getReadingTest("general-training-community");
  const completedFullTests = READING_FULL_TESTS.filter((fullTest) => history[fullTest.id]?.completed).length;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <section className="surface-panel relative overflow-hidden rounded-lg p-6 sm:p-8 lg:p-10">
        <div className="!absolute -right-24 -top-28 size-72 rounded-full bg-brand-400/10 blur-3xl" aria-hidden />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-600/8 px-3 py-1.5 text-xs font-black uppercase text-brand-700 dark:text-brand-200">
              <SearchCheck className="size-4" aria-hidden />
              IELTS Reading practice
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-6xl">{t.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              Realistic original passages, computer-based test controls, and a vocabulary notebook built for Uzbek IELTS learners.
            </p>
          </div>
          <div className="rounded-lg border border-brand-400/20 bg-raised/70 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="type-label text-ink-soft">{t.journey}</p>
                <p className="mt-1 text-3xl font-black text-ink">{completedFullTests}<span className="text-ink-soft">/{READING_FULL_TESTS.length}</span></p>
              </div>
              <span className="icon-tile size-12 text-accent-500"><LibraryBig className="size-5" /></span>
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-soft">Choose a single passage to build skill, then complete one of ten full tests under exam conditions.</p>
          </div>
        </div>
      </section>

      <nav
        className="sticky top-25 z-20 mt-5 rounded-full border border-line bg-raised/88 p-1 shadow-sm backdrop-blur-md"
        aria-label={t.academicParts}
      >
        <div className="grid grid-cols-3 gap-1">
          {READING_PARTS.map((part) => (
            <button
              key={part.key}
              type="button"
              onClick={() => setActivePart(part.key)}
              aria-pressed={activePart === part.key}
              className={cn(
                "rounded-full px-3 py-2 text-center transition-all",
                activePart === part.key
                  ? "bg-primary text-white shadow-[0_10px_24px_rgba(12,46,20,0.22)] dark:text-brand-950"
                  : "text-ink-soft hover:bg-hover hover:text-ink"
              )}
            >
              <span className="block text-sm font-black">{part.label}</span>
              <span className="hidden text-[10px] font-bold opacity-80 sm:block">{part.helper}</span>
            </button>
          ))}
        </div>
      </nav>

      <section className="mt-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="type-label text-accent-500">Academic Reading · {selectedPart.label}</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{selectedPart.title}</h2>
          </div>
          <span className="hidden text-sm font-semibold text-ink-soft sm:block">
            {t.passageOfTotal.replace("{index}", String(READING_PARTS.findIndex((part) => part.key === activePart) + 1)).replace("{total}", "3")}
          </span>
        </div>
        <TestCard t={t} test={selectedTest} history={history[selectedTest.id]} featured onOpen={onOpen} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="type-label text-brand-600 dark:text-brand-300">{t.fullMock}</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{t.fullMockBody}</h2>
          </div>
          <span className="hidden text-sm font-semibold text-ink-soft sm:block">{t.fullMockMeta}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {READING_FULL_TESTS.map((fullTest, index) => (
            <TestCard t={t}
              key={fullTest.id}
              test={fullTest}
              history={history[fullTest.id]}
              featured={index === 0}
              onOpen={onOpen}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 max-w-2xl">
          <p className="type-label text-accent-500">{t.targeted}</p>
          <h2 className="mt-1 text-2xl font-black text-ink">{t.targetedBody}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">Choose a format, follow its strategy, then get instant evidence-based feedback after every answer.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {READING_QUESTION_TYPE_GUIDES.map((guide) => {
            const questionCount = getQuestionsForReadingQuestionType(guide.id).length;
            return (
              <article key={guide.id} className="rounded-lg border border-line bg-card/80 p-5 shadow-[3px_4px_0_rgba(84,37,15,0.1)] transition-all hover:-translate-y-0.5 hover:border-brand-400/55 hover:bg-raised hover:shadow-[5px_6px_0_rgba(84,37,15,0.16)]">
                <div className="flex items-start justify-between gap-3"><span className="icon-tile size-10 text-brand-600 dark:text-brand-300"><Target className="size-4" /></span><span className="rounded-full bg-brand-600/8 px-2.5 py-1 text-[11px] font-black text-brand-700 dark:text-brand-200">{questionCount} questions</span></div>
                <h3 className="mt-5 text-xl font-black leading-tight text-ink">{guide.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{guide.description}</p>
                <p className="mt-4 border-l-2 border-accent-400 pl-3 text-xs font-bold leading-5 text-ink-soft">{guide.strategy[0]}</p>
                <button type="button" onClick={() => onQuestionType(guide.id)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover dark:text-brand-950">Practice this type <ChevronRight className="size-4" /></button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 max-w-2xl">
          <p className="type-label text-brand-600 dark:text-brand-300">{t.generalTraining}</p>
          <h2 className="mt-1 text-2xl font-black text-ink">{t.generalTrainingBody}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{t.generalTrainingMeta}</p>
        </div>
        <TestCard t={t} test={generalTraining} history={history[generalTraining.id]} onOpen={onOpen} />
      </section>
    </main>
  );
}

function TestCard({ test, history, featured = false, onOpen, t }: { test: ReadingPracticeTest; history?: TestHistory[string]; featured?: boolean; onOpen: (id: string) => void; t: Copy }) {
  const questions = countQuestions(test);
  const percentage = history?.completed && questions ? Math.round(((history.lastScore ?? 0) / questions) * 100) : 0;
  return (
    <article className={cn("group rounded-lg border border-line bg-card/80 p-5 shadow-[3px_4px_0_rgba(84,37,15,0.1)] transition-all hover:-translate-y-0.5 hover:border-brand-400/55 hover:bg-raised hover:shadow-[5px_6px_0_rgba(84,37,15,0.16)]", featured && "bg-[linear-gradient(135deg,#24130c,#54250f)] text-white dark:bg-[linear-gradient(135deg,#382015,#24130c)]" )}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-black uppercase", featured ? "bg-white/12 text-brand-100" : "bg-brand-600/8 text-brand-700 dark:text-brand-200")}>{test.track}</span>
        {history?.completed && <span className={cn("inline-flex items-center gap-1 text-xs font-bold", featured ? "text-brand-100" : "text-success")}><CheckCircle2 className="size-4" /> Completed</span>}
      </div>
      <h3 className={cn("mt-5 text-xl font-black leading-tight", !featured && "text-ink")}>{test.title}</h3>
      <p className={cn("mt-2 text-sm leading-6", featured ? "text-brand-100/85" : "text-ink-soft")}>{test.description}</p>
      <div className={cn("mt-5 grid grid-cols-3 gap-2 border-y py-4 text-center", featured ? "border-white/12" : "border-line")}>
        <Meta label={t.questionsLabel} value={String(questions)} inverse={featured} />
        <Meta label="Time" value={`${test.minutes}m`} inverse={featured} />
        <Meta label={t.level} value={test.level} inverse={featured} />
      </div>
      {history?.completed && <div className={cn("mt-4 flex items-center justify-between text-sm", featured ? "text-brand-100" : "text-ink-soft")}><span>{t.bestScore}</span><span className="font-black">{history.bestScore}/{questions} · {percentage}%</span></div>}
      <button type="button" onClick={() => onOpen(test.id)} className={cn("mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition-all", featured ? "bg-white text-brand-900 hover:bg-brand-50" : "bg-primary text-white hover:bg-primary-hover dark:text-brand-950")}>
        {history?.completed ? t.tryAgain : t.openPractice}<ChevronRight className="size-4" />
      </button>
    </article>
  );
}

function Meta({ label, value, inverse }: { label: string; value: string; inverse: boolean }) {
  return <div><p className={cn("text-sm font-black", !inverse && "text-ink")}>{value}</p><p className={cn("mt-0.5 text-[10px] font-bold uppercase", inverse ? "text-brand-100/70" : "text-ink-soft")}>{label}</p></div>;
}

function ReadingStartScreen({ test, mode, onBack, onStart, t }: { test: ReadingPracticeTest; mode: StudyMode; onBack: () => void; onStart: (mode: StudyMode) => void; t: Copy }) {
  const [selectedMode, setSelectedMode] = useState<StudyMode>(mode);
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-7 sm:px-6 sm:py-12">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card/70 px-3 py-2 text-sm font-bold text-ink-soft transition-colors hover:text-ink"><ArrowLeft className="size-4" /> {t.readingLibrary}</button>
      <section className="surface-panel mt-5 overflow-hidden rounded-lg p-6 sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-400/10 px-3 py-1.5 text-xs font-black uppercase text-accent-500"><FileText className="size-4" /> {test.track}</span>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-6xl">{test.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">{test.description}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <StartStat icon={LibraryBig} title={t.passageCount.replace("{count}", String(test.passages.length))} text={test.passages.map((passage) => passage.title).join(" · ")} />
          <StartStat icon={SearchCheck} title={t.questionsCount.replace("{count}", String(countQuestions(test)))} text={t.questionsMeta} />
          <StartStat icon={Clock3} title={t.minutesCount.replace("{count}", String(test.minutes))} text={t.timeLimit} />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <ModeCard active={selectedMode === "exam"} onClick={() => setSelectedMode("exam")} title={t.examMode} text={t.examModeBody} icon={Clock3} />
          <ModeCard active={selectedMode === "practice"} onClick={() => setSelectedMode("practice")} title={t.practiceMode} text={t.practiceModeBody} icon={NotebookPen} />
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-ink-soft"><strong className="text-ink">{t.tipLabel}</strong> {t.startTip}</p>
          <Button onClick={() => onStart(selectedMode)} className="shrink-0"><Play className="size-4" /> {t.startTest}</Button>
        </div>
      </section>
    </main>
  );
}

function StartStat({ icon: Icon, title, text }: { icon: typeof Clock3; title: string; text: string }) {
  return <div className="rounded-lg border border-line bg-card/70 p-4"><Icon className="size-5 text-brand-600 dark:text-brand-300" /><p className="mt-4 font-black text-ink">{title}</p><p className="mt-1 text-xs leading-5 text-ink-soft">{text}</p></div>;
}

function ModeCard({ active, onClick, title, text, icon: Icon }: { active: boolean; onClick: () => void; title: string; text: string; icon: typeof Clock3 }) {
  return <button type="button" onClick={onClick} className={cn("rounded-lg border p-5 text-left transition-all", active ? "border-brand-400 bg-brand-600/8 shadow-[3px_4px_0_rgba(84,37,15,0.14)]" : "border-line bg-card/60 hover:bg-hover")}><span className={cn("icon-tile size-10", active ? "text-brand-600 dark:text-brand-300" : "text-ink-soft")}><Icon className="size-4" /></span><p className="mt-4 font-black text-ink">{title}</p><p className="mt-1 text-sm leading-6 text-ink-soft">{text}</p></button>;
}

function ReadingWorkspace({ test, studyMode, answers, flagged, secondsLeft, paused, passageIndex, onAnswer, onToggleFlag, onPassageChange, onPause, onEnd, onExit, t }: {
  test: ReadingPracticeTest;
  studyMode: StudyMode;
  answers: Record<string, AnswerValue>;
  flagged: string[];
  secondsLeft: number;
  paused: boolean;
  passageIndex: number;
  onAnswer: (questionId: string, value: AnswerValue) => void;
  onToggleFlag: (questionId: string) => void;
  onPassageChange: (index: number) => void;
  onPause: () => void;
  onEnd: () => void;
  onExit: () => void; t: Copy }) {
  const [panelRatio, setPanelRatio] = useState(52);
  const [fontSize, setFontSize] = useState(16);
  // Share of the phone workspace given to the question sheet. 0 collapses it to
  // its handle so the passage fills the screen; the reader drags to rebalance.
  const [sheetRatio, setSheetRatio] = useState(46);
  const [draggingSheet, setDraggingSheet] = useState(false);
  const sheetMovedRef = useRef(false);
  const [visitedQuestionId, setVisitedQuestionId] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [highlights, setHighlights] = useState<Highlight[]>(() => restoreHighlights(test));
  const [notes, setNotes] = useState<PassageNote[]>(() => readStore(`${STORAGE_PREFIX}:${test.id}:notes`, []));
  const [vocabulary, setVocabulary] = useState<SavedVocabulary[]>(() => readStore(`${STORAGE_PREFIX}:${test.id}:vocabulary`, []));
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);
  const [wordLookup, setWordLookup] = useState<Record<string, WordLookupEntry>>({});
  const [tappedWord, setTappedWord] = useState<{ word: string; entry: WordLookupEntry } | null>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const currentPassage = test.passages[passageIndex];
  const currentQuestions = currentPassage.questions;
  const answeredCount = Object.values(answers).filter((answer) => Array.isArray(answer) ? answer.length : Boolean(answer)).length;
  const sheetOpen = sheetRatio > 6;
  // The navigator marks where the learner last jumped to, falling back to the
  // opening question of the passage they are on.
  const activeQuestionId = currentQuestions.some((question) => question.id === visitedQuestionId)
    ? visitedQuestionId
    : currentQuestions[0]?.id;

  // Tap-to-translate: look up every distinct word in the passage once, so a
  // tap on any of them resolves instantly from the client-side map instead of
  // firing a request per tap. Words already resolved from an earlier passage
  // in this test are kept rather than re-fetched. Deliberately reads
  // wordLookup without depending on it: this must run once per passage, not
  // loop every time the lookup map it just wrote to changes.
  useEffect(() => {
    const words = new Set<string>();
    for (const paragraph of currentPassage.paragraphs) {
      for (const match of paragraph.text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) {
        words.add(match[0].toLowerCase());
      }
    }
    const unresolved = Array.from(words).filter((word) => !(word in wordLookup));
    if (unresolved.length === 0) return;
    let cancelled = false;
    lookupWords(unresolved).then((entries) => {
      if (cancelled) return;
      setWordLookup((current) => ({ ...current, ...entries }));
    });
    return () => { cancelled = true; };
  }, [currentPassage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWordTap = (word: string) => {
    if (window.getSelection()?.toString()) return; // part of a drag-selection, not a tap
    const entry = wordLookup[word.toLowerCase()];
    if (!entry) return;
    // Centered on the viewport rather than anchored to the tapped word: a
    // fixed-width popover anchored to text near the screen edge (common —
    // passages fill the width) clips off-screen instead of just covering
    // more of the passage.
    setTappedWord({ word, entry });
  };

  const persistHighlights = (next: Highlight[]) => { setHighlights(next); writeStore(`${STORAGE_PREFIX}:${test.id}:highlights`, next); };
  const persistNotes = (next: PassageNote[]) => { setNotes(next); writeStore(`${STORAGE_PREFIX}:${test.id}:notes`, next); };
  const persistVocabulary = (next: SavedVocabulary[]) => { setVocabulary(next); writeStore(`${STORAGE_PREFIX}:${test.id}:vocabulary`, next); };

  const addHighlight = (color: HighlightColor) => {
    if (!selectedRange) return;
    const withoutOverlap = highlights.filter((highlight) => highlight.passageId !== selectedRange.passageId || highlight.paragraphIndex !== selectedRange.paragraphIndex || highlight.end <= selectedRange.start || highlight.start >= selectedRange.end);
    persistHighlights([...withoutOverlap, { id: crypto.randomUUID(), ...selectedRange, color }]);
    window.getSelection()?.removeAllRanges();
    setSelectedRange(null);
  };

  const removeHighlight = () => {
    if (!selectedRange) return;
    persistHighlights(highlights.filter((highlight) => highlight.passageId !== selectedRange.passageId || highlight.paragraphIndex !== selectedRange.paragraphIndex || highlight.end <= selectedRange.start || highlight.start >= selectedRange.end));
    window.getSelection()?.removeAllRanges();
    setSelectedRange(null);
  };

  const openNote = () => {
    if (!selectedRange) return;
    setNoteDraft("");
    setDrawer("notes");
  };

  const saveSelectedWord = () => {
    if (!selectedRange) return;
    const word = selectedRange.text.trim();
    const lookup = VOCABULARY_HELP[word.toLocaleLowerCase()] ?? { translation: t.translationPlaceholder, definition: t.definitionHint };
    const entry: SavedVocabulary = {
      id: crypto.randomUUID(), word, translation: lookup.translation, definition: lookup.definition,
      example: currentPassage.paragraphs[selectedRange.paragraphIndex]?.text ?? "", passageTitle: currentPassage.title,
      note: "", color: "blue", favourite: false, learned: false,
    };
    persistVocabulary([entry, ...vocabulary.filter((item) => item.word.toLocaleLowerCase() !== word.toLocaleLowerCase())]);
    setDrawer("vocabulary");
    window.getSelection()?.removeAllRanges();
    setSelectedRange(null);
  };

  // Sits in front of the question-nav effect below: entering a screen (e.g.
  // library -> confirm -> test) resets this, so that effect's first firing
  // in the new screen skips its scrollIntoView instead of treating the
  // screen's initial activeQuestionId as a navigation.
  const hasNavigatedRef = useRef(false);

  // Switching screens is a client-side state change, not a navigation, so the
  // browser never resets scroll on its own. Without this, starting a test
  // from a scrolled-down confirm screen leaves the new screen scrolled too —
  // its own top chrome renders hidden behind the sticky site header.
  // `screen` (this component's local state) shadows the DOM global of the
  // same name; exhaustive-deps resolves the identifier to the global and
  // flags it as an invalid outer-scope dependency, but the local state is
  // exactly what this effect needs to depend on.
  useEffect(() => {
    window.scrollTo(0, 0);
    hasNavigatedRef.current = false;
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // The phone workspace owns the whole screen so the passage and the question
  // sheet can share one viewport. Letting the page scroll underneath it would
  // drag the test out from under the reader's thumb.
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 639px)");
    const apply = () => { document.body.style.overflow = phone.matches ? "hidden" : ""; };
    apply();
    phone.addEventListener("change", apply);
    return () => { phone.removeEventListener("change", apply); document.body.style.overflow = ""; };
  }, []);

  // Keep the number strip showing where the learner is; with forty questions
  // the active one is otherwise scrolled off the end of the rail. Skipped
  // right after entering a screen: `block: "nearest"` scrolls the whole
  // page, not just the strip, when the strip itself isn't yet in the
  // viewport — which dragged the page down and out from under the sticky
  // toolbar before the learner had navigated anywhere.
  useEffect(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      return;
    }
    navRef.current?.querySelector(`[data-question-nav="${activeQuestionId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeQuestionId]);

  const navigateQuestion = (question: ReadingQuestion) => {
    const nextPassageIndex = test.passages.findIndex((passage) => passage.questions.some((item) => item.id === question.id));
    if (nextPassageIndex !== -1) onPassageChange(nextPassageIndex);
    setVisitedQuestionId(question.id);
    setSheetRatio((ratio) => (ratio > 6 ? ratio : 46));
    window.setTimeout(() => questionRefs.current[question.id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  /** The phone grabber is both a drag handle and a toggle: drag to rebalance the
   *  split, tap (or press it with a keyboard) to hide or restore the sheet. */
  const dragSheet = (event: React.PointerEvent<HTMLButtonElement>) => {
    const container = event.currentTarget.parentElement;
    if (!container) return;
    const startY = event.clientY;
    sheetMovedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (moveEvent: PointerEvent) => {
      if (!sheetMovedRef.current && Math.abs(moveEvent.clientY - startY) <= 6) return;
      if (!sheetMovedRef.current) setDraggingSheet(true);
      sheetMovedRef.current = true;
      const bounds = container.getBoundingClientRect();
      setSheetRatio(Math.min(84, Math.max(0, ((bounds.bottom - moveEvent.clientY) / bounds.height) * 100)));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      setDraggingSheet(false);
      // Snap out of the awkward slivers at either end of the drag.
      if (sheetMovedRef.current) setSheetRatio((ratio) => (ratio < 12 ? 0 : ratio > 78 ? 84 : ratio));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  const toggleSheet = () => {
    if (sheetMovedRef.current) { sheetMovedRef.current = false; return; }
    setSheetRatio((ratio) => (ratio > 6 ? 0 : 46));
  };

  const dragDivider = (event: React.PointerEvent<HTMLButtonElement>) => {
    const container = event.currentTarget.parentElement;
    if (!container) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const update = (clientX: number) => {
      const bounds = container.getBoundingClientRect();
      const ratio = ((clientX - bounds.left) / bounds.width) * 100;
      setPanelRatio(Math.min(68, Math.max(32, ratio)));
    };
    update(event.clientX);
    const move = (moveEvent: PointerEvent) => update(moveEvent.clientX);
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  return (
    <main className="reading-workspace mx-auto w-full max-w-375 flex-1 px-3 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-5 lg:pb-5">
      <section className="flex flex-col overflow-hidden max-sm:fixed max-sm:inset-0 max-sm:z-40 max-sm:pt-[env(safe-area-inset-top)] sm:rounded-lg sm:border sm:border-line sm:bg-page sm:shadow-[5px_7px_0_rgba(84,37,15,0.14),0_20px_44px_rgba(84,37,15,0.08)] max-sm:bg-page">
        <header className="z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-line bg-raised/96 px-4 py-3 backdrop-blur max-sm:gap-2 max-sm:py-2 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button type="button" onClick={onExit} aria-label={t.exitTest} title={t.exitTest} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-bold text-ink-soft hover:bg-hover hover:text-ink max-sm:size-11 max-sm:justify-center max-sm:px-0"><ArrowLeft className="size-4" /> <span className="max-sm:hidden">{t.readingLibrary}</span></button>
            <div className="min-w-0"><p className="truncate text-sm font-black text-ink">{test.title}</p><p className="truncate text-xs text-ink-soft">{t.passageProgress.replace("{index}", String(passageIndex + 1)).replace("{total}", String(test.passages.length)).replace("{done}", String(answeredCount)).replace("{questions}", String(countQuestions(test)))}</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {studyMode === "exam" ? <span className={cn("inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 font-black tabular-nums max-sm:px-2 max-sm:text-sm", secondsLeft < 120 ? "border-danger/30 bg-danger/10 text-danger" : "border-brand-400/25 bg-brand-600/8 text-brand-700 dark:text-brand-200")}><Clock3 className="size-4" />{formatTime(secondsLeft)}</span> : <span className="hidden min-h-11 rounded-lg bg-brand-600/8 px-3 py-2 text-xs font-black text-brand-700 dark:text-brand-200 sm:inline-flex">{t.practiceMode}</span>}
            {studyMode === "exam" && <button type="button" onClick={onPause} aria-label={paused ? t.resume : t.pause} title={paused ? t.resume : t.pause} className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-ink-soft hover:bg-hover hover:text-ink">{paused ? <Play className="size-4" /> : <Pause className="size-4" />}</button>}
            <button type="button" onClick={() => setConfirmEnd(true)} aria-label={t.submitAnswers} title={t.submitAnswers} className="inline-flex size-11 items-center justify-center rounded-lg bg-primary text-white dark:text-brand-950 sm:hidden"><Send className="size-4" /></button>
            <Button size="sm" variant="secondary" onClick={() => setConfirmEnd(true)} className="hidden sm:inline-flex"><Send className="size-4" /> {t.submitAnswers}</Button>
          </div>
        </header>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-card/55 px-4 py-2 text-xs font-semibold text-ink-soft max-sm:px-3 max-sm:py-0.5 sm:px-5">
          <div className="flex items-center gap-1"><button type="button" className="inline-flex size-11 items-center justify-center rounded-md hover:bg-hover" onClick={() => setFontSize((size) => Math.max(14, size - 1))} aria-label={t.smallerText} title={t.smallerText}><Minimize2 className="size-3.5" /></button><span className="min-w-9 text-center">{fontSize}px</span><button type="button" className="inline-flex size-11 items-center justify-center rounded-md hover:bg-hover" onClick={() => setFontSize((size) => Math.min(21, size + 1))} aria-label={t.largerText} title={t.largerText}><Maximize2 className="size-3.5" /></button></div>
          <div className="flex items-center gap-1.5"><button type="button" onClick={() => setDrawer("notes")} title={t.myNotes} className="inline-flex size-11 items-center justify-center gap-1.5 rounded-md hover:bg-hover"><NotebookPen className="size-3.5" /> <span className="sr-only">{t.myNotes}</span> <span aria-hidden>{notes.length}</span></button><button type="button" onClick={() => setDrawer("vocabulary")} title={t.myVocabulary} className="inline-flex size-11 items-center justify-center gap-1.5 rounded-md hover:bg-hover"><Bookmark className="size-3.5" /> <span className="sr-only">{t.myVocabulary}</span> <span aria-hidden>{vocabulary.length}</span></button><button type="button" onClick={() => setClearConfirm(true)} title={t.clearHighlights} aria-label={t.clearHighlights} className="inline-flex size-11 items-center justify-center gap-1.5 rounded-md text-ink-soft hover:bg-hover hover:text-danger"><Eraser className="size-3.5" /></button></div>
        </div>

        <div className="hidden items-center gap-2 overflow-x-auto border-b border-line bg-card/45 px-4 py-2 sm:flex">
          {test.passages.map((passage, index) => <button key={passage.id} type="button" onClick={() => onPassageChange(index)} className={cn("min-h-11 shrink-0 rounded-full border px-3 py-1.5 text-xs font-black transition-colors", passageIndex === index ? "border-brand-400 bg-brand-600/10 text-brand-700 dark:text-brand-200" : "border-line text-ink-soft hover:bg-hover")}>{t.passage} {index + 1}: {passage.title}</button>)}
        </div>

        {/* On a phone the two panes stack into one screen: the passage takes the
            room the question sheet leaves it, so a learner can read and answer
            without ever scrolling one of them out of reach. */}
        <div
          className="flex min-h-0 flex-1 flex-col sm:grid sm:min-h-[calc(100svh-12.5rem)] sm:grid-cols-[minmax(0,var(--reading-passage-width))_12px_minmax(0,1fr)]"
          style={{ "--reading-passage-width": `${panelRatio}%`, "--reading-sheet-height": `${sheetRatio}%` } as React.CSSProperties}
        >
          <article className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-page p-4 sm:max-h-[calc(100vh-12.5rem)] sm:p-7" onMouseUp={(event) => captureTextSelection(event, setSelectedRange)} onKeyUp={(event) => captureTextSelection(event, setSelectedRange)}>
            <p className="type-label text-brand-600 dark:text-brand-300 max-sm:hidden">{t.readingPassage}</p>
            <h1 className="text-lg font-black tracking-tight text-ink sm:mt-2 sm:text-3xl">{currentPassage.title}</h1>
            <p className="mt-1 text-sm italic text-ink-soft sm:mt-2">{currentPassage.subtitle}</p>
            <div className="mt-4 space-y-5 sm:mt-7" style={{ fontSize: `${fontSize}px` }}>
              {currentPassage.paragraphs.map((paragraph, index) => <PassageParagraph key={`${currentPassage.id}-${paragraph.label}`} passageId={currentPassage.id} paragraph={paragraph} paragraphIndex={index} highlights={highlights} wordLookup={wordLookup} onWordTap={handleWordTap} />)}
            </div>
          </article>
          <button type="button" aria-label={t.resizePanels} onPointerDown={dragDivider} className="hidden cursor-col-resize bg-line/70 transition-colors hover:bg-brand-400 sm:block" />

          <button
            type="button"
            onPointerDown={dragSheet}
            onClick={toggleSheet}
            aria-expanded={sheetOpen}
            aria-controls="reading-question-sheet"
            aria-label={sheetOpen ? t.hideQuestions : t.showQuestions}
            title={sheetOpen ? t.hideQuestions : t.showQuestions}
            className="flex shrink-0 touch-none cursor-row-resize items-center justify-center border-t border-line bg-raised py-2.5 active:bg-hover sm:hidden"
          >
            <span aria-hidden className={cn("h-1 w-10 rounded-full transition-colors", draggingSheet ? "bg-brand-400" : "bg-line")} />
          </button>

          <aside
            id="reading-question-sheet"
            className={cn(
              "min-w-0 overflow-y-auto bg-card/62 p-4 sm:max-h-[calc(100vh-12.5rem)] sm:p-5",
              "max-sm:h-[var(--reading-sheet-height)] max-sm:shrink-0",
              !draggingSheet && "max-sm:transition-[height] max-sm:duration-200",
              !sheetOpen && "max-sm:overflow-hidden max-sm:p-0"
            )}
          >
            <div className="mb-3 max-sm:hidden sm:mb-5"><p className="type-label text-brand-600 dark:text-brand-300">{t.questionsHeading.replace("{from}", String(currentQuestions[0]?.number ?? "")).replace("{to}", String(currentQuestions.at(-1)?.number ?? ""))}</p><p className="mt-1 text-sm leading-6 text-ink-soft max-sm:hidden">{t.questionsHint}</p></div>
            <div className="space-y-3 pb-6 sm:pb-24">
              {currentQuestions.map((question, index) => <QuestionCard t={t} key={question.id} question={question} answer={answers[question.id]} flagged={flagged.includes(question.id)} setRef={(node) => { questionRefs.current[question.id] = node; }} showGroup={index === 0 || currentQuestions[index - 1].group !== question.group} onAnswer={(answer) => onAnswer(question.id, answer)} onFlag={() => onToggleFlag(question.id)} />)}
            </div>
          </aside>
        </div>

        <nav className="reading-question-nav z-20 shrink-0 border-t border-line bg-raised/96 px-3 py-3 backdrop-blur max-sm:py-2 max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:sticky sm:bottom-0 sm:px-5" aria-label={t.questionNavigation}>
          <div ref={navRef} className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto pb-1 max-sm:pb-0"><span className="sticky left-0 z-10 shrink-0 bg-raised pr-1 text-xs font-black text-ink-soft">{t.answeredShort.replace("{done}", String(answeredCount)).replace("{questions}", String(countQuestions(test)))}</span>{allReadingQuestions(test).map((question) => { const value = answers[question.id]; const answered = Array.isArray(value) ? value.length > 0 : Boolean(value); return <button key={question.id} type="button" data-question-nav={question.id} onClick={() => navigateQuestion(question)} className={cn("relative flex size-11 shrink-0 items-center justify-center rounded-md border text-xs font-black transition-colors", question.id === activeQuestionId ? "border-brand-400 bg-brand-600/10 text-brand-700 dark:text-brand-200" : answered ? "border-success/35 bg-success/10 text-success" : "border-line text-ink-soft hover:bg-hover", flagged.includes(question.id) && "after:absolute after:-right-0.5 after:-top-0.5 after:size-2 after:rounded-full after:bg-accent-400")}>{question.number}</button>; })}</div>
        </nav>
      </section>

      {selectedRange && <SelectionToolbar t={t} range={selectedRange} onHighlight={addHighlight} onRemove={removeHighlight} onNote={openNote} onSaveWord={saveSelectedWord} onClose={() => { window.getSelection()?.removeAllRanges(); setSelectedRange(null); }} />}
      {tappedWord && (
        <WordTranslationPopover
          t={t}
          tapped={tappedWord}
          onSave={() => {
            const entry = tappedWord.entry;
            persistVocabulary([
              ...vocabulary,
              {
                id: crypto.randomUUID(), word: entry.headword,
                translation: [entry.translation_uz, entry.translation_ru].filter(Boolean).join(" / ") || t.translationPlaceholder,
                definition: entry.definition_en ?? entry.pos, example: "", passageTitle: currentPassage.title,
                note: "", color: "blue", favourite: false, learned: false,
              },
            ]);
            setTappedWord(null);
          }}
          onClose={() => setTappedWord(null)}
        />
      )}
      {drawer && <ReadingDrawer t={t} drawer={drawer} notes={notes} vocabulary={vocabulary} selectedRange={selectedRange} noteDraft={noteDraft} setNoteDraft={setNoteDraft} onClose={() => { setDrawer(null); setSelectedRange(null); }} onSaveNote={() => { if (!selectedRange || !noteDraft.trim()) return; persistNotes([{ id: crypto.randomUUID(), quote: selectedRange.text, body: noteDraft.trim() }, ...notes]); setNoteDraft(""); setSelectedRange(null); }} onDeleteNote={(id) => persistNotes(notes.filter((note) => note.id !== id))} onUpdateVocabulary={(id, patch) => persistVocabulary(vocabulary.map((word) => word.id === id ? { ...word, ...patch } : word))} onDeleteVocabulary={(id) => persistVocabulary(vocabulary.filter((word) => word.id !== id))} />}
      {confirmEnd && <ConfirmDialog t={t} title={t.submitConfirm} text={t.submitConfirmBody.replace("{answered}", String(answeredCount)).replace("{total}", String(countQuestions(test)))} action={t.submitAnswers} onCancel={() => setConfirmEnd(false)} onConfirm={() => { setConfirmEnd(false); onEnd(); }} />}
      {clearConfirm && <ConfirmDialog t={t} title={t.clearHighlightsConfirm} text="This removes all colour highlights from this passage set. Your notes and saved vocabulary will stay." action={t.clearHighlights} destructive onCancel={() => setClearConfirm(false)} onConfirm={() => { persistHighlights([]); setClearConfirm(false); }} />}
    </main>
  );
}

function PassageParagraph({ passageId, paragraph, paragraphIndex, highlights, wordLookup, onWordTap }: { passageId: string; paragraph: ReadingParagraph; paragraphIndex: number; highlights: Highlight[]; wordLookup: Record<string, WordLookupEntry>; onWordTap: (word: string) => void }) {
  const matches = highlights.filter((highlight) => highlight.passageId === passageId && highlight.paragraphIndex === paragraphIndex).sort((a, b) => a.start - b.start);
  const fragments: Array<{ text: string; color?: HighlightColor }> = [];
  let cursor = 0;
  matches.forEach((highlight) => { if (highlight.start > cursor) fragments.push({ text: paragraph.text.slice(cursor, highlight.start) }); fragments.push({ text: paragraph.text.slice(Math.max(cursor, highlight.start), highlight.end), color: highlight.color }); cursor = Math.max(cursor, highlight.end); });
  if (cursor < paragraph.text.length) fragments.push({ text: paragraph.text.slice(cursor) });
  return <p data-reading-passage={passageId} data-reading-paragraph={paragraphIndex} className="relative pl-9 leading-[1.68] text-ink sm:leading-[1.86]"><span aria-hidden="true" className="absolute left-0 top-1.5 flex size-6 items-center justify-center rounded-md bg-brand-600/10 text-xs font-black text-brand-700 dark:text-brand-200">{paragraph.label}</span><span data-reading-paragraph-text>{fragments.map((fragment, index) => {
    const words = renderTappableWords(fragment.text, wordLookup, onWordTap, `${paragraphIndex}-${index}`);
    return fragment.color ? <mark key={`${fragment.text}-${index}`} className={cn("rounded-sm px-0.5", HIGHLIGHT_STYLE[fragment.color])}>{words}</mark> : <span key={`${fragment.text}-${index}`}>{words}</span>;
  })}</span></p>;
}

// Splits a text run on word boundaries so each real word can carry its own
// tap handler, while non-word characters (spaces, punctuation) pass through
// unchanged — the combined text content stays byte-identical to `text`,
// which is what keeps the character-offset highlight/selection math correct.
function renderTappableWords(text: string, wordLookup: Record<string, WordLookupEntry>, onWordTap: (word: string) => void, keyPrefix: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let i = 0;
  for (const match of text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) {
    const word = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    const translatable = word.toLowerCase() in wordLookup;
    parts.push(
      <span
        key={`${keyPrefix}-${i++}`}
        onClick={translatable ? () => onWordTap(word) : undefined}
        className={translatable ? "cursor-pointer rounded-sm decoration-brand-400/50 decoration-dotted underline-offset-4 hover:bg-brand-600/10 hover:underline" : undefined}
      >
        {word}
      </span>
    );
    lastIndex = start + word.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function WordTranslationPopover({ tapped, onSave, onClose, t }: { tapped: { word: string; entry: WordLookupEntry }; onSave: () => void; onClose: () => void; t: Copy }) {
  useEffect(() => {
    const dismiss = () => onClose();
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => { window.removeEventListener("scroll", dismiss, true); window.removeEventListener("resize", dismiss); };
  }, [onClose]);
  const { entry } = tapped;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      {/* Centered on the viewport rather than anchored to the tapped word:
          passages fill the width, so a word-anchored popover routinely
          clipped off the screen edge. */}
      <div
        role="dialog"
        aria-label={entry.headword}
        className="fixed left-1/2 top-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-raised p-3 shadow-[3px_4px_0_rgba(84,37,15,0.2),0_16px_36px_rgba(84,37,15,0.16)]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-black text-ink">{entry.headword}</p>
            <p className="text-[11px] font-bold uppercase text-ink-soft">{entry.pos}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.exitTest} className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-hover"><X className="size-3.5" /></button>
        </div>
        {entry.translation_uz && <p className="mt-2 text-sm font-bold text-brand-600 dark:text-brand-300">{entry.translation_uz}</p>}
        {entry.translation_ru && <p className="text-xs text-ink-soft">{entry.translation_ru}</p>}
        {entry.definition_en && <p className="mt-1.5 text-xs leading-5 text-ink-soft">{entry.definition_en}</p>}
        <button type="button" onClick={onSave} className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md bg-brand-600/8 text-xs font-black text-brand-700 dark:text-brand-200 hover:bg-brand-600/15">
          <BookmarkCheck className="size-3.5" /> {t.saveWord}
        </button>
      </div>
    </>
  );
}

function captureTextSelection(event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, setSelectedRange: (range: SelectedRange | null) => void) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return setSelectedRange(null);
  const range = selection.getRangeAt(0);
  const root = event.currentTarget;
  const startElement = elementForNode(range.startContainer);
  const endElement = elementForNode(range.endContainer);
  const paragraph = startElement?.closest<HTMLElement>("[data-reading-paragraph]");
  const textRoot = paragraph?.querySelector<HTMLElement>("[data-reading-paragraph-text]");
  if (!paragraph || paragraph !== endElement?.closest("[data-reading-paragraph]") || !textRoot || !root.contains(paragraph) || !textRoot.contains(startElement) || !textRoot.contains(endElement)) return setSelectedRange(null);
  const measure = document.createRange();
  measure.selectNodeContents(textRoot);
  try {
    measure.setEnd(range.startContainer, range.startOffset);
  } catch { return setSelectedRange(null); }
  const start = measure.toString().length;
  const text = selection.toString().replace(/\s+/g, " ").trim();
  const end = start + text.length;
  if (!text) return setSelectedRange(null);
  const rect = range.getBoundingClientRect();
  setSelectedRange({ passageId: paragraph.dataset.readingPassage ?? "", paragraphIndex: Number(paragraph.dataset.readingParagraph), start, end, text, x: rect.left + rect.width / 2, y: rect.top - 8 });
}

function elementForNode(node: Node) { return node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement; }

function QuestionCard({ question, answer, flagged, setRef, showGroup, onAnswer, onFlag, t }: { question: ReadingQuestion; answer: AnswerValue | undefined; flagged: boolean; setRef: (node: HTMLDivElement | null) => void; showGroup: boolean; onAnswer: (value: AnswerValue) => void; onFlag: () => void; t: Copy }) {
  return <div ref={setRef} className="scroll-mt-4">{showGroup && <p className="mb-2 mt-5 text-xs font-black uppercase tracking-wide text-accent-500 first:mt-0 max-sm:mt-3">{question.group}</p>}<section className="rounded-lg border border-line bg-raised/78 p-4 shadow-[2px_3px_0_rgba(84,37,15,0.08)] max-sm:p-3"><div className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-600/10 text-xs font-black text-brand-700 dark:text-brand-200">{question.number}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold leading-6 text-ink">{question.prompt}</p>{question.instruction && <p className="mt-1 text-xs font-bold uppercase tracking-wide text-ink-soft">{question.instruction}</p>}</div><button type="button" onClick={onFlag} title={t.markForReview} className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-md", flagged ? "bg-accent-400/15 text-accent-500" : "text-ink-soft hover:bg-hover")}><Flag className={cn("size-4", flagged && "fill-current")} /></button></div><div className="mt-4 max-sm:mt-3"><QuestionInput t={t} question={question} value={answer} onChange={onAnswer} /></div></section></div>;
}

function QuestionInput({ question, value, onChange, t }: { question: ReadingQuestion; value: AnswerValue | undefined; onChange: (value: AnswerValue) => void; t: Copy }) {
  const isText = ["sentence-completion", "summary-completion", "table-completion", "form-completion", "diagram-labelling", "short-answer"].includes(question.kind);
  if (isText) return <input value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} placeholder={t.typeAnswer} className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand-400 focus:ring-2 focus:ring-focus/20" />;
  if (question.kind === "matching-headings" || question.kind === "matching-information" || question.kind === "matching-features") return <select value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-lg border border-line bg-card px-3 text-sm font-semibold text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-focus/20"><option value="">{t.chooseAnswer}</option>{question.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  if (question.kind === "multiple-answer") { const current = Array.isArray(value) ? value : []; return <div className="space-y-2">{question.options?.map((option) => <label key={option.value} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors", current.includes(option.value) ? "border-brand-400 bg-brand-600/8 text-ink" : "border-line text-ink-soft hover:bg-hover")}><input type="checkbox" checked={current.includes(option.value)} onChange={() => onChange(current.includes(option.value) ? current.filter((item) => item !== option.value) : [...current, option.value])} className="mt-0.5 size-4 accent-brand-600" /><span><strong>{option.value}.</strong> {option.label.replace(/^[A-Z]\.\s*/, "")}</span></label>)}</div>; }
  return <div className="space-y-2">{question.options?.map((option) => <label key={option.value} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors", value === option.value ? "border-brand-400 bg-brand-600/8 text-ink" : "border-line text-ink-soft hover:bg-hover")}><input type="radio" name={question.id} checked={value === option.value} onChange={() => onChange(option.value)} className="mt-0.5 size-4 accent-brand-600" /><span>{option.label}</span></label>)}</div>;
}

function SelectionToolbar({ range, onHighlight, onRemove, onNote, onSaveWord, onClose, t }: { range: SelectedRange; onHighlight: (color: HighlightColor) => void; onRemove: () => void; onNote: () => void; onSaveWord: () => void; onClose: () => void; t: Copy }) {
  return (
    <div
      role="toolbar"
      aria-label={t.annotationTools}
      className="reading-selection-toolbar fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 grid grid-cols-4 items-center justify-center gap-1.5 rounded-lg border border-line bg-raised p-2 shadow-[5px_7px_0_rgba(84,37,15,0.22),0_16px_36px_rgba(84,37,15,0.16)] sm:inset-x-auto sm:bottom-auto sm:flex sm:max-w-[calc(100vw-1rem)] sm:-translate-x-1/2 sm:justify-start sm:gap-1 sm:p-1.5 sm:left-[var(--selection-x)] sm:top-[var(--selection-y)]"
      style={{ "--selection-x": `${range.x}px`, "--selection-y": `${Math.max(8, range.y - 46)}px` } as React.CSSProperties}
    >
      <span className="hidden max-w-24 truncate px-1 text-xs font-bold text-ink-soft sm:block">{range.text}</span>
      {(["yellow", "green", "blue", "pink"] as HighlightColor[]).map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onHighlight(color)}
          className={cn("size-11 rounded-md border border-transparent transition-transform hover:scale-105", HIGHLIGHT_STYLE[color])}
          title={t.highlight.replace("{color}", color)}
        >
          <Highlighter className="mx-auto size-4" />
        </button>
      ))}
      <button type="button" onClick={onRemove} className="inline-flex size-11 items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-danger" title={t.removeHighlight}>
        <Eraser className="size-4" />
      </button>
      <button type="button" onClick={onNote} className="inline-flex size-11 items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-ink" title={t.addNote}>
        <NotebookPen className="size-4" />
      </button>
      <button type="button" onClick={onSaveWord} className="inline-flex size-11 items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-brand-600" title={t.saveWord}>
        <Bookmark className="size-4" />
      </button>
      <button type="button" onClick={onClose} className="inline-flex size-11 items-center justify-center rounded-md text-ink-soft hover:bg-hover" title={t.close}>
        <X className="size-4" />
      </button>
    </div>
  );
}

function ReadingDrawer({ drawer, notes, vocabulary, selectedRange, noteDraft, setNoteDraft, onClose, onSaveNote, onDeleteNote, onUpdateVocabulary, onDeleteVocabulary, t }: { drawer: Drawer; notes: PassageNote[]; vocabulary: SavedVocabulary[]; selectedRange: SelectedRange | null; noteDraft: string; setNoteDraft: (text: string) => void; onClose: () => void; onSaveNote: () => void; onDeleteNote: (id: string) => void; onUpdateVocabulary: (id: string, patch: Partial<SavedVocabulary>) => void; onDeleteVocabulary: (id: string) => void; t: Copy }) {
  const isNotes = drawer === "notes";
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-drawer-title"
        className="absolute inset-x-0 bottom-0 top-0 flex w-full flex-col border-line bg-raised shadow-[-20px_0_60px_rgba(15,35,31,0.24)] sm:left-auto sm:max-w-md sm:border-l"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:py-4">
          <div>
            <p className="type-label text-brand-600 dark:text-brand-300">{isNotes ? t.myNotes : t.myVocabulary}</p>
            <h2 id="reading-drawer-title" className="mt-1 text-xl font-black text-ink">
              {isNotes ? t.notesCount.replace("{count}", String(notes.length)) : t.savedWordsCount.replace("{count}", String(vocabulary.length))}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t.closeNotes}
            onClick={onClose}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-5">
          {isNotes ? (
            <>
              {selectedRange && (
                <div className="rounded-lg border border-brand-400/25 bg-brand-600/8 p-4">
                  <p className="text-sm font-bold italic leading-6 text-ink">“{selectedRange.text}”</p>
                  <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder={t.notePlaceholder} className="mt-3 min-h-28 w-full rounded-lg border border-line bg-card p-3 text-sm text-ink outline-none focus:border-brand-400" />
                  <Button size="sm" onClick={onSaveNote} className="mt-3"><Save className="size-4" /> Save note</Button>
                </div>
              )}
              {notes.length ? <div className="mt-4 space-y-3">{notes.map((note) => <article key={note.id} className="rounded-lg border border-line bg-card/70 p-4"><p className="text-sm font-bold italic text-ink">“{note.quote}”</p><p className="mt-2 text-sm leading-6 text-ink-soft">{note.body}</p><button type="button" onClick={() => onDeleteNote(note.id)} className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-xs font-black text-danger"><Trash2 className="size-3.5" /> Delete</button></article>)}</div> : <EmptyDrawer icon={NotebookPen} title={t.notesEmpty} text={t.notesHint} />}
            </>
          ) : vocabulary.length ? (
            <div className="space-y-3">{vocabulary.map((word) => <article key={word.id} className="rounded-lg border border-line bg-card/70 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black text-ink">{word.word}</p><p className="mt-1 text-sm font-bold text-brand-600 dark:text-brand-300">{word.translation}</p></div><button type="button" onClick={() => onUpdateVocabulary(word.id, { favourite: !word.favourite })} className={cn("inline-flex size-8 items-center justify-center rounded-md", word.favourite ? "text-accent-500" : "text-ink-soft hover:bg-hover")}><BookmarkCheck className={cn("size-4", word.favourite && "fill-current")} /></button></div><p className="mt-3 text-sm leading-6 text-ink-soft">{word.definition}</p><p className="mt-3 text-xs italic leading-5 text-ink-soft">{word.example}</p><p className="mt-2 text-[11px] font-bold uppercase text-ink-soft">{word.passageTitle}</p><textarea value={word.note} onChange={(event) => onUpdateVocabulary(word.id, { note: event.target.value })} placeholder={t.personalNote} className="mt-3 min-h-18 w-full rounded-md border border-line bg-raised p-2 text-xs text-ink outline-none focus:border-brand-400" /><div className="mt-3 flex items-center justify-between"><button type="button" onClick={() => onUpdateVocabulary(word.id, { learned: !word.learned })} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-black", word.learned ? "bg-success/10 text-success" : "bg-brand-600/8 text-brand-700 dark:text-brand-200")}><CheckCircle2 className="size-3.5" />{word.learned ? t.learned : t.markLearned}</button><button type="button" onClick={() => onDeleteVocabulary(word.id)} className="inline-flex size-9 items-center justify-center text-danger"><Trash2 className="size-3.5" /></button></div></article>)}</div>
          ) : <EmptyDrawer icon={Bookmark} title={t.vocabularyEmpty} text={t.vocabularyHint} />}
        </div>
        <div className="shrink-0 border-t border-line bg-raised px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:hidden">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            <X className="size-4" /> Close
          </Button>
        </div>
      </aside>
    </div>
  );
}

function EmptyDrawer({ icon: Icon, title, text }: { icon: typeof Bookmark; title: string; text: string }) { return <div className="flex min-h-72 flex-col items-center justify-center text-center"><span className="icon-tile size-12 text-brand-600 dark:text-brand-300"><Icon className="size-5" /></span><h3 className="mt-4 font-black text-ink">{title}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-ink-soft">{text}</p></div>; }

function ConfirmDialog({ title, text, action, destructive, onCancel, onConfirm, t }: { title: string; text: string; action: string; destructive?: boolean; onCancel: () => void; onConfirm: () => void; t: Copy }) { return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-lg border border-line bg-raised p-6 shadow-[0_22px_70px_rgba(15,35,31,0.30)]"><h2 id="confirm-title" className="text-xl font-black text-ink">{title}</h2><p className="mt-3 text-sm leading-6 text-ink-soft">{text}</p><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onCancel}>{t.keepWorking}</Button><Button variant={destructive ? "danger" : "primary"} onClick={onConfirm}>{action}</Button></div></section></div>; }

function ReadingResultScreen({ test, result, answers, onLibrary, onRetry, onReview, onNext, t }: { test: ReadingPracticeTest; result: TestResult; answers: Record<string, AnswerValue>; onLibrary: () => void; onRetry: () => void; onReview: () => void; onNext: () => void; t: Copy }) {
  const questions = allReadingQuestions(test);
  const band = bandGuidance(result.score, result.total, test.track, t);
  return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-10"><button type="button" onClick={onLibrary} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card/70 px-3 py-2 text-sm font-bold text-ink-soft hover:text-ink"><ArrowLeft className="size-4" /> {t.readingLibrary}</button><section className="surface-panel mt-5 overflow-hidden rounded-lg p-6 sm:p-9"><div className="grid gap-7 lg:grid-cols-[1fr_0.8fr] lg:items-center"><div><span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-black uppercase text-success"><CheckCircle2 className="size-4" /> {t.testComplete}</span><h1 className="mt-4 text-4xl font-black tracking-tight text-ink sm:text-5xl">{result.score} / {result.total}</h1><p className="mt-2 text-xl font-black text-ink">{t.estimatedBand}{" "}<span className={band.tone}>{band.band}</span></p>{band.approximate && <p className="mt-1 text-xs leading-5 text-ink-soft">{t.bandApproximate}</p>}<p className="mt-2 text-sm leading-6 text-ink-soft">{band.label}. {t.timeUsed.replace("{time}", formatTime(result.timeUsed))} {result.unanswered.length ? t.unanswered.replace("{list}", result.unanswered.join(", ")) : t.allAnswered}</p></div><div className="rounded-lg border border-brand-400/25 bg-brand-600/8 p-5"><p className="type-label text-brand-700 dark:text-brand-200">{t.whatNext}</p><p className="mt-2 text-sm leading-7 text-ink">{t.whatNextBody}</p><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" onClick={onReview}><SearchCheck className="size-4" /> {t.reviewMistakes}</Button><Button size="sm" variant="secondary" onClick={onRetry}><RotateCcw className="size-4" /> {t.retryTest}</Button></div></div></div></section><section className="mt-7"><div className="mb-4"><p className="type-label text-accent-500">{t.answerReview}</p><h2 className="mt-1 text-2xl font-black text-ink">{t.evidenceTrail}</h2></div><div className="space-y-3">{questions.map((question) => { const correct = isCorrect(question, answers[question.id]); const userAnswer = answers[question.id]; const shownAnswer = Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer || t.noAnswer; const answer = Array.isArray(question.answer) ? question.answer.join(", ") : question.answer; return <article key={question.id} className={cn("rounded-lg border p-5", correct ? "border-success/25 bg-success/5" : "border-danger/20 bg-card")}><div className="flex items-start gap-3"><span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-black", correct ? "bg-success/15 text-success" : "bg-danger/10 text-danger")}>{correct ? <CheckCircle2 className="size-4" /> : question.number}</span><div className="min-w-0 flex-1"><p className="font-black text-ink">{question.prompt}</p><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p className="text-ink-soft">{t.yourAnswer}{" "}<strong className={correct ? "text-success" : "text-danger"}>{shownAnswer}</strong></p><p className="text-ink-soft">{t.correctAnswer}{" "}<strong className="text-success">{answer}</strong></p></div><p className="mt-3 text-sm leading-6 text-ink-soft">{question.explanation}</p><p className="mt-3 rounded-md bg-brand-600/6 px-3 py-2 text-sm italic leading-6 text-ink">{t.evidence}: “{question.evidence}”</p></div></div></article>; })}</div></section><div className="mt-7 flex flex-wrap gap-3"><Button onClick={onRetry}><RotateCcw className="size-4" /> {t.retryTest}</Button><Button variant="secondary" onClick={onReview}><SearchCheck className="size-4" /> {t.reviewMistakes}</Button><Button variant="secondary" onClick={onNext}>{t.nextPassage}{" "}<ArrowRight className="size-4" /></Button></div></main>;
}
