"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useSpeech } from "@/components/coach/use-speech";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  BAND_COLOR,
  ieltsApi,
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

export function ComprehensionTest({
  lang,
  kind,
  t,
}: {
  lang: string;
  kind: ComprehensionKind;
  t: Ielts;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const speech = useSpeech();

  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

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

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    speech.cancel();
    try {
      const generated = await ieltsApi.generate(kind, 6);
      setTest(generated);
      setAnswers(new Array(generated.questions.length).fill(-1));
      setSecondsLeft(TIME_LIMIT[kind]);
      if (kind === "listening") {
        // Read the script aloud once, automatically.
        window.setTimeout(() => speech.speak(generated.body, { rate: 0.98 }), 400);
      }
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? t.quotaOut
          : err instanceof ApiError && err.status === 503
            ? t.notConfigured
            : t.error
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!test || result) return;
    speech.cancel();
    try {
      setResult(await ieltsApi.submit(kind, test.test_id, answers));
    } catch {
      setError(t.error);
    }
  }
  // Keep the timer's auto-submit pointing at the latest closure.
  useEffect(() => {
    submitRef.current = submit;
  });

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const title = kind === "reading" ? t.reading : t.listening;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <Link href={`/${lang}/ielts`} className="text-sm font-medium text-ink-soft hover:text-ink">
          ← IELTS
        </Link>
        <h1 className="text-lg font-bold text-ink">
          {kind === "reading" ? "📖" : "🎧"} {title}
        </h1>
        {test && !result && (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-bold tabular-nums",
              secondsLeft < 60 ? "bg-danger/10 text-danger" : "bg-brand-600/10 text-brand-600 dark:text-brand-300"
            )}
          >
            ⏱ {fmt(secondsLeft)}
          </span>
        )}
      </div>

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Intro */}
      {!test && (
        <div className="rounded-2xl border border-line bg-card p-8 text-center">
          <p className="text-5xl">{kind === "reading" ? "📖" : "🎧"}</p>
          <h2 className="mt-3 text-xl font-bold text-ink">{title}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            {kind === "reading" ? t.readingIntro : t.listeningIntro}
          </p>
          <Button className="mt-5" loading={loading} onClick={generate}>
            {t.startTest}
          </Button>
        </div>
      )}

      {/* Active test */}
      {test && (
        <div className="space-y-5">
          {kind === "reading" ? (
            <article className="max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-5">
              <h2 className="mb-2 text-lg font-bold text-ink">{test.title}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{test.body}</p>
            </article>
          ) : (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-line bg-card p-5">
              <Button
                variant="secondary"
                onClick={() => (speech.speaking ? speech.cancel() : speech.speak(test.body, { rate: 0.98 }))}
              >
                {speech.speaking ? `⏸ ${t.pause}` : `▶ ${t.replay}`}
              </Button>
              <p className="text-xs text-ink-soft">{t.listeningHint}</p>
            </div>
          )}

          {/* Questions */}
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
                      onClick={() =>
                        setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                      }
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
            <ResultCard result={result} t={t} onRetry={generate} lang={lang} />
          )}
        </div>
      )}
    </main>
  );
}

function ResultCard({
  result,
  t,
  onRetry,
  lang,
}: {
  result: GradeResult;
  t: Ielts;
  onRetry: () => void;
  lang: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-line bg-card p-6 text-center"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{t.yourBand}</p>
      <p className={cn("text-5xl font-extrabold", BAND_COLOR(result.band))}>{result.band.toFixed(1)}</p>
      <p className="mt-1 text-sm text-ink-soft">
        {result.correct} / {result.total} {t.correct} · +{result.reward.xp_gained} XP
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Button onClick={onRetry}>{t.newTest}</Button>
        <Link href={`/${lang}/ielts`}>
          <Button variant="ghost">IELTS</Button>
        </Link>
      </div>
    </motion.div>
  );
}
