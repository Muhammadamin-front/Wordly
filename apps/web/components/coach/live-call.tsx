"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { CHARACTER_THEMES } from "@/components/coach/characters";
import { useLiveVoice } from "@/components/coach/use-live-voice";
import { useSpeech } from "@/components/coach/use-speech";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Character, CoachSession } from "@/lib/coach";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Coach = Dictionary["coach"];

interface Exchange {
  role: "user" | "assistant";
  text: string;
}

const ERROR_CODES: Record<string, keyof Coach> = {
  mic_denied: "callMicDenied",
  stt_unavailable: "callUnavailable",
  ai_unavailable: "callUnavailable",
  stt_connect_failed: "callUnavailable",
  quota: "quotaOut",
  unauthorized: "error",
  connection: "callUnavailable",
};

export function LiveCall({
  character,
  session,
  t,
  onExit,
}: {
  character: Character;
  session: CoachSession;
  t: Coach;
  onExit: () => void;
}) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [errorKey, setErrorKey] = useState<keyof Coach | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const speech = useSpeech();
  const theme = CHARACTER_THEMES[character.key];

  const { status, transcript, start, stop } = useLiveVoice({
    sessionId: session.id,
    onUserTurn: (text) => setExchanges((prev) => [...prev, { role: "user", text }]),
    onReply: (text) => {
      setExchanges((prev) => [...prev, { role: "assistant", text }]);
      speech.speak(text, { pitch: character.pitch, rate: character.rate });
    },
    onReward: (reward) => {
      if (reward.xp_gained > 0) {
        setXpToast(reward.xp_gained);
        window.setTimeout(() => setXpToast(null), 2200);
      }
    },
    onError: (code) => setErrorKey(ERROR_CODES[code] ?? "error"),
  });

  const speaking = speech.speaking;

  function endCall() {
    speech.cancel();
    stop();
    onExit();
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-between py-6">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={endCall}
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          ← {t.back}
        </button>
        <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger-text">
          ● {t.liveCall}
        </span>
      </div>

      {/* Orb + status */}
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={status === "idle" || status === "error" ? () => { setErrorKey(null); void start(); } : undefined}
          className="relative flex size-44 items-center justify-center rounded-full"
          aria-label={status === "live" ? t.speaking : t.tapToStart}
        >
          {/* Pulsing rings while active */}
          <AnimatePresence>
            {status === "live" &&
              [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    speaking ? "bg-brand-500/20" : "bg-success/20"
                  )}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>

          <motion.span
            className={cn(
              "relative flex size-40 items-center justify-center rounded-full bg-linear-to-br text-6xl shadow-xl",
              theme.gradient
            )}
            animate={
              status === "live"
                ? { scale: speaking ? [1, 1.06, 1] : [1, 1.03, 1] }
                : { scale: 1 }
            }
            transition={{ duration: speaking ? 0.5 : 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {character.emoji}
          </motion.span>
        </button>

        <div className="text-center">
          <p className="text-lg font-bold text-ink">{character.name}</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            {status === "connecting" && t.connecting}
            {status === "idle" && t.tapToStart}
            {status === "error" && t.tapToStart}
            {status === "live" && (speaking ? t.speaking : t.speakNow)}
          </p>
        </div>

        {/* Live caption of the current utterance */}
        {transcript && (
          <p className="max-w-md rounded-2xl bg-brand-600/5 px-4 py-2 text-center text-sm italic text-ink-soft">
            {transcript}
          </p>
        )}
      </div>

      {/* Recent exchanges (latest first, compact) */}
      <div className="w-full max-w-md space-y-2">
        {errorKey && (
          <Alert tone="error" className="mb-2">
            {t[errorKey]}
          </Alert>
        )}
        {exchanges.slice(-3).map((ex, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl px-3 py-2 text-sm",
              ex.role === "user"
                ? "bg-brand-600/10 text-ink"
                : cn("text-ink", theme.bubble)
            )}
          >
            <span className="mr-1 text-xs font-bold text-ink-soft">
              {ex.role === "user" ? t.you : character.name}:
            </span>
            {ex.text}
          </div>
        ))}

        <Button variant="secondary" fullWidth onClick={endCall} className="mt-2">
          {t.endCall}
        </Button>
      </div>

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
