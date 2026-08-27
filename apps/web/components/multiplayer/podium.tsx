"use client";

import { motion } from "framer-motion";

import type { ScoreRow } from "@/lib/multiplayer";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const MEDAL = ["🥇", "🥈", "🥉"];
// Podium display order: 2nd, 1st, 3rd — tallest column in the middle.
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_HEIGHT = ["h-28", "h-36", "h-20"];

export function Podium({ mp, board }: { mp: Dictionary["mp"]; board: ScoreRow[] }) {
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="text-center">
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl"
        aria-hidden
      >
        🏆
      </motion.p>
      <h2 className="mt-3 text-2xl font-extrabold text-ink">{mp.finalScore}</h2>

      {top3.length > 0 && (
        <div className="mt-8 flex items-end justify-center gap-3">
          {PODIUM_ORDER.filter((i) => top3[i]).map((i, order) => {
            const row = top3[i];
            return (
              <motion.div
                key={row.user_id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: order * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-24 flex-col items-center"
              >
                <span className="text-3xl" aria-hidden>
                  {MEDAL[i]}
                </span>
                <span className="mt-1 truncate text-sm font-bold text-ink">{row.name}</span>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-300">{row.score}</span>
                <div
                  className={cn(
                    "mt-2 w-full rounded-t-lg border border-b-0 border-brand-950/20 bg-linear-to-b from-brand-400/30 to-brand-500/10",
                    PODIUM_HEIGHT[order]
                  )}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left">
          {rest.map((row) => (
            <li
              key={row.user_id}
              className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-2.5"
            >
              <span className="w-6 text-center text-sm font-bold text-ink-soft">{row.rank}</span>
              <span className="flex-1 truncate font-semibold text-ink">{row.name}</span>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-300">{row.score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
