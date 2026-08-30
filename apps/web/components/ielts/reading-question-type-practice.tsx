"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Target } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getQuestionsForReadingQuestionType,
  getReadingQuestionTypeGuide,
  type ReadingQuestion,
  type ReadingQuestionPracticeItem,
  type ReadingQuestionTypeGuideId,
} from "@/lib/reading-practice";
import { cn } from "@/lib/utils";

type AnswerValue = string | string[];

function normalise(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[.]/g, "");
}

function isCorrect(question: ReadingQuestion, answer: AnswerValue | undefined) {
  if (Array.isArray(question.answer)) {
    return Array.isArray(answer) && [...answer].sort().join("|") === [...question.answer].sort().join("|");
  }
  if (Array.isArray(answer)) return false;
  if (!answer) return false;
  return [question.answer, ...(question.acceptedAnswers ?? [])].map(normalise).includes(normalise(answer));
}

function hasAnswer(answer: AnswerValue | undefined) {
  return Array.isArray(answer) ? answer.length > 0 : Boolean(answer?.trim());
}

const TEXT_QUESTION_KINDS = new Set([
  "sentence-completion",
  "summary-completion",
  "table-completion",
  "form-completion",
  "diagram-labelling",
  "short-answer",
]);

export function ReadingQuestionTypePractice({
  typeId,
  onBack,
}: {
  typeId: ReadingQuestionTypeGuideId;
  onBack: () => void;
}) {
  const guide = getReadingQuestionTypeGuide(typeId);
  const items = useMemo(() => getQuestionsForReadingQuestionType(typeId), [typeId]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<AnswerValue>();
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const item = items[index];
  const complete = index >= items.length;

  const checkAnswer = () => {
    if (!item || checked || !hasAnswer(answer)) return;
    if (isCorrect(item.question, answer)) setScore((value) => value + 1);
    setChecked(true);
  };

  const next = () => {
    setIndex((value) => value + 1);
    setAnswer(undefined);
    setChecked(false);
  };

  const restart = () => {
    setIndex(0);
    setAnswer(undefined);
    setChecked(false);
    setScore(0);
  };

  if (!items.length) return null;

  if (complete) {
    const percentage = Math.round((score / items.length) * 100);
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card/70 px-3 py-2 text-sm font-bold text-ink-soft transition-colors hover:text-ink">
          <ArrowLeft className="size-4" /> Question type practice
        </button>
        <section className="surface-panel mt-5 rounded-lg p-6 text-center sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success"><CheckCircle2 className="size-7" /></span>
          <p className="type-label mt-5 text-brand-600 dark:text-brand-300">Drill complete</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-ink">{score} / {items.length}</h1>
          <p className="mt-2 text-lg font-bold text-ink">{percentage}% accuracy in {guide.title}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink-soft">Read the evidence after every miss, then repeat the drill until you can explain each trap without guessing.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button onClick={restart}><RotateCcw className="size-4" /> Retry this type</Button>
            <Button variant="secondary" onClick={onBack}>Choose another type <ArrowRight className="size-4" /></Button>
          </div>
        </section>
      </main>
    );
  }

  const correct = checked && isCorrect(item.question, answer);
  const promptId = `focused-reading-${item.question.id}-prompt`;
  const instructionId = item.question.instruction ? `focused-reading-${item.question.id}-instruction` : undefined;
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card/70 px-3 py-2 text-sm font-bold text-ink-soft transition-colors hover:text-ink">
        <ArrowLeft className="size-4" /> Question type practice
      </button>

      <section className="surface-panel mt-5 rounded-lg p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/8 px-3 py-1.5 text-xs font-black uppercase text-brand-700 dark:text-brand-200"><Target className="size-4" /> Focus drill</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">{guide.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{guide.description}</p>
          </div>
          <div className="min-w-36 rounded-lg border border-line bg-raised p-3 text-right">
            <p className="type-label text-ink-soft">Progress</p>
            <p className="mt-1 text-xl font-black text-ink">{index + 1}<span className="text-ink-soft">/{items.length}</span></p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand-500 transition-[width] duration-200" style={{ width: `${(index / items.length) * 100}%` }} /></div>
          </div>
        </div>
        <ol className="mt-5 grid gap-2 border-t border-line pt-5 text-sm leading-6 text-ink-soft sm:grid-cols-3">
          {guide.strategy.map((tip, tipIndex) => <li key={tip} className="flex gap-2"><span className="font-black text-accent-500">{tipIndex + 1}.</span>{tip}</li>)}
        </ol>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <PassageContext item={item} />
        <article className="rounded-lg border border-line bg-card p-5 shadow-[0_10px_28px_rgba(27,64,55,0.055)] sm:p-6">
          <p className="type-label text-accent-500">{item.question.group}</p>
          <h2 id={promptId} className="mt-2 text-xl font-black leading-7 text-ink">{item.question.prompt}</h2>
          {item.question.instruction && <p id={instructionId} className="mt-2 text-xs font-black uppercase tracking-wide text-ink-soft">{item.question.instruction}</p>}
          <div className="mt-5"><PracticeQuestionInput question={item.question} value={answer} disabled={checked} labelledBy={promptId} describedBy={instructionId} onChange={setAnswer} /></div>

          {checked && (
            <div className={cn("mt-5 rounded-lg border p-4", correct ? "border-success/25 bg-success/5" : "border-danger/20 bg-danger/5")} aria-live="polite">
              <p className={cn("font-black", correct ? "text-success" : "text-danger")}>{correct ? "Correct. Good evidence reading." : "Not quite. Check the evidence carefully."}</p>
              {!correct && <p className="mt-2 text-sm text-ink-soft">Correct answer: <strong className="text-ink">{formatAnswer(item.question.answer)}</strong></p>}
              <p className="mt-3 text-sm leading-6 text-ink-soft">{item.question.explanation}</p>
              <p className="mt-3 border-l-2 border-brand-400 bg-brand-600/6 px-3 py-2 text-sm italic leading-6 text-ink">Evidence: “{item.question.evidence}”</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            {!checked ? <Button disabled={!hasAnswer(answer)} onClick={checkAnswer}>Check answer <CheckCircle2 className="size-4" /></Button> : <Button onClick={next}>{index + 1 === items.length ? "See results" : "Next question"}<ArrowRight className="size-4" /></Button>}
          </div>
        </article>
      </section>
    </main>
  );
}

function PassageContext({ item }: { item: ReadingQuestionPracticeItem }) {
  return (
    <aside className="rounded-lg border border-line bg-raised/75 p-5">
      <p className="type-label text-brand-600 dark:text-brand-300">Source passage</p>
      <h2 className="mt-2 text-lg font-black leading-6 text-ink">{item.passage.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{item.passage.subtitle}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-soft">{item.test.track} · {item.test.level}</p>
      <details className="mt-5 border-t border-line pt-4">
        <summary className="cursor-pointer text-sm font-black text-ink">Read the passage</summary>
        <div className="mt-4 space-y-4 text-sm leading-7 text-ink-soft">
          {item.passage.paragraphs.map((paragraph) => <p key={paragraph.label}><strong className="mr-2 text-brand-700 dark:text-brand-200">{paragraph.label}</strong>{paragraph.text}</p>)}
        </div>
      </details>
    </aside>
  );
}

function PracticeQuestionInput({ question, value, disabled, labelledBy, describedBy, onChange }: { question: ReadingQuestion; value: AnswerValue | undefined; disabled: boolean; labelledBy: string; describedBy?: string; onChange: (value: AnswerValue) => void }) {
  if (TEXT_QUESTION_KINDS.has(question.kind)) {
    return <input aria-labelledby={labelledBy} aria-describedby={describedBy} disabled={disabled} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} placeholder="Type your answer" className="min-h-12 w-full rounded-lg border border-line bg-raised px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand-400 focus:ring-2 focus:ring-focus/20 disabled:opacity-70" />;
  }
  if (question.kind === "matching-headings" || question.kind === "matching-information" || question.kind === "matching-features") {
    return <select aria-labelledby={labelledBy} aria-describedby={describedBy} disabled={disabled} value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-lg border border-line bg-raised px-3 text-sm font-semibold text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-focus/20 disabled:opacity-70"><option value="">Choose an answer</option>{question.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  }
  if (question.kind === "multiple-answer") {
    const current = Array.isArray(value) ? value : [];
    return <fieldset aria-labelledby={labelledBy} aria-describedby={describedBy} className="min-w-0 space-y-2 border-0 p-0">{question.options?.map((option) => <label key={option.value} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors", current.includes(option.value) ? "border-brand-400 bg-brand-600/8 text-ink" : "border-line text-ink-soft hover:bg-hover", disabled && "cursor-default opacity-70")}><input disabled={disabled} type="checkbox" checked={current.includes(option.value)} onChange={() => onChange(current.includes(option.value) ? current.filter((item) => item !== option.value) : [...current, option.value])} className="mt-0.5 size-4 accent-brand-600" /><span>{option.label}</span></label>)}</fieldset>;
  }
  return <fieldset aria-labelledby={labelledBy} aria-describedby={describedBy} className="min-w-0 space-y-2 border-0 p-0">{question.options?.map((option) => <label key={option.value} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors", value === option.value ? "border-brand-400 bg-brand-600/8 text-ink" : "border-line text-ink-soft hover:bg-hover", disabled && "cursor-default opacity-70")}><input disabled={disabled} type="radio" name={`drill-${question.id}`} checked={value === option.value} onChange={() => onChange(option.value)} className="mt-0.5 size-4 accent-brand-600" /><span>{option.label}</span></label>)}</fieldset>;
}

function formatAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join(", ") : answer;
}
