"use client";

import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { API_URL, waitForAccessToken } from "@/lib/api";
import { ieltsApi, type BankItem, type GeneratedTest } from "@/lib/ielts";
import { MOCK_SKILL_MINUTES, type MockSession } from "@/lib/ielts-mock";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Copy = Dictionary["ieltsMock"];
type Ielts = Dictionary["ielts"];

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** The Full Mock's Listening leg: one bank passage, played once, with no
 *  picker — a real exam doesn't let you choose your recording. Grades
 *  server-side, tags the result with this mock session, then hands the band
 *  to the orchestrator. */
export function MockListeningLeg({
  t,
  ieltsT,
  session,
  onDone,
  onAbandon,
}: {
  t: Copy;
  ieltsT: Ielts;
  session: MockSession;
  onDone: (band: number, detail: { correct: number; total: number }) => Promise<boolean>;
  onAbandon: () => void;
}) {
  const [test, setTest] = useState<GeneratedTest | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const submitRef = useRef<() => void>(() => {});

  // Natural ElevenLabs narration only — no browser speechSynthesis fallback.
  // A robotic voice reading a real exam script reads as broken, not
  // degraded, so a failure surfaces as a clear retry state instead.
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
      setAudioFailed(true);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const bank = await ieltsApi.bank("listening");
        const pick = pickBankItem(bank);
        const started = await ieltsApi.bankStart("listening", pick);
        if (cancelled) return;
        setTest(started);
        setAnswers(new Array(started.questions.length).fill(-1));
        setSecondsLeft(MOCK_SKILL_MINUTES.listening * 60);
        window.setTimeout(() => playNarration(started.test_id), 400);
      } catch {
        if (!cancelled) setError(t.error);
      }
    })();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!test) return;
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
  }, [test]);

  async function submit() {
    if (!test || submitting) return;
    setSubmitting(true);
    audioRef.current?.pause();
    try {
      const graded = await ieltsApi.submit("listening", test.test_id, answers, session.id);
      const ok = await onDone(graded.band, { correct: graded.correct, total: graded.total });
      if (!ok) {
        setError(t.error);
        setSubmitting(false);
      }
    } catch {
      setError(t.error);
      setSubmitting(false);
    }
  }
  useEffect(() => {
    submitRef.current = submit;
  });

  if (!test) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" aria-hidden />
        <p className="text-sm font-bold text-ink-soft">{t.listeningPreparing}</p>
        {error && <Alert tone="error">{error}</Alert>}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <MockLegHeader
          label={t.legListening}
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
            secondsLeft < 60 ? "bg-danger/10 text-danger" : "bg-brand-600/10 text-brand-600 dark:text-brand-300"
          )}
        >
          ⏱ {fmt(secondsLeft)}
        </span>
      </div>

      <p className="mt-3 text-sm text-ink-soft">{t.listeningIntro}</p>

      <div className="mt-4 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="size-12 shrink-0 rounded-full p-0 text-lg"
            disabled={audioFinished}
            onClick={() => {
              if (audioRef.current) {
                if (audioPlaying) audioRef.current.pause();
                else void audioRef.current.play();
              } else if (audioFailed) {
                void playNarration(test.test_id);
              }
            }}
          >
            {audioFailed ? "↻" : audioPlaying ? "⏸" : "▶"}
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{test.title}</p>
            <p className={cn("mt-1 text-[11px] leading-4", audioFailed ? "font-bold text-danger" : "text-ink-soft")}>
              {audioFailed ? t.error : ieltsT.listeningPlaysOnce}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {test.questions.map((q, qi) => (
          <div key={qi} className="rounded-2xl border border-line bg-card p-4">
            <p className="flex items-start gap-2 font-semibold text-ink">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded border border-line text-xs font-bold text-ink-soft">
                {qi + 1}
              </span>
              {q.prompt}
            </p>
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    answers[qi] === oi
                      ? "border-brand-500 bg-brand-600/10 text-ink"
                      : "border-line text-ink hover:bg-line/40"
                  )}
                >
                  <span className="font-bold">{String.fromCharCode(65 + oi)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        className="mt-5"
        loading={submitting}
        disabled={answers.some((a) => a === -1)}
        onClick={submit}
      >
        {ieltsT.submitTest}
      </Button>
    </main>
  );
}

/** Prefers a passage the learner hasn't already completed in standalone
 *  practice, so a Mock attempt doesn't hand back content they've memorised;
 *  falls back to any item once everything is done. */
function pickBankItem(bank: BankItem[]): string {
  const pool = bank.filter((item) => !item.done);
  const from = pool.length > 0 ? pool : bank;
  return from[Math.floor(Math.random() * from.length)].id;
}

export function MockLegHeader({
  label,
  exitLabel,
  onAbandon,
  exitConfirmTitle,
  exitConfirmBody,
  exitConfirmStay,
  exitConfirmLeave,
}: {
  label: string;
  exitLabel: string;
  onAbandon: () => void;
  exitConfirmTitle: string;
  exitConfirmBody: string;
  exitConfirmStay: string;
  exitConfirmLeave: string;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-xl font-black text-ink">{label}</h1>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-bold text-ink-soft underline-offset-2 hover:text-ink hover:underline"
      >
        {exitLabel}
      </button>
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-lg border border-line bg-card p-5 shadow-2xl">
            <p className="font-black text-ink">{exitConfirmTitle}</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{exitConfirmBody}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setConfirming(false)}>
                {exitConfirmStay}
              </Button>
              <Button variant="danger" fullWidth onClick={onAbandon}>
                {exitConfirmLeave}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
