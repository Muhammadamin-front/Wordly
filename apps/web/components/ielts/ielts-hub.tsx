"use client";

import { motion } from "framer-motion";
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
  emoji: string;
  gradient: string;
}

const SKILLS: SkillCard[] = [
  { key: "reading", href: "ielts/reading", emoji: "📖", gradient: "from-blue-500 via-blue-700 to-blue-950" },
  { key: "listening", href: "ielts/listening", emoji: "🎧", gradient: "from-purple-500 via-purple-700 to-purple-950" },
  { key: "writing", href: "ielts/writing", emoji: "✍️", gradient: "from-emerald-500 via-emerald-700 to-emerald-950" },
  { key: "speaking", href: "ielts/speaking", emoji: "🎙️", gradient: "from-orange-500 via-orange-700 to-orange-950" },
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
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 rounded-3xl border border-brand-400/30 bg-linear-to-br from-brand-600/15 to-brand-600/5 p-8 text-center sm:flex-row sm:justify-between sm:text-left"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            🎓 {t.title}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-ink-soft sm:text-base">{t.subtitle}</p>
        </div>
        <div className="flex size-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-brand-500/30 bg-card">
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

      {/* Skill cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {SKILLS.map((skill, i) => {
          const band = bands[skill.key];
          return (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/${lang}/${skill.href}`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={cn(
                    "relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl bg-linear-to-br p-5 shadow-md ring-1 ring-black/5 hover:shadow-2xl",
                    skill.gradient
                  )}
                >
                  <span className="absolute -right-4 -top-3 text-8xl opacity-20">{skill.emoji}</span>
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                  <div className="relative z-10">
                    <p className="text-xl font-extrabold text-white">{t[skill.key]}</p>
                    <p className="mt-1 text-sm text-white/75">{t[`${skill.key}Desc` as keyof Ielts]}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white/90">
                        {band ? `${t.bestBand}: ${band.toFixed(1)}` : t.notStarted}
                      </span>
                      <span className="text-sm font-bold text-white">→</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
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
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-soft">
            📈 {t.recentTitle}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-card">
            {overview.recent.map((item, i) => {
              const skill = SKILLS.find((s) => s.key === item.skill);
              return (
                <div
                  key={`${item.created_at}-${i}`}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-3",
                    i > 0 && "border-t border-line"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="text-lg">{skill?.emoji ?? "🎓"}</span>
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
