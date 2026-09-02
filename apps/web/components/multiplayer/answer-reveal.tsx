"use client";

import { motion } from "framer-motion";

import type { RoomPlayer, ServerMessage } from "@/lib/multiplayer";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type QuestionResult = Extract<ServerMessage, { type: "question_result" }>;

export function AnswerReveal({
  mp,
  result,
  players,
  myUserId,
}: {
  mp: Dictionary["mp"];
  result: QuestionResult;
  players: RoomPlayer[];
  myUserId: string;
}) {
  const nameOf = (id: string) => players.find((p) => p.user_id === id)?.name ?? "?";
  const rows = [...result.results].sort((a, b) => b.points - a.points);

  return (
    <div className="mt-6 space-y-4">
      {result.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl2 border border-brand-400/30 bg-brand-500/5 p-5"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            {mp.explanation}
          </p>
          <p className="mt-1.5 text-lg font-bold text-ink">{result.explanation.translation_uz}</p>
          {result.explanation.example_en && (
            <p className="mt-1 text-sm italic text-ink-soft">“{result.explanation.example_en}”</p>
          )}
        </motion.div>
      )}

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.user_id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-2.5",
              row.user_id === myUserId ? "border-brand-400 bg-brand-500/5" : "border-line bg-card"
            )}
          >
            <span aria-hidden className={cn("text-lg", row.correct ? "text-success-text" : "text-ink-soft")}>
              {row.correct ? "✓" : "✕"}
            </span>
            <span className="flex-1 truncate font-semibold text-ink">{nameOf(row.user_id)}</span>
            {row.streak >= 2 && (
              <span className="text-xs font-bold text-brand-500">🔥{row.streak}</span>
            )}
            <span className="text-sm font-bold text-brand-600 dark:text-brand-300">
              +{row.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
