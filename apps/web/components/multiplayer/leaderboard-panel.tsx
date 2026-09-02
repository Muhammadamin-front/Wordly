"use client";

import { LayoutGroup, motion } from "framer-motion";

import type { ServerMessage } from "@/lib/multiplayer";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Leaderboard = Extract<ServerMessage, { type: "leaderboard" }>;

export function LeaderboardPanel({
  mp,
  leaderboard,
  myUserId,
}: {
  mp: Dictionary["mp"];
  leaderboard: Leaderboard;
  myUserId: string;
}) {
  return (
    <div>
      <p className="text-center text-xs font-bold uppercase tracking-wide text-ink-soft">
        {mp.standings} · {leaderboard.index + 1}/{leaderboard.total}
      </p>
      <LayoutGroup>
        <ul className="mt-4 space-y-2">
          {leaderboard.board.map((row) => {
            const rose = row.previous_rank !== null && row.rank < row.previous_rank;
            const fell = row.previous_rank !== null && row.rank > row.previous_rank;
            return (
              <motion.li
                layout
                layoutId={row.user_id}
                key={row.user_id}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3",
                  row.user_id === myUserId ? "border-brand-400 bg-brand-500/5" : "border-line bg-card"
                )}
              >
                <span className="w-6 text-center text-sm font-bold text-ink-soft">{row.rank}</span>
                <span className="flex-1 truncate font-semibold text-ink">{row.name}</span>
                {row.delta > 0 && (
                  <span className="text-xs font-bold text-brand-500">+{row.delta}</span>
                )}
                {rose && (
                  <span aria-hidden className="text-success-text">
                    ▲
                  </span>
                )}
                {fell && (
                  <span aria-hidden className="text-danger-text">
                    ▼
                  </span>
                )}
                <span className="w-14 text-right text-sm font-bold text-brand-600 dark:text-brand-300">
                  {row.score}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </LayoutGroup>
    </div>
  );
}
