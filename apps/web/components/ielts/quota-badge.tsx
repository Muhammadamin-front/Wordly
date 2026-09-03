"use client";

import { Info } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/lib/locales";
import { cn } from "@/lib/utils";

const COPY: Record<
  Locale,
  {
    week: string;
    day: string;
    left: string;
    unlimited: string;
    wallTitle: string;
    wallBody: string;
    wallCta: string;
    wallWait: string;
  }
> = {
  uz: {
    week: "Bu hafta",
    day: "Bugun",
    left: "tekshiruv qoldi",
    unlimited: "cheksiz",
    wallTitle: "Bu hafta tekshiruvlaringiz tugadi",
    wallBody: "Insho yozishda davom eting — lekin xatolaringizni ko'rmaguningizcha band ko'tarilmaydi. Premium'da tekshiruv soni cheklanmagan.",
    wallCta: "Premium'ni ko'rish",
    wallWait: "Yoki dushanbagacha kuting — limit yangilanadi.",
  },
  ru: {
    week: "На этой неделе",
    day: "Сегодня",
    left: "проверок осталось",
    unlimited: "без лимита",
    wallTitle: "Проверки на этой неделе закончились",
    wallBody: "Писать можно и дальше, но балл не растёт, пока вы не видите своих ошибок. В Premium число проверок не ограничено.",
    wallCta: "Посмотреть Premium",
    wallWait: "Или дождитесь понедельника — лимит обновится.",
  },
  en: {
    week: "This week",
    day: "Today",
    left: "checks left",
    unlimited: "unlimited",
    wallTitle: "You are out of checks this week",
    wallBody: "You can keep writing, but a band does not move until you can see your own mistakes. Premium does not cap the checks.",
    wallCta: "See Premium",
    wallWait: "Or wait until Monday, when the allowance resets.",
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

  // Running out is the moment the allowance is felt rather than read about,
  // and so the moment the upgrade is worth explaining properly. A one-word
  // link here reads as a wall; this says what is lost, what is offered, and
  // that waiting is a real option — because it is.
  if (out) {
    return (
      <div
        className={cn(
          "rounded-xl border border-accent-500/45 bg-accent-400/10 p-4",
          className
        )}
      >
        <p className="inline-flex items-center gap-2 text-sm font-black text-ink">
          <Info className="size-4 shrink-0 text-accent-600 dark:text-accent-300" aria-hidden />
          {t.wallTitle}
          <span className="tabular-nums font-bold text-ink-soft">
            ({used}/{limit})
          </span>
        </p>
        <p className="mt-2 max-w-[60ch] text-[0.8125rem] leading-6 text-ink-soft">{t.wallBody}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/${lang}/billing`}
            className="inline-flex min-h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-black text-white transition-colors hover:bg-brand-700"
          >
            {t.wallCta}
          </Link>
          <span className="text-xs text-ink-soft">{t.wallWait}</span>
        </div>
      </div>
    );
  }

  return (
    <p
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-card px-3 py-2 text-xs font-bold text-ink-soft",
        className
      )}
    >
      <Info className="size-3.5 shrink-0" aria-hidden />
      <span className="tabular-nums">
        {period === "week" ? t.week : t.day}: {used}/{limit}
      </span>
      <span>{`${remaining} ${t.left}`}</span>
    </p>
  );
}
