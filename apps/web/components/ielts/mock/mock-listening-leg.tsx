"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ListeningQuestionInput, type ListeningAnswerValue } from "@/components/ielts/listening-question-input";
import { API_URL, waitForAccessToken } from "@/lib/api";
import { MOCK_SKILL_MINUTES, type MockSession } from "@/lib/ielts-mock";
import {
  LISTENING_FULL_TESTS,
  isListeningCorrect,
  listeningBand,
  type ListeningFullTest,
} from "@/lib/listening-practice";
import { cn } from "@/lib/utils";
import { useModalFocus } from "@/lib/use-modal-focus";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Copy = Dictionary["ieltsMock"];
type Ielts = Dictionary["ielts"];

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** The Full Mock's Listening leg: a real 4-section IELTS-format test —
 *  strictly linear (no going back between sections, matching the real
 *  exam), each section's audio played once automatically, one leg-wide
 *  timer. Content is static (see lib/listening-practice.ts); only the
 *  per-section audio is fetched, from a small backend catalog keyed by
 *  slug+section, never from a per-user generated/persisted test row. */
export function MockListeningLeg({
  t,
  ieltsT,
  slug,
  session,
  onDone,
  onAbandon,
}: {
  t: Copy;
  ieltsT: Ielts;
  slug: string;
  session: MockSession;
  onDone: (band: number, detail: { correct: number; total: number }) => Promise<boolean>;
  onAbandon: () => void;
}) {
  const test = useMemo<ListeningFullTest | undefined>(
    () => LISTENING_FULL_TESTS.find((item) => item.slug === slug),
    [slug]
  );

  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ListeningAnswerValue>>({});
  // Seeded at declaration rather than from the effect below: the leg's
  // length is known before the first render, and writing it in an effect
  // rendered a 0:00 clock for one frame before correcting itself.
  const [secondsLeft, setSecondsLeft] = useState(MOCK_SKILL_MINUTES.listening * 60);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  // Every play path is async (token, fetch, play()), so leaving the mock has
  // to be recorded explicitly: without this, a request that resolves after
  // the leg unmounted still started playback with nothing left on screen to
  // stop it.
  const disposedRef = useRef(false);
  const submitRef = useRef<() => void>(() => {});
  const section = test?.sections[sectionIndex];
  const lastSection = test ? sectionIndex === test.sections.length - 1 : false;

  /** Silences and fully releases the current clip — pausing alone leaves a
   *  live element and a blob URL behind. */
  function stopAudio() {
    const audio = audioRef.current;
    if (audio) {
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioPlaying(false);
  }

  async function playSection(sectionNumber: number) {
    if (!test) return;
    setAudioFailed(false);
    setAudioFinished(false);
    stopAudio();
    try {
      const token = await waitForAccessToken();
      const resp = await fetch(
        `${API_URL}/api/v1/ielts/mock/listening/${test.slug}/section/${sectionNumber}/audio`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: "include" }
      );
      if (!resp.ok) throw new Error(String(resp.status));
      const url = URL.createObjectURL(await resp.blob());
      if (disposedRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      const audio = new Audio(url);
      audio.onplay = () => setAudioPlaying(true);
      audio.onpause = () => setAudioPlaying(false);
      audio.onended = () => {
        setAudioPlaying(false);
        setAudioFinished(true);
      };
      audioRef.current = audio;
      audioUrlRef.current = url;
      await audio.play();
      // play() resolves a tick later; the learner may already be gone.
      if (disposedRef.current) stopAudio();
    } catch {
      stopAudio();
      if (!disposedRef.current) setAudioFailed(true);
    }
  }

  // Start section 1's audio once the test is resolved.
  useEffect(() => {
    if (!test) return;
    disposedRef.current = false;
    const timer = window.setTimeout(() => void playSection(test.sections[0].number), 400);
    return () => {
      disposedRef.current = true;
      window.clearTimeout(timer);
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.slug]);

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

  function goToNextSection() {
    if (!test || lastSection) return;
    const next = sectionIndex + 1;
    setSectionIndex(next);
    void playSection(test.sections[next].number);
  }

  async function submit() {
    if (!test || submitting) return;
    setSubmitting(true);
    stopAudio();
    try {
      const allQuestions = test.sections.flatMap((s) => s.questions);
      const correct = allQuestions.filter((q) => isListeningCorrect(q, answers[q.id])).length;
      const total = allQuestions.length;
      const { band } = listeningBand(correct, total);
      const ok = await onDone(band, { correct, total });
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

  if (!test || !section) {
    return (
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" aria-hidden />
        <p className="text-sm font-bold text-ink-soft">{t.listeningPreparing}</p>
        {error && <Alert tone="error">{error}</Alert>}
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <MockLegHeader
          label={t.legListening}
          exitLabel={t.exit}
          onAbandon={() => {
            // abandonSession() is awaited before the leg unmounts, so the
            // clip has to be cut here — otherwise it keeps playing over the
            // screen the learner just left for.
            disposedRef.current = true;
            stopAudio();
            onAbandon();
          }}
          exitConfirmTitle={t.exitConfirmTitle}
          exitConfirmBody={t.exitConfirmBody}
          exitConfirmStay={t.exitConfirmStay}
          exitConfirmLeave={t.exitConfirmLeave}
        />
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-bold tabular-nums",
            secondsLeft < 60 ? "bg-danger/10 text-danger-text" : "bg-brand-600/10 text-brand-600 dark:text-brand-300"
          )}
        >
          ⏱ {fmt(secondsLeft)}
        </span>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm font-bold text-ink-soft">
        {t.listeningSectionOf.replace("{n}", String(section.number))}
        {/* Numbers only, so it needs no translation: makes the length of the
            whole test visible from section 1, which "Section 1 of 4" alone
            does not — a learner cannot otherwise tell 10 questions from 40. */}
        <span className="tabular-nums opacity-70">
          {section.questions[0]?.number}–{section.questions[section.questions.length - 1]?.number}
          {" / "}
          {test.sections.reduce((sum, s) => sum + s.questions.length, 0)}
        </span>
      </p>
      <p className="mt-1 text-sm text-ink-soft">{section.title}</p>

      <div className="mt-4 rounded-2xl border border-line bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="size-12 shrink-0 rounded-full p-0 text-lg"
            disabled={!audioFailed && audioFinished}
            aria-label={audioPlaying ? ieltsT.pause : ieltsT.replay}
            onClick={() => {
              if (audioFailed) {
                void playSection(section.number);
              } else if (audioRef.current) {
                if (audioPlaying) audioRef.current.pause();
                else void audioRef.current.play();
              }
            }}
          >
            {audioFailed ? "↻" : audioPlaying ? "⏸" : "▶"}
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{test.title}</p>
            <p className={cn("mt-1 text-[11px] leading-4", audioFailed ? "font-bold text-danger-text" : "text-ink-soft")}>
              {audioFailed ? t.error : t.listeningIntro}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {section.questions.map((q) => {
          const promptId = `listening-question-${q.id}-prompt`;
          const instructionId = q.instruction ? `listening-question-${q.id}-instruction` : undefined;
          return (
            <div key={q.id} className="rounded-2xl border border-line bg-card p-4">
              <p id={promptId} className="flex items-start gap-2 font-semibold text-ink">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded border border-line text-xs font-bold text-ink-soft">
                  {q.number}
                </span>
                {q.prompt}
              </p>
              {q.instruction && <p id={instructionId} className="mt-1 pl-8 text-xs text-ink-soft">{q.instruction}</p>}
              <div className="mt-2 pl-8">
                <ListeningQuestionInput
                  question={q}
                  value={answers[q.id]}
                  disabled={false}
                  typeAnswerLabel={t.listeningTypeAnswer}
                  labelledBy={promptId}
                  describedBy={instructionId}
                  onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
                />
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      {lastSection ? (
        <Button fullWidth className="mt-5" loading={submitting} onClick={submit}>
          {ieltsT.submitTest}
        </Button>
      ) : (
        // Also enabled when the audio failed: the recording gates the section
        // the way the real exam does, but a failed fetch must never strand the
        // learner on section 1 with no way forward but the leg timer expiring.
        <Button
          fullWidth
          className="mt-5"
          disabled={!audioFinished && !audioFailed}
          onClick={goToNextSection}
        >
          {t.listeningContinueSection}
        </Button>
      )}
    </main>
  );
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
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  useModalFocus({
    containerRef: dialogRef,
    initialFocusRef: cancelButtonRef,
    onDismiss: () => setConfirming(false),
    enabled: confirming,
  });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="presentation">
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="listening-exit-confirm-title" tabIndex={-1} className="w-full max-w-sm rounded-lg border border-line bg-card p-5 shadow-2xl">
            <h2 id="listening-exit-confirm-title" className="font-black text-ink">{exitConfirmTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{exitConfirmBody}</p>
            <div className="mt-4 flex gap-2">
              <Button ref={cancelButtonRef} variant="secondary" fullWidth onClick={() => setConfirming(false)}>
                {exitConfirmStay}
              </Button>
              <Button variant="danger" fullWidth onClick={onAbandon}>
                {exitConfirmLeave}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
