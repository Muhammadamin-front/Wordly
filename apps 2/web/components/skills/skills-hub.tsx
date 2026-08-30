"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Headphones, Mic2, PenLine, Puzzle, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const SECTIONS = [
  { key: "listening", icon: Headphones, accent: "from-brand-600/24 via-accent-400/10 to-transparent" },
  { key: "reading", icon: BookOpen, accent: "from-emerald-500/20 via-brand-400/10 to-transparent" },
  { key: "writing", icon: PenLine, accent: "from-accent-500/20 via-brand-400/10 to-transparent" },
  { key: "speaking", icon: Mic2, accent: "from-orange-500/20 via-accent-400/10 to-transparent" },
  { key: "grammar", icon: Puzzle, accent: "from-brand-700/24 via-brand-400/10 to-transparent" },
] satisfies Array<{
  key: keyof Pick<Dictionary["skills"], "listening" | "reading" | "writing" | "speaking" | "grammar">;
  icon: LucideIcon;
  accent: string;
}>;

export function SkillsHub({ lang, skills }: { lang: string; skills: Dictionary["skills"] }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(`/${lang}/auth/login`);
  }, [ready, user, router, lang]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <section className="surface-panel light-sweep rounded-lg p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500">
          <Sparkles className="size-4" aria-hidden />
          Skill lab
        </span>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {skills.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft sm:text-base">
          {skills.subtitle}
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ key, icon: Icon, accent }, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/${lang}/skills/${key}`}
              className={`premium-card group flex min-h-56 flex-col justify-between rounded-lg bg-linear-to-br ${accent} p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="icon-tile size-12 rounded-lg text-brand-500 transition-transform group-hover:rotate-3 group-hover:scale-105">
                  <Icon className="size-5" aria-hidden />
                </span>
                <ArrowUpRight className="size-5 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" aria-hidden />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-ink">{skills[key].name}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{skills[key].desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
