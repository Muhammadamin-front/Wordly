"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { CHARACTER_THEMES } from "@/components/coach/characters";
import { useSpeech, useSpeechRecognition } from "@/components/coach/use-speech";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import {
  coachApi,
  type Character,
  type CoachMessage,
  type CoachSession,
  type Correction,
  type IeltsReport,
} from "@/lib/coach";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Coach = Dictionary["coach"];

function errorMessage(err: unknown, t: Coach): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return t.quotaOut;
    if (err.status === 503) return t.notConfigured;
  }
  return t.error;
}

/** Animated bars — react to the mic (listening) or the character (speaking). */
function WaveBars({ active, className }: { active: boolean; className?: string }) {
  return (
    <div className={cn("flex items-end gap-1", className)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-current"
          animate={active ? { height: [6, 18, 6] } : { height: 6 }}
          transition={
            active
              ? { duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}

function CorrectionCard({ correction }: { correction: Correction }) {
  return (
    <div className="mt-1.5 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-xs">
      <p className="font-semibold text-ink-soft line-through decoration-warning/70">
        {correction.original}
      </p>
      <p className="mt-0.5 font-bold text-success">✓ {correction.correction}</p>
      {correction.explanation && (
        <p className="mt-1 text-ink-soft">{correction.explanation}</p>
      )}
    </div>
  );
}

function Bubble({
  message,
  character,
  t,
}: {
  message: CoachMessage;
  character: Character;
  t: Coach;
}) {
  const isUser = message.role === "user";
  const theme = CHARACTER_THEMES[character.key];
  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex max-w-[85%] gap-2", isUser && "flex-row-reverse")}>
        {!isUser && <span className="mt-0.5 text-xl">{character.emoji}</span>}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "rounded-br-sm bg-brand-600 text-white"
              : cn("rounded-bl-sm border border-line text-ink", theme.bubble)
          )}
        >
          {message.content}
        </div>
      </div>
      {isUser && message.corrections.length > 0 && (
        <div className="mt-1 w-full max-w-[85%]">
          <p className="text-[11px] font-bold uppercase tracking-wide text-warning">
            {t.corrections}
          </p>
          {message.corrections.map((c, i) => (
            <CorrectionCard key={i} correction={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function BandReport({ report, t }: { report: IeltsReport; t: Coach }) {
  const criteria: [string, number][] = [
    [t.fluency, report.fluency],
    [t.lexical, report.lexical],
    [t.grammar, report.grammar],
    [t.pronunciation, report.pronunciation],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-line bg-card p-5"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-blue-600 text-white">
          <span className="text-[10px] font-semibold uppercase opacity-80">{t.bandScore}</span>
          <span className="text-2xl font-extrabold">{report.band_overall.toFixed(1)}</span>
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
      <ReportSection title={t.strengths} body={report.strengths} />
      <ReportSection title={t.improvements} body={report.improvements} />
      <ReportSection title={t.homework} body={report.homework} />
    </motion.div>
  );
}

function ReportSection({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</p>
      <p className="mt-0.5 whitespace-pre-line text-sm text-ink">{body}</p>
    </div>
  );
}

export function VoiceChat({
  character,
  session: initialSession,
  t,
  onExit,
}: {
  character: Character;
  session: CoachSession;
  t: Coach;
  onExit: () => void;
}) {
  const [messages, setMessages] = useState<CoachMessage[]>(initialSession.messages);
  const [session, setSession] = useState(initialSession);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [report, setReport] = useState<IeltsReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [xpToast, setXpToast] = useState<number | null>(null);

  const recognition = useSpeechRecognition("en-US");
  const speech = useSpeech();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const theme = CHARACTER_THEMES[character.key];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, report]);

  const speakReply = useCallback(
    (text: string) => {
      if (autoSpeak) speech.speak(text, { pitch: character.pitch, rate: character.rate });
    },
    [autoSpeak, speech, character.pitch, character.rate]
  );

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;
      setDraft("");
      recognition.reset();
      setError(null);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed, corrections: [], created_at: new Date().toISOString() },
      ]);
      setPending(true);
      try {
        const res = await coachApi.sendMessage(session.id, trimmed);
        setMessages((prev) => {
          const next = [...prev];
          // Attach the graded corrections to the just-sent user turn.
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "user") {
              next[i] = { ...next[i], corrections: res.corrections };
              break;
            }
          }
          return [
            ...next,
            {
              role: "assistant",
              content: res.reply,
              corrections: [],
              created_at: new Date().toISOString(),
            },
          ];
        });
        setSession((prev) => ({ ...prev, turns: prev.turns + 1 }));
        if (res.reward.xp_gained > 0) {
          setXpToast(res.reward.xp_gained);
          window.setTimeout(() => setXpToast(null), 2200);
        }
        speakReply(res.reply);
      } catch (err) {
        setError(errorMessage(err, t));
        setMessages((prev) => prev.slice(0, -1)); // roll back the optimistic user turn
      } finally {
        setPending(false);
      }
    },
    [pending, recognition, session.id, speakReply, t]
  );

  function toggleMic() {
    if (recognition.listening) {
      recognition.stop();
      const text = recognition.transcript.trim();
      if (text) void submit(text);
    } else {
      speech.cancel();
      recognition.start();
    }
  }

  async function finishAndScore() {
    if (scoring) return;
    setScoring(true);
    setError(null);
    try {
      const res = await coachApi.score(session.id);
      setReport(res.report);
      setSession((prev) => ({ ...prev, status: "done" }));
      if (res.reward.xp_gained > 0) {
        setXpToast(res.reward.xp_gained);
        window.setTimeout(() => setXpToast(null), 2200);
      }
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setScoring(false);
    }
  }

  const isIelts = session.mode === "ielts";
  const finished = session.status === "done";
  const liveTranscript = recognition.listening
    ? `${recognition.transcript} ${recognition.interim}`.trim()
    : "";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => {
            speech.cancel();
            recognition.stop();
            onExit();
          }}
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          ← {t.back}
        </button>
        <div
          className={cn(
            "ml-1 flex size-10 items-center justify-center rounded-full bg-linear-to-br text-xl ring-2",
            theme.gradient,
            theme.accent
          )}
        >
          {character.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">
            {character.name}
            {isIelts && (
              <span className="ml-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">
                IELTS {t.ieltsPart} {session.ielts_part}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            {speech.speaking ? (
              <>
                <WaveBars active className="text-brand-600" />
                {t.speaking}
              </>
            ) : (
              <span className="truncate">{character.tagline}</span>
            )}
          </div>
        </div>
        {speech.supported && (
          <button
            type="button"
            onClick={() => setAutoSpeak((v) => !v)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              autoSpeak ? "bg-brand-600 text-white" : "bg-line/60 text-ink-soft"
            )}
            title={t.autoSpeak}
          >
            {autoSpeak ? "🔊" : "🔇"}
          </button>
        )}
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 pt-8 text-center">
            <div
              className={cn(
                "flex size-20 items-center justify-center rounded-full bg-linear-to-br text-4xl",
                theme.gradient
              )}
            >
              {character.emoji}
            </div>
            <p className="text-sm font-semibold text-ink">{character.name}</p>
            <p className="max-w-xs text-xs text-ink-soft">
              {isIelts ? t.ieltsIntro : t.chatIntro}
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} message={m} character={character} t={t} />
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-ink-soft">
            <span className="text-xl">{character.emoji}</span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-2 rounded-full bg-ink-soft/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </span>
          </div>
        )}
        {report && <BandReport report={report} t={t} />}
      </div>

      {error && (
        <Alert tone="error" className="mb-2">
          {error}
        </Alert>
      )}

      {/* Composer */}
      {!finished ? (
        <div className="border-t border-line pt-3">
          {liveTranscript && (
            <p className="mb-2 rounded-lg bg-brand-600/5 px-3 py-2 text-sm italic text-ink-soft">
              {liveTranscript}
            </p>
          )}
          <div className="flex items-end gap-2">
            {recognition.supported && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={pending}
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-full text-xl transition-all disabled:opacity-50",
                  recognition.listening
                    ? "bg-danger text-white shadow-lg ring-4 ring-danger/30"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                )}
                title={recognition.listening ? t.micStop : t.micStart}
              >
                {recognition.listening ? <WaveBars active /> : "🎤"}
              </button>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit(draft);
              }}
              className="flex flex-1 items-end gap-2"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit(draft);
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder={t.typePlaceholder}
                className="max-h-28 flex-1 resize-none rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink focus:border-brand-400 focus:outline-none"
              />
              <Button type="submit" loading={pending} disabled={!draft.trim()}>
                {t.send}
              </Button>
            </form>
          </div>
          {isIelts && session.turns > 0 && (
            <Button
              variant="secondary"
              fullWidth
              className="mt-3"
              loading={scoring}
              onClick={finishAndScore}
            >
              🎯 {t.finishScore}
            </Button>
          )}
        </div>
      ) : (
        <div className="border-t border-line pt-3">
          <Button fullWidth onClick={onExit}>
            {t.newSession}
          </Button>
        </div>
      )}

      {/* XP toast */}
      <AnimatePresence>
        {xpToast !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg"
          >
            +{xpToast} XP ✨
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
