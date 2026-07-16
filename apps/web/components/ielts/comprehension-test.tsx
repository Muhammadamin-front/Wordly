"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useSpeech } from "@/components/coach/use-speech";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import {
  BAND_COLOR,
  ieltsApi,
  type BankItem,
  type ComprehensionKind,
  type GeneratedTest,
  type GradeResult,
} from "@/lib/ielts";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Ielts = Dictionary["ielts"];

const TIME_LIMIT: Record<ComprehensionKind, number> = { reading: 480, listening: 360 };

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Reading/Listening practice panel: a bank of built-in passages plus an
 *  AI-generated "unlimited" mode; timed test; server-side grading. */
export function ComprehensionTest({
  kind,
  t,
}: {
  lang: string;
  kind: ComprehensionKind;
  t: Ielts;
  embedded?: boolean;
}) {
  const speech = useSpeech();

  const [bank, setBank] = useState<BankItem[] | null>(null);
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null); // bank id or "ai"
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    ieltsApi.bank(kind).then(setBank).catch(() => setBank([]));
  }, [kind]);

  // Countdown while a test is active; auto-submits at zero.
  useEffect(() => {
    if (!test || result) return;
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
  }, [test, result]);

  function begin(generated: GeneratedTest) {
    setTest(generated);
    setAnswers(new Array(generated.questions.length).fill(-1));
    setSecondsLeft(TIME_LIMIT[kind]);
    if (kind === "listening") {
      // Play the recording once, automatically — like the real exam.
      window.setTimeout(() => speech.speak(generated.body, { rate: 0.98 }), 400);
    }
  }

  async function start(source: "ai" | string) {
    setLoadingId(source);
    setError(null);
    setResult(null);
    speech.cancel();
    try {
      begin(
        source === "ai" ? await ieltsApi.generate(kind, 6) : await ieltsApi.bankStart(kind, source)
      );
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? t.quotaOut
          : err instanceof ApiError && err.status === 503
            ? t.notConfigured
            : t.error
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function submit() {
    if (!test || result) return;
    speech.cancel();
    try {
      const graded = await ieltsApi.submit(kind, test.test_id, answers);
      setResult(graded);
      setBank(null); // refresh done-marks next time the picker shows
    } catch {
      setError(t.error);
    }
  }
  // Keep the timer's auto-submit pointing at the latest closure.
  useEffect(() => {
    submitRef.current = submit;
  });

  function backToList() {
    speech.cancel();
    setTest(null);
    setResult(null);
    ieltsApi.bank(kind).then(setBank).catch(() => setBank([]));
  }

  return (
    <div>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Picker: built-in passages + AI unlimited */}
      {!test && (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">
            {kind === "reading" ? t.readingIntro : t.listeningIntro}
          </p>

          {/* AI unlimited card */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-400/40 bg-linear-to-r from-brand-600/10 to-transparent p-4">
            <div>
              <p className="font-bold text-ink">✨ {t.aiUnlimited}</p>
              <p className="text-xs text-ink-soft">{t.aiUnlimitedDesc}</p>
            </div>
            <Button size="sm" loading={loadingId === "ai"} onClick={() => start("ai")}>
              {t.startTest}
            </Button>
          </div>

          <h2 className="pt-2 text-sm font-bold uppercase tracking-wide text-ink-soft">
            📚 {t.passagesTitle}
          </h2>
          {bank === null ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : (
            bank.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {item.done && <span className="mr-1 text-success">✓</span>}
                    {item.title}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {item.word_count} {t.words} · {item.question_count} {t.questionsShort}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={item.done ? "secondary" : "primary"}
                  loading={loadingId === item.id}
                  onClick={() => start(item.id)}
                >
                  {item.done ? t.tryAgain : t.startTest}
                </Button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Active test */}
      {test && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={backToList}
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              ← {t.passagesTitle}
            </button>
            {!result && (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-bold tabular-nums",
                  secondsLeft < 60
                    ? "bg-danger/10 text-danger"
                    : "bg-brand-600/10 text-brand-600 dark:text-brand-300"
                )}
              >
                ⏱ {fmt(secondsLeft)}
              </span>
            )}
          </div>

          {kind === "reading" ? (
            <article className="max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-5">
              <h2 className="mb-2 text-lg font-bold text-ink">{test.title}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{test.body}</p>
            </article>
          ) : (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-card p-5">
              <Button
                variant="secondary"
                onClick={() =>
                  speech.speaking ? speech.cancel() : speech.speak(test.body, { rate: 0.98 })
                }
              >
                {speech.speaking ? `⏸ ${t.pause}` : `▶ ${t.replay}`}
              </Button>
              <p className="text-xs text-ink-soft">{t.listeningHint}</p>
            </div>
          )}

          {test.questions.map((q, qi) => (
            <div key={qi} className="rounded-2xl border border-line bg-card p-4">
              <p className="font-semibold text-ink">
                {qi + 1}. {q.prompt}
              </p>
              <div className="mt-2 space-y-1.5">
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  const correct = result && result.answers[qi] === oi;
                  const wrongChosen = result && chosen && result.answers[qi] !== oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={!!result}
                      onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        correct && "border-success bg-success/10 text-success",
                        wrongChosen && "border-danger bg-danger/10 text-danger",
                        !result && chosen && "border-brand-500 bg-brand-600/10 text-ink",
                        !result && !chosen && "border-line text-ink hover:bg-line/40",
                        result && !correct && !wrongChosen && "border-line text-ink-soft"
                      )}
                    >
                      <span className="font-bold">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!result ? (
            <Button fullWidth onClick={submit} disabled={answers.some((a) => a === -1)}>
              {t.submitTest}
            </Button>
          ) : (
            <ResultCard result={result} t={t} onBack={backToList} />
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  result,
  t,
  onBack,
}: {
  result: GradeResult;
  t: Ielts;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-line bg-card p-6 text-center"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{t.yourBand}</p>
      <p className={cn("text-5xl font-extrabold", BAND_COLOR(result.band))}>
        {result.band.toFixed(1)}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {result.correct} / {result.total} {t.correct} · +{result.reward.xp_gained} XP
      </p>
      <Button className="mt-4" onClick={onBack}>
        {t.newTest}
      </Button>
    </motion.div>
  );
}
