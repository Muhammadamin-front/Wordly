"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { QUIZ_MODES, TIMER_OPTIONS, type QuizMode, type RoomPlayer, type TimerSeconds } from "@/lib/multiplayer";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

const MODE_ICONS: Record<QuizMode, string> = {
  vocab: "📖",
  grammar: "🧩",
  pairs: "🔗",
  mixed: "🎲",
};

export function LobbyPanel({
  mp,
  code,
  hostId,
  players,
  isHost,
  onStart,
  onLeave,
}: {
  mp: Dictionary["mp"];
  code: string;
  hostId: string;
  players: RoomPlayer[];
  isHost: boolean;
  onStart: (level: string, mode: QuizMode, timerSeconds: TimerSeconds) => void;
  onLeave: () => void;
}) {
  const [level, setLevel] = useState<string>("A1");
  const [mode, setMode] = useState<QuizMode>("vocab");
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(15);

  return (
    <div className="mt-6">
      <div className="rounded-xl2 border border-line bg-linear-to-br from-brand-500/10 to-transparent p-6 text-center">
        <p className="text-sm text-ink-soft">{mp.shareRoom}</p>
        <code className="mt-1 block text-4xl font-extrabold tracking-[0.3em] text-brand-600 dark:text-brand-300">
          {code}
        </code>
      </div>

      <p className="mt-6 text-sm font-bold uppercase tracking-wide text-ink-soft">
        {mp.players} ({players.length})
      </p>
      <ul className="mt-3 space-y-2">
        {players.map((p) => (
          <li
            key={p.user_id}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 font-semibold text-ink transition-opacity",
              !p.connected && "opacity-50"
            )}
          >
            <span
              aria-hidden
              className={cn("size-2 rounded-full", p.connected ? "bg-success" : "bg-ink-soft")}
            />
            <span className="flex-1 truncate">{p.name}</span>
            {p.user_id === hostId && <span aria-hidden>👑</span>}
            {!p.connected && <span className="text-xs text-ink-soft">{mp.reconnecting}</span>}
          </li>
        ))}
      </ul>

      {isHost ? (
        <div className="mt-6">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-ink-soft">{mp.category}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {QUIZ_MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "min-h-11 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors",
                  mode === m
                    ? "border-brand-400 bg-brand-500/10 text-ink"
                    : "border-line bg-card text-ink-soft hover:border-brand-400/50"
                )}
              >
                {MODE_ICONS[m]} {mp[`mode_${m}`]}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-ink-soft">{mp.level}</p>
          <div className="mt-2 flex justify-center gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={cn(
                  "min-h-11 min-w-11 rounded-lg px-3 text-sm font-bold transition-colors",
                  level === l ? "bg-brand-600 text-white" : "bg-card text-ink-soft hover:text-ink"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-ink-soft">{mp.timer}</p>
          <div className="mt-2 flex justify-center gap-2">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimerSeconds(t)}
                className={cn(
                  "min-h-11 min-w-11 rounded-lg px-3 text-sm font-bold transition-colors",
                  timerSeconds === t ? "bg-brand-600 text-white" : "bg-card text-ink-soft hover:text-ink"
                )}
              >
                {t}s
              </button>
            ))}
          </div>

          <Button fullWidth className="mt-5" onClick={() => onStart(level, mode, timerSeconds)}>
            {mp.start}
          </Button>
          <p className="mt-2 text-center text-xs text-ink-soft">⚡ {mp.speedHint}</p>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-ink-soft">{mp.waiting}</p>
      )}

      <Button variant="ghost" size="sm" fullWidth className="mt-3" onClick={onLeave}>
        ✕ {mp.leave}
      </Button>
    </div>
  );
}
