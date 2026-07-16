"use client";

import { motion } from "framer-motion";

import type { Cheatsheet } from "@/lib/ielts-content";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Ielts = Dictionary["ielts"];

/** The strategy panel shown before practice: how to score high + common traps. */
export function CheatsheetPanel({ sheet, t }: { sheet: Cheatsheet; t: Ielts }) {
  return (
    <div className="space-y-5">
      <p className="rounded-2xl border border-brand-400/30 bg-brand-600/5 p-4 text-sm leading-relaxed text-ink">
        {sheet.intro}
      </p>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
          🏆 {t.tipsTitle}
        </h2>
        <div className="mt-3 space-y-3">
          {sheet.tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 rounded-2xl border border-line bg-card p-4"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-sm font-extrabold text-brand-600 dark:text-brand-300">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-ink">{tip.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{tip.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">
          ⚠️ {t.mistakesTitle}
        </h2>
        <div className="mt-3 space-y-2">
          {sheet.mistakes.map((mistake, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-2.5 text-sm text-ink"
            >
              <span className="mt-0.5 text-danger">✗</span>
              {mistake}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
