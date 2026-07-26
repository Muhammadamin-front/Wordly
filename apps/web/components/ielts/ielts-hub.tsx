"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Headphones,
  Lock,
  Mic2,
  PenLine,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Alert } from "@/components/ui/alert";
import { BAND_COLOR, ieltsApi, type IeltsOverview } from "@/lib/ielts";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Ielts = Dictionary["ielts"];

interface SkillCard {
  key: "reading" | "listening" | "writing" | "speaking";
  href: string; // suffix after /{lang}
  icon: LucideIcon;
  gradient: string;
  locked?: boolean;
}

const SKILLS: SkillCard[] = [
  { key: "reading", href: "ielts/reading", icon: BookOpen, gradient: "from-brand-500/24 via-accent-400/12 to-transparent" },
  { key: "listening", href: "ielts/listening", icon: Headphones, gradient: "from-brand-700/28 via-brand-400/12 to-transparent" },
  { key: "writing", href: "ielts/writing", icon: PenLine, gradient: "from-emerald-500/22 via-amber-400/12 to-transparent" },
  // Locked while the realtime AI examiner is too slow/flaky for learners.
  { key: "speaking", href: "ielts/speaking", icon: Mic2, gradient: "from-accent-500/22 via-brand-500/12 to-transparent", locked: true },
];

export function IeltsHub({ lang, t }: { lang: string; t: Ielts }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<IeltsOverview | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  useEffect(() => {
    if (!ready || !user) return;
    ieltsApi.overview().then(setOverview).catch(() => {});
  }, [ready, user]);

  if (!ready || !user) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <span className="size-8 animate-spin rounded-full border-[3px] border-brand-400 border-t-transparent" />
      </main>
    );
  }

  const bands = overview?.best_bands ?? {};
  const scored = SKILLS.map((s) => bands[s.key]).filter((b): b is number => typeof b === "number");
  const overall = scored.length
    ? Math.round((scored.reduce((a, b) => a + b, 0) / scored.length) * 2) / 2
    : null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel light-sweep flex flex-col items-center gap-6 rounded-lg p-6 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left"
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500">
            <Sparkles className="size-4" aria-hidden />
            IELTS studio
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-ink-soft sm:text-base">{t.subtitle}</p>
        </div>
        <div className="premium-card flex size-32 shrink-0 flex-col items-center justify-center rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
            {t.overallBand}
          </span>
          <span className={cn("text-3xl font-extrabold", overall ? BAND_COLOR(overall) : "text-ink-soft")}>
            {overall ?? "—"}
          </span>
        </div>
      </motion.section>

      {overview && !overview.enabled && (
        <Alert tone="info" className="mt-5">
          {t.notConfigured}
        </Alert>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {SKILLS.map((skill, i) => {
          const band = bands[skill.key];
          const Icon = skill.icon;
          const card = (
            <motion.div
              whileHover={skill.locked ? undefined : { y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={cn(
                "premium-card group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-lg bg-linear-to-br p-5",
                skill.gradient,
                skill.locked && "opacity-65 saturate-75"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="icon-tile size-12 rounded-lg text-brand-500 transition-transform group-hover:rotate-3 group-hover:scale-105">
                  <Icon className="size-5" aria-hidden />
                </span>
                {skill.locked ? (
                  <Lock className="size-5 text-ink-soft" aria-hidden />
                ) : (
                  <ArrowUpRight className="size-5 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" aria-hidden />
                )}
              </div>
              <div>
                <p className="text-xl font-extrabold text-ink">
                  {t[skill.key]}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{t[`${skill.key}Desc` as keyof Ielts]}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-soft">
                    {skill.locked
                      ? t.speakingLocked
                      : band
                        ? `${t.bestBand}: ${band.toFixed(1)}`
                        : t.notStarted}
                  </span>
                </div>
              </div>
            </motion.div>
          );
          return (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {skill.locked ? card : <Link href={`/${lang}/${skill.href}`}>{card}</Link>}
            </motion.div>
          );
        })}
      </div>

      {overview && overview.recent.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-soft">
            <BarChart3 className="size-4" aria-hidden />
            {t.recentTitle}
          </h2>
          <div className="surface-panel overflow-hidden rounded-lg">
            {overview.recent.map((item, i) => {
              const skill = SKILLS.find((s) => s.key === item.skill);
              const Icon = skill?.icon ?? Sparkles;
              return (
                <div
                  key={`${item.created_at}-${i}`}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3",
                    i > 0 && "border-t border-line"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="icon-tile size-9 rounded-lg text-brand-500">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {skill ? t[skill.key] : item.skill}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }).format(
                          new Date(item.created_at)
                        )}
                        {item.correct != null && item.total != null && (
                          <> · {item.correct}/{item.total} {t.correct}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={cn("text-lg font-extrabold tabular-nums", BAND_COLOR(item.band))}>
                    {item.band.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      <p className="mt-6 text-center text-xs text-ink-soft">{t.aiNote}</p>
    </main>
  );
}
