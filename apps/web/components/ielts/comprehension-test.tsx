"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL, ApiError, waitForAccessToken } from "@/lib/api";
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

/** Real Academic Reading allows 20 minutes for a 700-900 word passage with 13-14
 *  questions — roughly 90 seconds per question, with the passage read once. The
 *  old formula ignored the question count and gave ~19 minutes for a 700-word
 *  passage with 8 questions, about twice the real pace. */
function readingSeconds(body: string, questionCount: number): number {
  const words = body.split(/\s+/).length;
  const reading = words * 0.6; // ~100 wpm for careful first read
  const answering = questionCount * 60;
  return Math.min(1500, Math.max(240, Math.round(reading + answering)));
}

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
  const [bank, setBank] = useState<BankItem[] | null>(null);
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null); // bank id or "ai"
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  // IELTS Listening is played once. Pausing is allowed, restarting is not until
  // the answers are in — the app's own cheatsheet teaches this, and unlimited
  // replay made the practice score meaningless.
  const [audioFinished, setAudioFinished] = useState(false);
  const [heard, setHeard] = useState({ current: 0, duration: 0 });
  const [audioFailed, setAudioFailed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const submitRef = useRef<() => void>(() => {});

  // Natural ElevenLabs narration only — no browser speechSynthesis fallback.
  // A robotic voice on a real listening test reads as broken, not degraded,
  // so a failure surfaces as a clear retry state instead.
  const stopAudio = () => {
    audioRef.current?.pause();
    setAudioPlaying(false);
  };

  async function playNarration(testId: string) {
    setAudioFailed(false);
    try {
      const token = await waitForAccessToken();
      const resp = await fetch(`${API_URL}/api/v1/ielts/listening/${testId}/audio`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!resp.ok) throw new Error(String(resp.status));
      const url = URL.createObjectURL(await resp.blob());
      audioRef.current?.pause();
      const audio = new Audio(url);
      audio.onplay = () => setAudioPlaying(true);
      audio.onpause = () => setAudioPlaying(false);
      audio.onloadedmetadata = () => setHeard({ current: 0, duration: audio.duration || 0 });
      audio.ontimeupdate = () => setHeard({ current: audio.currentTime, duration: audio.duration || 0 });
      audio.onended = () => {
        setAudioPlaying(false);
        setAudioFinished(true);
        setHeard((prev) => ({ ...prev, current: prev.duration }));
        URL.revokeObjectURL(url);
      };
      audioRef.current = audio;
      await audio.play();
    } catch {
      audioRef.current = null;
      setAudioFailed(true);
    }
  }

  useEffect(() => stopAudio, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The active test takes over the phone screen; letting the hub scroll behind
  // it would drag a timed, play-once exercise out from under the learner.
  useEffect(() => {
    if (!test) return;
    const phone = window.matchMedia("(max-width: 639px)");
    const apply = () => { document.body.style.overflow = phone.matches ? "hidden" : ""; };
    apply();
    phone.addEventListener("change", apply);
    return () => { phone.removeEventListener("change", apply); document.body.style.overflow = ""; };
  }, [test]);

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
    setAudioFinished(false);
    setHeard({ current: 0, duration: 0 });
    setAnswers(new Array(generated.questions.length).fill(-1));
    setSecondsLeft(
      kind === "reading"
        ? readingSeconds(generated.body, generated.questions.length)
        : TIME_LIMIT[kind]
    );
    if (kind === "listening") {
      // Play the recording once, automatically — like the real exam.
      window.setTimeout(() => playNarration(generated.test_id), 400);
    }
  }

  async function start(source: "ai" | string) {
    setLoadingId(source);
    setError(null);
    setResult(null);
    stopAudio();
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
    stopAudio();
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
    stopAudio();
    audioRef.current = null;
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
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-400/40 bg-linear-to-r from-brand-600/10 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-ink">✨ {t.aiUnlimited}</p>
              <p className="text-xs text-ink-soft">{t.aiUnlimitedDesc}</p>
            </div>
            <Button size="sm" className="shrink-0 max-sm:w-full" loading={loadingId === "ai"} onClick={() => start("ai")}>
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
                className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink max-sm:text-balance sm:truncate">
                    {item.done && <span className="mr-1 text-success">✓</span>}
                    {item.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-bold tabular-nums",
                        item.band >= 7.5
                          ? "bg-accent-500/12 text-accent-600 dark:text-accent-300"
                          : item.band >= 6.5
                            ? "bg-brand-500/12 text-brand-600 dark:text-brand-300"
                            : "bg-sand-200/80 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200"
                      )}
                    >
                      {t.bandLabel} {item.band.toFixed(1)}
                    </span>
                    <span>
                      {item.word_count} {t.words} · {item.question_count} {t.questionsShort}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 max-sm:w-full"
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

      {/* Active test. On a phone it takes over the screen: a timed, play-once
          exercise cannot share a viewport with the hub it was launched from. */}
      {test && (
        <div className="max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:flex max-sm:flex-col max-sm:bg-page max-sm:pt-[env(safe-area-inset-top)] sm:space-y-5">
          <div className="flex shrink-0 items-center justify-between gap-3 max-sm:border-b max-sm:border-line max-sm:bg-raised max-sm:px-4 max-sm:py-2.5">
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

          {(() => {
            const questionList = (
              <>
                {test.questions.map((q, qi) => (
                  <div key={qi} className="rounded-2xl border border-line bg-card p-4">
                    <p className="flex items-start gap-2 font-semibold text-ink">
                      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded border border-line text-xs font-bold text-ink-soft">
                        {qi + 1}
                      </span>
                      {q.prompt}
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
                    {result?.explanations?.[qi] && (
                      <p className="mt-3 rounded-lg bg-brand-600/6 px-3 py-2 text-sm leading-6 text-ink-soft">
                        {result.explanations[qi]}
                      </p>
                    )}
                  </div>
                ))}
              </>
            );
            const footer = !result ? (
              <Button fullWidth onClick={submit} disabled={answers.some((a) => a === -1)}>
                {t.submitTest}
              </Button>
            ) : (
              <ResultCard result={result} t={t} onBack={backToList} />
            );
            const questionsBlock = (
              <>
                {questionList}
                {footer}
              </>
            );

            if (kind === "reading") {
              // Exam-style split view: passage stays put on the left while the
              // learner scrolls the questions on the right (stacked on mobile).
              return (
                <div className="gap-5 lg:grid lg:grid-cols-2 lg:items-start">
                  <article className="max-h-80 overflow-y-auto rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-8rem)]">
                    <h2 className="mb-3 text-lg font-bold text-ink">{test.title}</h2>
                    <p className="whitespace-pre-line text-[15px] leading-7 text-ink">
                      {test.body}
                    </p>
                  </article>
                  <div className="mt-5 space-y-5 lg:mt-0">{questionsBlock}</div>
                </div>
              );
            }
            const played = heard.duration > 0 ? Math.min(1, heard.current / heard.duration) : 0;
            return (
              <>
                <div className="shrink-0 border-line bg-card max-sm:border-b sm:rounded-2xl sm:border">
                  <div className="flex items-center gap-3 p-4 sm:p-5">
                    <Button
                      variant="secondary"
                      className="size-12 shrink-0 rounded-full p-0 text-lg"
                      aria-label={audioPlaying ? t.pause : t.replay}
                      disabled={!result && audioFinished}
                      onClick={() => {
                        if (audioRef.current) {
                          if (audioPlaying) audioRef.current.pause();
                          else void audioRef.current.play();
                        } else {
                          void playNarration(test.test_id);
                        }
                      }}
                    >
                      {audioFailed ? "↻" : audioPlaying ? "⏸" : "▶"}
                    </Button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-bold text-ink">{test.title}</p>
                        {heard.duration > 0 && (
                          <span className="shrink-0 text-xs tabular-nums text-ink-soft">
                            {fmt(Math.round(heard.current))} / {fmt(Math.round(heard.duration))}
                          </span>
                        )}
                      </div>
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(played * 100)}
                        aria-label={t.listeningHint}
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
                      >
                        <div
                          className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
                          style={{ width: `${played * 100}%` }}
                        />
                      </div>
                      <p className={cn("mt-1.5 text-[11px] leading-4", audioFailed ? "font-bold text-danger" : "text-ink-soft")}>
                        {audioFailed ? t.error : result ? t.listeningHint : t.listeningPlaysOnce}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5 max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-y-auto max-sm:px-4 max-sm:py-4">
                  {/* Graded: the band leads, then the answer review scrolls under
                      it. Ungraded: the submit button is pinned below instead. */}
                  {result && <div className="sm:hidden">{footer}</div>}
                  {questionList}
                  <div className="max-sm:hidden">{footer}</div>
                </div>
                {!result && (
                  <div className="shrink-0 border-t border-line bg-raised px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
                    {footer}
                  </div>
                )}
              </>
            );
          })()}
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
