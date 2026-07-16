"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { BAND_COLOR, ieltsApi, type WritingScore, type WritingTask } from "@/lib/ielts";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Ielts = Dictionary["ielts"];

export function WritingPractice({ lang, t }: { lang: string; t: Ielts }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Record<string, WritingTask[]> | null>(null);
  const [taskType, setTaskType] = useState<"task1" | "task2">("task2");
  const [taskIndex, setTaskIndex] = useState(0);
  const [essay, setEssay] = useState("");
  const [score, setScore] = useState<WritingScore | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    ieltsApi.writingTasks().then(setTasks).catch(() => {});
  }, [ready, user]);

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const currentTask = tasks?.[taskType]?.[taskIndex];
  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const minWords = taskType === "task1" ? 150 : 250;

  async function submit() {
    if (!currentTask || pending) return;
    setPending(true);
    setError(null);
    try {
      setScore(await ieltsApi.scoreWriting(taskType, currentTask.prompt, essay));
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
    setTaskIndex(nextIndex);
    setEssay("");
    setScore(null);
    setError(null);
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <Link href={`/${lang}/ielts`} className="text-sm font-medium text-ink-soft hover:text-ink">
          ← IELTS
        </Link>
        <h1 className="text-lg font-bold text-ink">✍️ {t.writing}</h1>
      </div>

      {/* Task type toggle */}
      <div className="flex gap-1 rounded-xl border border-line p-1">
        {(["task1", "task2"] as const).map((tt) => (
          <button
            key={tt}
            type="button"
            onClick={() => reset(tt, 0)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              taskType === tt ? "bg-brand-600 text-white" : "text-ink-soft hover:text-ink"
            )}
          >
            {tt === "task1" ? t.task1 : t.task2}
          </button>
        ))}
      </div>

      {/* Prompt */}
      {currentTask && (
        <div className="mt-4 rounded-2xl border border-line bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">{currentTask.title}</p>
            {(tasks?.[taskType]?.length ?? 0) > 1 && (
              <button
                type="button"
                onClick={() =>
                  reset(taskType, (taskIndex + 1) % (tasks?.[taskType]?.length ?? 1))
                }
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
              >
                {t.newPrompt} ↻
              </button>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{currentTask.prompt}</p>
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
            <span className={cn("text-xs font-semibold", words >= minWords ? "text-success" : "text-ink-soft")}>
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
    </main>
  );
}

function ScoreCard({ score, t, onRetry }: { score: WritingScore; t: Ielts; onRetry: () => void }) {
  const criteria: [string, number][] = [
    [t.taskCriterion, score.task],
    [t.coherence, score.coherence],
    [t.lexical, score.lexical],
    [t.grammar, score.grammar],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-line bg-card p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-brand-500/30">
          <span className="text-[10px] font-bold uppercase text-ink-soft">{t.yourBand}</span>
          <span className={cn("text-2xl font-extrabold", BAND_COLOR(score.band_overall))}>
            {score.band_overall.toFixed(1)}
          </span>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2">
          {criteria.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-line/40 px-3 py-1.5">
              <p className="text-[11px] text-ink-soft">{label}</p>
              <p className="text-sm font-bold text-ink">{value.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{t.feedback}</p>
        <p className="mt-1 text-sm text-ink">{score.feedback}</p>
      </div>
      {score.improved && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{t.improved}</p>
          <p className="mt-1 rounded-lg bg-success/5 px-3 py-2 text-sm italic text-ink">
            {score.improved}
          </p>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-soft">+{score.reward.xp_gained} XP</p>
      <Button className="mt-4" fullWidth onClick={onRetry}>
        {t.tryAgain}
      </Button>
    </motion.div>
  );
}
