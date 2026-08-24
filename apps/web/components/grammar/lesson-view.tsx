"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  Highlighter,
  Layers3,
  Lightbulb,
  ListChecks,
  PanelsTopLeft,
  Quote,
  ScanText,
  Sparkles,
  Target,
  Timer,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import {
  ALL_LESSONS,
  masteryStatus,
  recordGrammarAttempt,
  type GrammarExercise,
  type GrammarLesson,
} from "@/lib/grammar";
import { cn } from "@/lib/utils";
import { submitGrammarAttempt } from "@/lib/grammar/progress-sync";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type T = Dictionary["grammar"];

const LEVEL_CONTEXT: Record<GrammarLesson["level"], string> = {
  A1: "Foundation",
  A2: "Control",
  B1: "Fluency",
  B2: "Precision",
  IELTS: "Band 7+",
  C1: "Advanced control",
};

function normaliseAnswer(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
}

function isCorrectAnswer(answer: string, exercise: GrammarExercise): boolean {
  return normaliseAnswer(answer) === normaliseAnswer(exercise.correctAnswer);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compactTerms(lesson: GrammarLesson): string[] {
  const formulaTerms =
    lesson.formula
      ?.split(/[·+(),:?]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 2) ?? [];
  const titleTerms = lesson.title
    .split(/\s+/)
    .map((part) => part.replace(/[^\w/'-]/g, ""))
    .filter((part) => part.length > 3);
  const terms = [
    ...(lesson.highlights ?? []),
    ...formulaTerms,
    ...titleTerms,
    lesson.title,
    lesson.titleUz,
  ];
  const unique = new Map<string, string>();
  for (const term of terms.map((item) => item.trim()).filter((item) => item.length > 2)) {
    const key = term.toLowerCase();
    if (!unique.has(key)) unique.set(key, term);
  }
  return [...unique.values()].sort((a, b) => b.length - a.length).slice(0, 18);
}

function highlightText(text: string, terms: string[]): ReactNode {
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return text.split(pattern).map((part, index) => {
    const matched = terms.some((term) => term.toLowerCase() === part.toLowerCase());
    if (!matched) return <span key={index}>{part}</span>;
    return (
      <mark
        key={index}
        className="rounded-md bg-accent-400/20 px-1 py-0.5 font-extrabold text-ink ring-1 ring-accent-400/25"
      >
        {part}
      </mark>
    );
  });
}

function keyPointsFor(lesson: GrammarLesson) {
  if (lesson.keyPoints?.length) return lesson.keyPoints;
  return [
    {
      title: "Qachon ishlatiladi",
      body:
        lesson.explanation[0] ??
        "Bu mavzu ingliz tilida gapning ma'nosini aniqroq va tabiiyroq qilish uchun ishlatiladi.",
    },
    {
      title: "Asosiy formula",
      body: lesson.formula
        ? `${lesson.formula}. Avval shu shaklni avtomatik qiling, keyin misollarda ishlating.`
        : "Avval gapdagi ega, yordamchi fe'l va asosiy fe'l o'rnini toping.",
    },
    {
      title: "O'zbek speaker alert",
      body:
        lesson.mistakes[0]?.note ??
        "O'zbekchadan so'zma-so'z tarjima qilmang; inglizcha word order va yordamchi fe'lni tekshiring.",
    },
  ];
}

function importantNotesFor(lesson: GrammarLesson): string[] {
  if (lesson.importantNotes?.length) return lesson.importantNotes;
  const notes = lesson.mistakes.map((mistake) => mistake.note);
  return [
    lesson.formula
      ? `Formula yodlash uchun emas, gapni tekshirish uchun: ${lesson.formula}`
      : "Har bir gapda subject + verb tartibini tekshiring.",
    ...notes.slice(0, 2),
  ];
}

function examTipsFor(lesson: GrammarLesson): string[] {
  if (lesson.examTips?.length) return lesson.examTips;
  if (lesson.level === "IELTS" || lesson.level === "C1") {
    return [
      "Writingda bu strukturani bir paragrafda 1-2 marta ishlatish kifoya; juda ko'p ishlatish sun'iy ko'rinadi.",
      "Speakingda avval sodda gap bilan fikrni ayting, keyin shu grammar orqali aniqlik yoki kontrast qo'shing.",
    ];
  }
  return [
    "Avval 5 ta o'z gap tuzing, keyin misollardagi so'zlarni almashtirib qayta yozing.",
    "Quizdan oldin common mistakes blokini o'qing; xatolarning ko'pi aynan o'sha joydan chiqadi.",
  ];
}

function solvedPatternExamples(lesson: GrammarLesson): string[] {
  const existing = new Set(lesson.examples.map((example) => example.en.toLowerCase()));
  const solved = lesson.quiz
    .filter((item) => item.q.includes("___"))
    .map((item) => item.q.replace("___", item.options[item.answer]).trim())
    .filter((sentence) => !existing.has(sentence.toLowerCase()));
  return [...new Set(solved)].slice(0, 4);
}

/** One lesson: explanation -> formula -> examples -> common mistakes -> quiz.
 * Passing the quiz (all answered, 60%+) marks the lesson complete. */
export function LessonView({
  lang,
  lesson,
  t,
}: {
  lang: string;
  lesson: GrammarLesson;
  t: T;
}) {
  const { user } = useAuth();
  const exercises = useMemo(() => lesson.exercises ?? [], [lesson.exercises]);
  const [answers, setAnswers] = useState<string[]>(() => new Array(exercises.length).fill(""));
  const [checked, setChecked] = useState(false);
  const [exerciseStep, setExerciseStep] = useState(0);

  const correct = useMemo(
    () => exercises.filter((item, i) => isCorrectAnswer(answers[i], item)).length,
    [answers, exercises]
  );
  const score = exercises.length ? Math.round((correct / exercises.length) * 100) : 0;
  const status = masteryStatus(checked ? score : null);
  const passed = checked && score >= 70;

  const index = ALL_LESSONS.findIndex((l) => l.slug === lesson.slug);
  const next = ALL_LESSONS[index + 1];
  const terms = useMemo(() => compactTerms(lesson), [lesson]);
  const keyPoints = useMemo(() => keyPointsFor(lesson), [lesson]);
  const importantNotes = useMemo(() => importantNotesFor(lesson), [lesson]);
  const examTips = useMemo(() => examTipsFor(lesson), [lesson]);
  const patternExamples = useMemo(() => solvedPatternExamples(lesson), [lesson]);
  const pathLessons = useMemo(() => [...(lesson.prerequisites ?? []), ...(lesson.relatedLessons ?? [])]
    .map((slug) => ALL_LESSONS.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is GrammarLesson => Boolean(candidate)), [lesson.prerequisites, lesson.relatedLessons]);

  function check() {
    setChecked(true);
    recordGrammarAttempt(lesson.slug, correct, exercises.length);
    if (user) {
      void submitGrammarAttempt(user.id, lesson.slug, score).catch(() => {
        // The local result is retained and merged on the next successful sync.
      });
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href={`/${lang}/grammar`}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-2 text-sm font-bold text-ink-soft transition-all hover:-translate-y-0.5 hover:bg-raised hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t.title}
        </Link>
        <span className="rounded-lg border border-line bg-card/60 px-3 py-1.5 text-xs font-extrabold uppercase text-ink-soft">
          {lesson.level} · {LEVEL_CONTEXT[lesson.level]}
        </span>
      </div>

      <section className="surface-panel light-sweep rounded-lg p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.75fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500">
              <BookOpenCheck className="size-4" aria-hidden />
              {t.lessonEyebrow}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {lesson.title}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-ink-soft">{lesson.titleUz}</p>
            {lesson.introduction && <p className="mt-4 max-w-2xl text-base leading-7 text-ink">{lesson.introduction}</p>}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft"><Timer className="size-4" aria-hidden />{lesson.estimatedMinutes ?? 15} min · {lesson.category}</p>
          </div>
          {lesson.formula && (
            <div className="premium-card rounded-lg p-5">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-ink-soft">
                <Sparkles className="size-4 text-accent-500" aria-hidden />
                {t.formula}
              </p>
              <p className="mt-3 font-mono text-sm font-extrabold leading-6 text-brand-600 dark:text-brand-300">
                {lesson.formula}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="surface-panel rounded-lg p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
              <Highlighter className="size-4 text-accent-500" aria-hidden />
              {t.keyTerms}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {terms.slice(0, 10).map((term) => (
                <span
                  key={term}
                  className="rounded-lg border border-accent-400/25 bg-accent-400/10 px-2.5 py-1 text-xs font-extrabold text-accent-600 dark:text-accent-300"
                >
                  {term}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            {lesson.explanation.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-lg border border-line bg-card/60 p-4 text-[15px] leading-8 text-ink shadow-sm backdrop-blur"
              >
                {highlightText(para, terms)}
              </motion.p>
            ))}
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {keyPoints.map((point, i) => (
              <div key={point.title} className="premium-card rounded-lg p-4">
                <span className="icon-tile size-10 rounded-lg text-brand-500">
                  {i === 0 ? (
                    <Target className="size-4" aria-hidden />
                  ) : i === 1 ? (
                    <ListChecks className="size-4" aria-hidden />
                  ) : (
                    <Lightbulb className="size-4" aria-hidden />
                  )}
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-ink">{point.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{highlightText(point.body, terms)}</p>
              </div>
            ))}
          </section>

          <LessonPatternLab t={t} lesson={lesson} terms={terms} examples={patternExamples} />
          <LessonForms lesson={lesson} terms={terms} />
          <LessonExamples lesson={lesson} terms={terms} t={t} />
          <LessonComparisons lesson={lesson} terms={terms} />
          <LessonMistakes lesson={lesson} terms={terms} t={t} />
          <LessonExercises
            lang={lang}
            exercises={exercises}
            answers={answers}
            checked={checked}
            step={exerciseStep}
            setStep={setExerciseStep}
            setAnswers={setAnswers}
            t={t}
          />

          {!checked ? (
            <Button
              fullWidth
              className="mt-1"
              disabled={answers.some((answer) => answer.trim() === "")}
              onClick={check}
            >
              {t.check}
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-panel mt-4 rounded-lg p-6 text-center"
            >
              <span
                className={cn(
                  "icon-tile mx-auto size-14 rounded-lg",
                  passed ? "text-success" : "text-warning"
                )}
              >
                {passed ? <BadgeCheck className="size-7" aria-hidden /> : <Target className="size-7" aria-hidden />}
              </span>
              <p className="mt-3 text-2xl font-extrabold text-ink">
                {correct}/{exercises.length} · {score}%
              </p>
              <p className="mt-1 text-sm font-bold text-ink-soft">{status.replaceAll("-", " ")}</p>
              <p className="mt-1 text-sm text-ink-soft">{passed ? t.passed : t.tryAgainHint}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {!passed && (
                  <Button
                    onClick={() => {
                      setChecked(false);
                      setAnswers(new Array(exercises.length).fill(""));
                      setExerciseStep(0);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {t.retry}
                  </Button>
                )}
                {passed && next && (
                  <Link href={`/${lang}/grammar/${next.slug}`}>
                    <Button>
                      {t.nextLesson}: {next.title}
                      <ArrowRight className="ml-2 size-4" aria-hidden />
                    </Button>
                  </Link>
                )}
                <Link href={`/${lang}/grammar`}>
                  <Button variant="secondary">{t.backToList}</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="surface-panel rounded-lg p-4">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
              <AlertTriangle className="size-4 text-warning" aria-hidden />
              {t.importantNotes}
            </h2>
            <div className="mt-3 space-y-2">
              {importantNotes.map((note, i) => (
                <p key={i} className="rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm leading-6 text-ink">
                  {highlightText(note, terms)}
                </p>
              ))}
            </div>
          </section>

          <section className="surface-panel rounded-lg p-4">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
              <Sparkles className="size-4 text-accent-500" aria-hidden />
              {t.ieltsFocus}
            </h2>
            <div className="mt-3 space-y-2">
              {examTips.map((tip, i) => (
                <p key={i} className="rounded-lg border border-line bg-card/60 p-3 text-sm leading-6 text-ink-soft">
                  {highlightText(tip, terms)}
                </p>
              ))}
            </div>
          </section>

          {pathLessons.length > 0 && <section className="surface-panel rounded-lg p-4">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink"><Layers3 className="size-4 text-brand-500" aria-hidden />Learning path</h2>
            <div className="mt-3 space-y-2">{pathLessons.map((pathLesson) => <Link key={pathLesson.slug} href={`/${lang}/grammar/${pathLesson.slug}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-line bg-card/60 px-3 py-2 text-sm font-bold text-ink transition hover:bg-raised"><span className="min-w-0 line-clamp-2">{pathLesson.title}</span><ArrowRight className="size-4 shrink-0 text-ink-soft" aria-hidden /></Link>)}</div>
          </section>}
        </aside>
      </div>
    </main>
  );
}

function LessonPatternLab({
  lesson,
  terms,
  examples,
  t,
}: {
  lesson: GrammarLesson;
  terms: string[];
  examples: string[];
  t: T;
}) {
  return (
    <section className="surface-panel rounded-lg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-accent-500">
            <ScanText className="size-4" aria-hidden />
            {t.deepLab}
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-ink">
            {t.deepLabBody}
          </h2>
        </div>
        <span className="rounded-lg border border-line bg-card/60 px-3 py-1.5 text-xs font-bold text-ink-soft">
          {t.modelSentences.replace("{count}", String(lesson.examples.length + examples.length))}
        </span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-lg border border-line bg-card/60 p-4">
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-ink">
            <PanelsTopLeft className="size-4 text-brand-500" aria-hidden />
            {t.patternExamples}
          </h3>
          <div className="mt-3 space-y-2">
            {examples.length > 0 ? (
              examples.map((sentence, index) => (
                <div
                  key={sentence}
                  className="flex gap-3 rounded-lg border border-line/70 bg-raised/50 px-3 py-2.5"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-600/10 text-[11px] font-black text-brand-500">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-ink">
                    {highlightText(sentence, terms)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-ink-soft">
                Formulani saqlagan holda ega, vaqt va kontekstni almashtirib yangi gaplar
                tuzing.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-accent-400/20 bg-accent-400/5 p-4">
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-ink">
            <Target className="size-4 text-accent-500" aria-hidden />
            {t.productionLadder}
          </h3>
          <ol className="mt-3 space-y-2">
            {[
              t.ladder1,
              t.ladder2,
              t.ladder3,
              t.ladder4,
            ].map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-ink-soft">
                <span className="font-black text-accent-500">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function LessonExamples({ lesson, terms, t }: { lesson: GrammarLesson; terms: string[]; t: T }) {
  return (
    <section className="surface-panel rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
        <Quote className="size-4 text-accent-500" aria-hidden />
        {t.examples}
      </h2>
      <div className="mt-3 grid gap-2">
        {lesson.examples.map((ex, i) => (
          <div key={i} className="rounded-lg border border-line bg-card/60 px-4 py-3">
            <p className="text-[15px] font-bold leading-7 text-ink">{highlightText(ex.en, terms)}</p>
            {/* English readers get no translation row — rendering an English
                sentence twice would say nothing. */}
            {ex.uz && (
              <p className="mt-1 text-sm leading-6 text-ink-soft">{highlightText(ex.uz, terms)}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function LessonForms({ lesson, terms }: { lesson: GrammarLesson; terms: string[] }) {
  if (!lesson.forms?.length) return null;
  return (
    <section className="surface-panel rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink"><PanelsTopLeft className="size-4 text-brand-500" aria-hidden />Forms</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {lesson.forms.map((form) => <div key={`${form.label}-${form.example}`} className="min-w-0 rounded-lg border border-line bg-card/60 p-4"><p className="text-xs font-extrabold uppercase text-accent-500">{form.label}</p><p className="mt-2 break-words font-mono text-xs font-bold leading-5 text-brand-600 dark:text-brand-300">{form.formula}</p><p className="mt-2 text-sm font-semibold leading-6 text-ink">{highlightText(form.example, terms)}</p></div>)}
      </div>
    </section>
  );
}

function LessonComparisons({ lesson, terms }: { lesson: GrammarLesson; terms: string[] }) {
  if (!lesson.comparisons?.length) return null;
  return (
    <section className="surface-panel rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink"><ScanText className="size-4 text-accent-500" aria-hidden />Compare</h2>
      <div className="mt-3 space-y-3">{lesson.comparisons.map((comparison) => <div key={comparison.title} className="rounded-lg border border-line bg-card/60 p-4"><h3 className="font-extrabold text-ink">{comparison.title}</h3><div className="mt-3 grid gap-2 sm:grid-cols-2"><p className="rounded-lg border border-success/20 bg-success/5 p-3 text-sm font-semibold leading-6 text-ink">{highlightText(comparison.left, terms)}</p><p className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm font-semibold leading-6 text-ink">{highlightText(comparison.right, terms)}</p></div><p className="mt-3 text-sm leading-6 text-ink-soft">{comparison.explanation}</p></div>)}</div>
    </section>
  );
}

function LessonMistakes({ lesson, terms, t }: { lesson: GrammarLesson; terms: string[]; t: T }) {
  return (
    <section className="surface-panel rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
        <AlertTriangle className="size-4 text-warning" aria-hidden />
        {t.mistakes}
      </h2>
      <div className="mt-3 space-y-2">
        {lesson.mistakes.map((m, i) => (
          <div key={i} className="rounded-lg border border-line bg-card/60 px-4 py-3">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-danger line-through decoration-danger/60">
                <XCircle className="size-4" aria-hidden />
                {m.wrong}
              </span>
              <ArrowRight className="size-4 text-ink-soft" aria-hidden />
              <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                <CheckCircle2 className="size-4" aria-hidden />
                {m.right}
              </span>
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{highlightText(m.note, terms)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LessonExercises({
  lang,
  exercises,
  answers,
  checked,
  step,
  setStep,
  setAnswers,
  t,
}: {
  lang: string;
  exercises: GrammarExercise[];
  answers: string[];
  checked: boolean;
  step: number;
  setStep: (step: number) => void;
  setAnswers: (updater: (prev: string[]) => string[]) => void;
  t: T;
}) {
  const labels = lang === "ru"
    ? { "multiple-choice": "Выбор", "fill-blank": "Пропуск", "error-correction": "Исправление", "sentence-builder": "Конструктор", rewrite: "Перефразирование", "context-choice": "Контекст", answer: "Правильный ответ", placeholder: "Введите ответ...", clear: "Очистить", previous: "Назад", next: "Далее" }
    : lang === "en"
      ? { "multiple-choice": "Multiple choice", "fill-blank": "Fill the blank", "error-correction": "Correction", "sentence-builder": "Sentence builder", rewrite: "Rewrite", "context-choice": "Context", answer: "Correct answer", placeholder: "Type your answer...", clear: "Clear", previous: "Previous", next: "Next" }
      : { "multiple-choice": "Variant tanlash", "fill-blank": "Bo‘sh joy", "error-correction": "Xatoni tuzatish", "sentence-builder": "Gap tuzish", rewrite: "Qayta yozish", "context-choice": "Kontekst", answer: "To‘g‘ri javob", placeholder: "Javobni yozing...", clear: "Tozalash", previous: "Oldingi", next: "Keyingi" };
  return (
    <section className="surface-panel rounded-lg p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
        <ListChecks className="size-4 text-accent-500" aria-hidden />
        {t.quiz}
      </h2>
      <div className="mt-3 space-y-3">
        {exercises.filter((_, qi) => qi === step).map((item, qiOffset) => {
          const qi = step + qiOffset;
          const chosen = answers[qi];
          const correct = isCorrectAnswer(chosen, item);
          const hasOptions = item.options?.length;
          return (
            <div key={item.id} className={cn("rounded-lg border bg-card/60 p-4", checked && correct ? "border-success/40" : checked ? "border-danger/40" : "border-line")}>
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-md border border-line bg-raised/70 px-2 py-1 text-[11px] font-extrabold uppercase text-ink-soft">{labels[item.type]}</span><span className="text-xs font-bold text-ink-soft">{qi + 1}/{exercises.length}</span></div>
              {item.context && <p className="mt-3 rounded-lg bg-brand-600/5 p-3 text-sm leading-6 text-ink-soft">{item.context}</p>}
              <p className="mt-3 font-semibold leading-7 text-ink">{item.prompt}</p>
              {hasOptions ? <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {item.options!.map((option, optionIndex) => {
                  const isAnswer = checked && normaliseAnswer(option) === normaliseAnswer(item.correctAnswer);
                  const isWrongChoice = checked && normaliseAnswer(chosen) === normaliseAnswer(option) && !isAnswer;
                  return (
                    <button
                      key={`${option}-${optionIndex}`}
                      type="button"
                      disabled={checked}
                      onClick={() => setAnswers((prev) => prev.map((answer, index) => index === qi ? option : answer))}
                      className={cn(
                        "min-h-12 rounded-lg border px-3 py-2 text-left text-sm font-semibold leading-6 transition active:translate-y-px",
                        isAnswer && "border-success bg-success/10 text-success",
                        isWrongChoice && "border-danger bg-danger/10 text-danger",
                        !checked && chosen === option && "border-brand-500 bg-brand-600/10 text-ink",
                        !checked && chosen !== option && "border-line text-ink hover:bg-line/40",
                        checked && !isAnswer && !isWrongChoice && "border-line text-ink-soft"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div> : item.type === "sentence-builder" && item.words?.length ? <div className="mt-3"><div className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-line bg-raised/50 p-3 text-sm font-semibold text-ink">{chosen || labels.placeholder}</div><div className="mt-2 flex flex-wrap gap-2">{item.words.map((word, index) => <button key={`${word}-${index}`} type="button" disabled={checked} onClick={() => setAnswers((prev) => prev.map((answer, answerIndex) => answerIndex === qi ? `${answer}${answer ? " " : ""}${word}` : answer))} className="min-h-11 rounded-lg border border-line bg-card px-3 text-sm font-bold text-ink active:translate-y-px">{word}</button>)}<button type="button" disabled={checked} onClick={() => setAnswers((prev) => prev.map((answer, answerIndex) => answerIndex === qi ? "" : answer))} className="min-h-11 rounded-lg px-3 text-sm font-bold text-danger">{labels.clear}</button></div></div> : <input value={chosen} disabled={checked} onChange={(event) => setAnswers((prev) => prev.map((answer, index) => index === qi ? event.target.value : answer))} placeholder={labels.placeholder} autoCapitalize="sentences" autoComplete="off" spellCheck={false} className="mt-3 min-h-12 w-full rounded-lg border border-line bg-raised/70 px-3 text-base text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />}
              {checked && <div className={cn("mt-3 rounded-lg border p-3 text-sm leading-6", correct ? "border-success/25 bg-success/5" : "border-danger/25 bg-danger/5")}><p className="font-extrabold text-ink">{correct ? "✓" : "✕"} {labels.answer}: {item.correctAnswer}</p><p className="mt-1 text-ink-soft">{item.explanation}</p></div>}
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep(Math.max(0, step - 1))}
          className="min-h-12 rounded-lg border border-line bg-card px-4 text-sm font-extrabold text-ink transition enabled:hover:bg-raised disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="mr-2 inline size-4" aria-hidden />
          {labels.previous}
        </button>
        <button
          type="button"
          disabled={step >= exercises.length - 1 || answers[step]?.trim() === ""}
          onClick={() => setStep(Math.min(exercises.length - 1, step + 1))}
          className="min-h-12 rounded-lg border border-brand-500 bg-brand-600 px-4 text-sm font-extrabold text-white transition enabled:hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labels.next}
          <ArrowRight className="ml-2 inline size-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
