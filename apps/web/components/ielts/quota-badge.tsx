"use client";

import { Info } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const COPY: Record<
  Locale,
  { week: string; day: string; left: string; none: string; upgrade: string; unlimited: string }
> = {
  uz: {
    week: "Bu hafta",
    day: "Bugun",
    left: "tekshiruv qoldi",
    none: "tekshiruv qolmadi",
    upgrade: "Premium",
    unlimited: "cheksiz",
  },
  ru: {
    week: "На этой неделе",
    day: "Сегодня",
    left: "проверок осталось",
    none: "проверок не осталось",
    upgrade: "Premium",
    unlimited: "без лимита",
  },
  en: {
    week: "This week",
    day: "Today",
    left: "checks left",
    none: "no checks left",
    upgrade: "Premium",
    unlimited: "unlimited",
  },
};

/** Shown above the essay box, before any work is done.
 *
 *  The allowance itself is unchanged — this only stops a learner from finding
 *  out about it by writing 250 words and pressing submit. When it runs out the
 *  submit button stays live; the ceiling is explained here instead. */
export function WritingQuotaBadge({
  lang,
  used,
  limit,
  remaining,
  period,
  className,
}: {
  lang: Locale;
  used: number;
  limit: number;
  remaining: number;
  period: "week" | "day";
  className?: string;
}) {
  const t = COPY[lang];
  const out = remaining <= 0;

  return (
    <p
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-xs font-bold",
        out
          ? "border-danger/40 bg-danger/8 text-danger-text"
          : "border-line bg-card text-ink-soft",
        className
      )}
    >
      <Info className="size-3.5 shrink-0" aria-hidden />
      <span className="tabular-nums">
        {period === "week" ? t.week : t.day}: {used}/{limit}
      </span>
      <span>{out ? t.none : `${remaining} ${t.left}`}</span>
      {out && (
        <Link
          href={`/${lang}/billing`}
          className="underline underline-offset-2 hover:no-underline"
        >
          {t.upgrade}
        </Link>
      )}
    </p>
  );
}
