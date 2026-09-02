"use client";

import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { ieltsApi, type WritingTask } from "@/lib/ielts";
import { combineWritingBand, type MockSession } from "@/lib/ielts-mock";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { WritingTaskVisual } from "@/components/ielts/writing-task-visual";
import { MockLegHeader } from "./mock-listening-leg";

type Copy = Dictionary["ieltsMock"];
type Ielts = Dictionary["ielts"];

const TASK_MINUTES: Record<"task1" | "task2", number> = { task1: 20, task2: 40 };
const MIN_WORDS: Record<"task1" | "task2", number> = { task1: 150, task2: 250 };

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** The Full Mock's Writing leg: Task 1 then Task 2, each timed like the real
 *  exam (20 / 40 minutes), auto-submitting at zero. Task 2 counts double
 *  toward the combined Writing band, per real IELTS weighting. */
export function MockWritingLeg({
  t,
  ieltsT,
  lang,
  session,
  onDone,
  onAbandon,
}: {
  t: Copy;
  ieltsT: Ielts;
  lang: string;
  session: MockSession;
  onDone: (band: number, detail: { task1: number; task2: number }) => Promise<boolean>;
  onAbandon: () => void;
}) {
  const [tasks, setTasks] = useState<Record<string, WritingTask[]> | null>(null);
  const [taskType, setTaskType] = useState<"task1" | "task2">("task1");
  const [prompt, setPrompt] = useState<WritingTask | null>(null);
  const [essay, setEssay] = useState("");
  const [task1Band, setTask1Band] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    ieltsApi
      .writingTasks()
      .then((all) => {
        setTasks(all);
        setPrompt(pickTask(all, "task1"));
        setSecondsLeft(TASK_MINUTES.task1 * 60);
      })
      .catch(() => setError(t.error));
  }, [t.error]);

  useEffect(() => {
    if (!prompt) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          submitRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [prompt]);

  async function submit() {
    if (!prompt || submitting) return;
    setSubmitting(true);
    setError(null);
    // The timer can force a submit with too little text for the AI grader
    // (min 20 characters) to accept — same as leaving the real exam sheet
    // blank, which the real test would score as band 0 for that task.
    if (essay.trim().length < 20) {
      if (taskType === "task1") {
        setTask1Band(0);
        setTaskType("task2");
        setPrompt(tasks ? pickTask(tasks, "task2") : null);
        setEssay("");
        setSecondsLeft(TASK_MINUTES.task2 * 60);
        setSubmitting(false);
      } else {
        const combined = combineWritingBand(task1Band ?? 0, 0);
        const ok = await onDone(combined, { task1: task1Band ?? 0, task2: 0 });
        if (!ok) {
          setError(t.error);
          setSubmitting(false);
        }
      }
      return;
    }
    try {
      const score = await ieltsApi.scoreWriting(taskType, prompt.prompt, essay, lang, session.id);
      if (taskType === "task1") {
        setTask1Band(score.band_overall);
        setTaskType("task2");
        setPrompt(tasks ? pickTask(tasks, "task2") : null);
        setEssay("");
        setSecondsLeft(TASK_MINUTES.task2 * 60);
        setSubmitting(false);
      } else {
        const combined = combineWritingBand(task1Band ?? score.band_overall, score.band_overall);
        const ok = await onDone(combined, { task1: task1Band ?? score.band_overall, task2: score.band_overall });
        if (!ok) {
          setError(t.error);
          setSubmitting(false);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? ieltsT.quotaOut : t.error);
      setSubmitting(false);
    }
  }
  useEffect(() => {
    submitRef.current = submit;
  });

  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minWords = MIN_WORDS[taskType];

  if (!prompt) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" aria-hidden />
        {error && <Alert tone="error">{error}</Alert>}
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <MockLegHeader
          label={t.legWriting}
          exitLabel={t.exit}
          onAbandon={onAbandon}
          exitConfirmTitle={t.exitConfirmTitle}
          exitConfirmBody={t.exitConfirmBody}
          exitConfirmStay={t.exitConfirmStay}
          exitConfirmLeave={t.exitConfirmLeave}
        />
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-bold tabular-nums",
            secondsLeft < 120 ? "bg-danger/10 text-danger-text" : "bg-brand-600/10 text-brand-600 dark:text-brand-300"
          )}
        >
          ⏱ {fmt(secondsLeft)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-full bg-brand-600/10 px-3 py-1 text-xs font-black text-brand-700 dark:text-brand-200">
          {t.writingTaskOf.replace("{n}", taskType === "task1" ? "1" : "2")}
        </span>
        <span className="text-xs font-bold text-ink-soft">
          {taskType === "task1" ? t.writingTask1Label : t.writingTask2Label}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-card p-5">
        <p className="text-sm font-bold text-ink">{prompt.title}</p>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-ink-soft">{prompt.prompt}</p>
        {prompt.visual && <WritingTaskVisual visual={prompt.visual} />}
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        rows={14}
        maxLength={6000}
        placeholder={ieltsT.writingPlaceholder}
        className="mt-4 w-full resize-y rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed text-ink focus:border-brand-400 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className={cn("text-xs font-semibold", words >= minWords ? "text-success-text" : "text-ink-soft")}>
          {words} {ieltsT.words} · {ieltsT.min} {minWords}
        </span>
        {taskType === "task2" && (
          <span className="text-xs text-ink-soft">{t.writingCombinedNote}</span>
        )}
      </div>
      <Button fullWidth className="mt-3" loading={submitting} onClick={submit} disabled={words < 20}>
        {ieltsT.getBand}
      </Button>
    </main>
  );
}

function pickTask(tasks: Record<string, WritingTask[]>, type: "task1" | "task2"): WritingTask | null {
  const pool = tasks[type];
  if (!pool?.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
