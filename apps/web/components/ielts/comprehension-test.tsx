"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { useSpeech } from "@/components/coach/use-speech";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL, ApiError, getAccessToken } from "@/lib/api";
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
  const speech = useSpeech();

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const submitRef = useRef<() => void>(() => {});

  // Natural ElevenLabs narration when the server has TTS; falls back to the
  // browser's speechSynthesis voice when it doesn't.
  const stopAudio = () => {
    audioRef.current?.pause();
    speech.cancel();
    setAudioPlaying(false);
  };

  async function playNarration(testId: string, body: string) {
    try {
      const token = getAccessToken();
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
      audio.onended = () => {
        setAudioPlaying(false);
        setAudioFinished(true);
        URL.revokeObjectURL(url);
      };
      audioRef.current = audio;
      await audio.play();
    } catch {
      audioRef.current = null;
      speech.speak(body, { rate: 0.98 }); // graceful fallback
    }
  }

  useEffect(() => stopAudio, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setAnswers(new Array(generated.questions.length).fill(-1));
    setSecondsLeft(
      kind === "reading"
        ? readingSeconds(generated.body, generated.questions.length)
        : TIME_LIMIT[kind]
    );
    if (kind === "listening") {
      // Play the recording once, automatically — like the real exam.
      window.setTimeout(() => playNarration(generated.test_id, generated.body), 400);
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
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-bold tabular-nums",
                        item.band >= 7.5
                          ? "bg-danger/10 text-danger"
                          : item.band >= 6.5
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-success/10 text-success"
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

          {(() => {
            const questionsBlock = (
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
                      <p className="mt-3 rounded-lg border-l-2 border-brand-400 bg-brand-600/6 px-3 py-2 text-sm leading-6 text-ink-soft">
                        {result.explanations[qi]}
                      </p>
                    )}
                  </div>
                ))}
                {!result ? (
                  <Button fullWidth onClick={submit} disabled={answers.some((a) => a === -1)}>
                    {t.submitTest}
                  </Button>
                ) : (
                  <ResultCard result={result} t={t} onBack={backToList} />
                )}
              </>
            );

            if (kind === "reading") {
              // Exam-style split view: passage stays put on the left while the
              // learner scrolls the questions on the right (stacked on mobile).
              return (
                <div className="gap-5 lg:grid lg:grid-cols-2 lg:items-start">
                  <article className="max-h-80 overflow-y-auto rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)]">
                    <h2 className="mb-3 text-lg font-bold text-ink">{test.title}</h2>
                    <p className="whitespace-pre-line text-[15px] leading-7 text-ink">
                      {test.body}
                    </p>
                  </article>
                  <div className="mt-5 space-y-5 lg:mt-0">{questionsBlock}</div>
                </div>
              );
            }
            return (
              <>
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      disabled={!result && audioFinished}
                      onClick={() => {
                        if (audioRef.current) {
                          if (audioPlaying) audioRef.current.pause();
                          else void audioRef.current.play();
                        } else if (speech.speaking) {
                          speech.cancel();
                        } else {
                          void playNarration(test.test_id, test.body);
                        }
                      }}
                    >
                      {audioPlaying || speech.speaking ? `⏸ ${t.pause}` : `▶ ${t.replay}`}
                    </Button>
                    <p className="text-xs text-ink-soft">{t.listeningHint}</p>
                  </div>
                  {!result && (
                    <p className="text-center text-[11px] leading-4 text-ink-soft">
                      {t.listeningPlaysOnce}
                    </p>
                  )}
                </div>
                <div className="space-y-5">{questionsBlock}</div>
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
