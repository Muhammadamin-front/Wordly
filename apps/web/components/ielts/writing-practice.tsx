"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { ieltsApi, type WritingScore, type WritingTask } from "@/lib/ielts";
import { useApi } from "@/lib/use-api";
import { WritingQuotaBadge } from "./quota-badge";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { WritingFeedbackReport } from "./writing-feedback-report";
import { WritingTaskVisual } from "./writing-task-visual";

type Ielts = Dictionary["ielts"];

const COMPOSER_COPY = {
  en: {
    task1Helper: "Academic report · 150 words",
    task2Helper: "Essay · 250 words",
    navLabel: "IELTS Writing tasks",
    loadingTitle: "Preparing your writing prompt…",
    loadingBody: "Your Task 1 visual and question are loading together.",
    loadErrorTitle: "Writing prompts could not be loaded",
    loadErrorBody: "Refresh the page and try again.",
  },
  uz: {
    task1Helper: "Academic hisobot · 150 so‘z",
    task2Helper: "Insho · 250 so‘z",
    navLabel: "IELTS Writing vazifalari",
    loadingTitle: "Writing vazifasi tayyorlanmoqda…",
    loadingBody: "Task 1 rasmi va savoli birga yuklanmoqda.",
    loadErrorTitle: "Writing vazifalarini yuklab bo‘lmadi",
    loadErrorBody: "Sahifani yangilang va qayta urinib ko‘ring.",
  },
  ru: {
    task1Helper: "Академический отчёт · 150 слов",
    task2Helper: "Эссе · 250 слов",
    navLabel: "Задания IELTS Writing",
    loadingTitle: "Готовим задание Writing…",
    loadingBody: "Визуал и вопрос Task 1 загружаются вместе.",
    loadErrorTitle: "Не удалось загрузить задания Writing",
    loadErrorBody: "Обновите страницу и попробуйте снова.",
  },
} as const;

/** Writing practice panel: rotating Task 1/2 prompts plus an essay-grounded
 *  AI report with criterion bands, exact sentence highlights, targeted
 *  corrections, a band plan, and a Band-8 model rewrite. */
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
  const locale = lang === "uz" || lang === "ru" ? lang : "en";
  const copy = COMPOSER_COPY[locale];
  // Read before the learner writes, and revalidated after each submission so
  // the counter matches what the server will enforce next time.
  const { data: quota, mutate: mutateQuota } = useApi("ielts:writing-quota", () =>
    ieltsApi.writingQuota()
  );
  const taskOptions = [
    { key: "task1" as const, helper: copy.task1Helper },
    { key: "task2" as const, helper: copy.task2Helper },
  ];

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
      void mutateQuota();
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

  if (score) {
    return (
      <WritingFeedbackReport
        lang={lang}
        taskType={taskType}
        score={score}
        t={t}
        onRetry={() => reset(taskType, taskIndex)}
      />
    );
  }

  return (
    <div>
      <nav
        className="sticky top-[6.25rem] z-20 rounded-full border border-line bg-raised/88 p-1 shadow-sm backdrop-blur-md"
        aria-label={copy.navLabel}
      >
        <div className="grid grid-cols-2 gap-1">
          {taskOptions.map((task) => (
            <button
              key={task.key}
              type="button"
              onClick={() => reset(task.key, 0)}
              aria-pressed={taskType === task.key}
              className={cn(
                "min-h-11 rounded-full px-3 py-2 text-center transition-all",
                taskType === task.key
                  ? "bg-primary text-white shadow-[0_10px_24px_rgba(12,46,20,0.22)] dark:text-brand-950"
                  : "text-ink-soft hover:bg-hover hover:text-ink"
              )}
            >
              <span className="block text-sm font-black">{task.key === "task1" ? t.task1 : t.task2}</span>
              <span className="hidden text-[10px] font-bold sm:block">{task.helper}</span>
            </button>
          ))}
        </div>
      </nav>

      {!tasks && (
        <div className="mt-5 rounded-lg border border-line bg-card/70 p-5" role="status">
          <p className="text-sm font-black text-ink">
            {loadError ? copy.loadErrorTitle : copy.loadingTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            {loadError ? copy.loadErrorBody : copy.loadingBody}
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
                className="inline-flex min-h-11 items-center text-xs font-semibold text-brand-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:text-brand-300"
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

      {quota && (
        <WritingQuotaBadge
          lang={locale}
          className="mt-4"
          used={quota.used}
          limit={quota.limit}
          remaining={quota.remaining}
          period={quota.period}
        />
      )}

      <label htmlFor="ielts-writing-response" className="sr-only">
        {t.writingPlaceholder}
      </label>
      <textarea
        id="ielts-writing-response"
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        rows={12}
        maxLength={6000}
        placeholder={t.writingPlaceholder}
        aria-describedby="ielts-writing-word-count"
        className="mt-4 w-full resize-y rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed text-ink focus:border-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span
          id="ielts-writing-word-count"
          className={cn(
            "text-xs font-semibold",
            words >= minWords ? "text-emerald-800 dark:text-emerald-200" : "text-ink-soft"
          )}
        >
          {words} {t.words} · {t.min} {minWords}
        </span>
        <Button loading={pending} onClick={submit} disabled={words < 20}>
          {t.getBand}
        </Button>
      </div>
    </div>
  );
}
