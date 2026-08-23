"use client";

import { motion } from "framer-motion";

import type { PersonalSummary as Summary } from "@/lib/multiplayer";
import type { Dictionary } from "@/app/[lang]/dictionaries";

function formatMs(ms: number | null): string {
  return ms === null ? "—" : `${(ms / 1000).toFixed(1)}s`;
}

function categoryLabel(mp: Dictionary["mp"], key: string): string {
  return (mp as unknown as Record<string, string>)[`mode_${key}`] ?? key;
}

export function PersonalSummary({ mp, summary }: { mp: Dictionary["mp"]; summary: Summary }) {
  const stats: { label: string; value: string }[] = [
    { label: mp.statScore, value: String(summary.score) },
    { label: mp.statRank, value: summary.rank ? `#${summary.rank}` : "—" },
    { label: mp.statAccuracy, value: `${summary.accuracy}%` },
    { label: mp.statCorrect, value: `${summary.correct_count}/${summary.total}` },
    { label: mp.statAvgTime, value: formatMs(summary.avg_response_ms) },
    { label: mp.statFastest, value: formatMs(summary.fastest_response_ms) },
    { label: mp.statBestStreak, value: `🔥${summary.best_streak}` },
  ];

  const categories = Object.entries(summary.category_accuracy);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mx-auto max-w-md rounded-xl2 border border-line bg-card p-6"
    >
      <h3 className="text-center text-sm font-bold uppercase tracking-wide text-ink-soft">{mp.yourSummary}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-raised px-3 py-2.5 text-center">
            <p className="text-lg font-extrabold text-ink">{s.value}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="mt-4 space-y-2">
          {categories.map(([key, accuracy]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
                <span className="capitalize">{categoryLabel(mp, key)}</span>
                <span>{accuracy}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
