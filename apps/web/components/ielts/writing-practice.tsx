"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { BAND_COLOR, ieltsApi, type WritingScore, type WritingTask } from "@/lib/ielts";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { WritingTaskVisual } from "./writing-task-visual";

type Ielts = Dictionary["ielts"];

const WRITING_TASKS = [
  { key: "task1", helper: "Academic report · 150 words" },
  { key: "task2", helper: "Essay · 250 words" },
] as const;

/** Writing practice panel: rotating Task 1/2 prompts + a professional AI
 *  review — per-criterion bands, a full error list with corrections, and a
 *  band-8 model rewrite. Feedback arrives in the UI language. */
export function WritingPractice({
  lang,
  t,
  onTaskChange,
}: {
  lang: string;
  t: Ielts;
  embedded?: boolean;
  onTaskChange?: (task: "task1" | "task2") => void;
}) {
  const [tasks, setTasks] = useState<Record<string, WritingTask[]> | null>(null);
  const [taskType, setTaskType] = useState<"task1" | "task2">("task1");
  const [taskIndex, setTaskIndex] = useState(0);
  const [essay, setEssay] = useState("");
  const [score, setScore] = useState<WritingScore | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    ieltsApi.writingTasks().then(setTasks).catch(() => setLoadError(true));
  }, []);

  const currentTask = tasks?.[taskType]?.[taskIndex];
  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minWords = taskType === "task1" ? 150 : 250;

  async function submit() {
    if (!currentTask || pending) return;
    setPending(true);
    setError(null);
    try {
      setScore(await ieltsApi.scoreWriting(taskType, currentTask.prompt, essay, lang));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? t.quotaOut
          : err instanceof ApiError && err.status === 503
            ? t.notConfigured
            : t.error
      );
    } finally {
      setPending(false);
    }
  }

  function reset(nextType: "task1" | "task2", nextIndex: number) {
    setTaskType(nextType);
    onTaskChange?.(nextType);
    setTaskIndex(nextIndex);
    setEssay("");
    setScore(null);
    setError(null);
  }

  return (
    <div>
      <nav
        className="sticky top-[6.25rem] z-20 rounded-full border border-line bg-raised/88 p-1 shadow-sm backdrop-blur-md"
        aria-label="IELTS Writing tasks"
      >
        <div className="grid grid-cols-2 gap-1">
          {WRITING_TASKS.map((task) => (
            <button
              key={task.key}
              type="button"
              onClick={() => reset(task.key, 0)}
              aria-pressed={taskType === task.key}
              className={cn(
                "rounded-full px-3 py-2 text-center transition-all",
                taskType === task.key
                  ? "bg-primary text-white shadow-[0_10px_24px_rgba(12,46,20,0.22)] dark:text-brand-950"
                  : "text-ink-soft hover:bg-hover hover:text-ink"
              )}
            >
              <span className="block text-sm font-black">{task.key === "task1" ? t.task1 : t.task2}</span>
              <span className="hidden text-[10px] font-bold opacity-80 sm:block">{task.helper}</span>
            </button>
          ))}
        </div>
      </nav>

      {!tasks && (
        <div className="mt-5 rounded-lg border border-line bg-card/70 p-5" role="status">
          <p className="text-sm font-black text-ink">
            {loadError ? "Writing prompts could not be loaded" : "Preparing your writing prompt…"}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            {loadError ? "Refresh the page and try again." : "Your Task 1 visual and question are loading together."}
          </p>
        </div>
      )}

      {/* Prompt */}
      {currentTask && (
        <div className="mt-4 rounded-2xl border border-line bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink">{currentTask.title}</p>
            {(tasks?.[taskType]?.length ?? 0) > 1 && (
              <button
                type="button"
                onClick={() => reset(taskType, (taskIndex + 1) % (tasks?.[taskType]?.length ?? 1))}
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                {t.newPrompt} ↻ ({taskIndex + 1}/{tasks?.[taskType]?.length})
              </button>
            )}
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-ink-soft">{currentTask.prompt}</p>
          {currentTask.visual && <WritingTaskVisual visual={currentTask.visual} />}
        </div>
      )}

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      {!score ? (
        <>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            rows={12}
            maxLength={6000}
            placeholder={t.writingPlaceholder}
            className="mt-4 w-full resize-y rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed text-ink focus:border-brand-400 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-semibold",
                words >= minWords ? "text-success" : "text-ink-soft"
              )}
            >
              {words} {t.words} · {t.min} {minWords}
            </span>
            <Button loading={pending} onClick={submit} disabled={words < 20}>
              {t.getBand}
            </Button>
          </div>
        </>
      ) : (
        <ScoreCard score={score} t={t} onRetry={() => reset(taskType, taskIndex)} />
      )}
    </div>
  );
}

const ERROR_TYPE_EMOJI: Record<string, string> = {
  grammar: "📐",
  vocabulary: "📚",
  spelling: "🔤",
  punctuation: "✒️",
  style: "🎨",
};

function ScoreCard({ score, t, onRetry }: { score: WritingScore; t: Ielts; onRetry: () => void }) {
  const criteria = [
    [t.taskCriterion, score.task],
    [t.coherence, score.coherence],
    [t.lexical, score.lexical],
    [t.grammar, score.grammar],
  ] as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
      {/* Band + criteria with examiner comments */}
      <div className="rounded-2xl border border-line bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-brand-500/30">
            <span className="text-[10px] font-bold uppercase text-ink-soft">{t.yourBand}</span>
            <span className={cn("text-2xl font-extrabold", BAND_COLOR(score.band_overall))}>
              {score.band_overall.toFixed(1)}
            </span>
          </div>
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {criteria.map(([label, c]) => (
              <div key={label} className="rounded-lg bg-line/40 px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-ink-soft">{label}</p>
                  <p className={cn("text-sm font-bold", BAND_COLOR(c.band))}>{c.band.toFixed(1)}</p>
                </div>
                {c.comment && <p className="mt-0.5 text-xs leading-snug text-ink">{c.comment}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{t.feedback}</p>
          <p className="mt-1 text-sm text-ink">{score.feedback}</p>
        </div>
        {score.strengths.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
              💪 {t.strengthsTitle}
            </p>
            <ul className="mt-1 space-y-0.5">
              {score.strengths.map((s, i) => (
                <li key={i} className="text-sm text-ink">
                  <span className="mr-1 text-success">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 text-xs text-ink-soft">+{score.reward.xp_gained} XP</p>
      </div>

      {/* Error corrections, most damaging first */}
      {score.errors.length > 0 && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            🔍 {t.errorsTitle} ({score.errors.length})
          </p>
          <div className="mt-2 space-y-2">
            {score.errors.map((err, i) => (
              <div key={i} className="rounded-xl border border-line/70 p-3">
                <p className="text-sm">
                  <span aria-hidden>{ERROR_TYPE_EMOJI[err.type] ?? "✏️"} </span>
                  <span className="text-danger line-through decoration-danger/60">{err.quote}</span>
                  <span className="mx-1.5 text-ink-soft">→</span>
                  <span className="font-semibold text-success">{err.fix}</span>
                </p>
                {err.note && <p className="mt-1 text-xs text-ink-soft">{err.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Band-8 model rewrite */}
      {score.improved && (
        <details className="rounded-2xl border border-line bg-card p-5">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-ink-soft">
            ⭐ {t.improved}
          </summary>
          <p className="mt-2 whitespace-pre-line rounded-lg bg-success/5 px-3 py-2 text-sm leading-relaxed text-ink">
            {score.improved}
          </p>
        </details>
      )}

      <Button fullWidth onClick={onRetry}>
        {t.tryAgain}
      </Button>
    </motion.div>
  );
}
