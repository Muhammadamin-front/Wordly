"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Headphones,
  LibraryBig,
  Mic2,
  PenLine,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import {
  ieltsSkillContent,
  ieltsVocabularyResources,
  type IeltsSkill,
} from "@/lib/ielts-resources";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface SkillCard {
  key: IeltsSkill;
  icon: LucideIcon;
  count: number;
  countKey: "guides" | "resources" | "essayTypes" | "topics";
}

const SKILLS: SkillCard[] = [
  { key: "reading", icon: BookOpen, count: 8, countKey: "guides" },
  { key: "listening", icon: Headphones, count: 8, countKey: "resources" },
  { key: "writing", icon: PenLine, count: 12, countKey: "essayTypes" },
  { key: "speaking", icon: Mic2, count: 120, countKey: "topics" },
];

export function IeltsHub({ lang, t }: { lang: string; t: Dictionary["ieltsHub"] }) {
  const vocabularyResources = ieltsVocabularyResources(lang);
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel overflow-hidden rounded-lg"
      >
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-accent-400/25 bg-accent-400/10 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500">
              <Sparkles className="size-4" aria-hidden />
              {t.eyebrow}
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-6xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {t.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["600+", t.ieltsWords],
              ["120", t.topics],
              [String(vocabularyResources.length), t.resources],
            ].map(([value, label]) => (
              <div key={label} className="premium-card rounded-lg p-3 text-center">
                <p className="text-xl font-black text-ink sm:text-2xl">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-line bg-brand-600/6 px-6 py-3 dark:bg-brand-950/45 sm:px-8">
          <p className="flex items-center gap-2 text-xs font-bold text-brand-800 dark:text-ink-soft">
            <LibraryBig className="size-4 text-accent-500" aria-hidden />
            {t.wordlyNote}
          </p>
        </div>
      </motion.section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase text-accent-500">{t.skillsKicker}</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{t.skillsTitle}</h2>
          </div>
          <Link
            href={`/${lang}/vocabulary?category=ielts`}
            className="hidden items-center gap-2 text-sm font-bold text-brand-500 sm:inline-flex"
          >
            {t.ieltsWords}
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SKILLS.map((skill, index) => {
            const Icon = skill.icon;
            const content = ieltsSkillContent(lang, skill.key);
            return (
              <motion.div
                key={skill.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/${lang}/ielts/${skill.key}`}
                  className="premium-card group flex min-h-64 flex-col rounded-lg p-5 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="icon-tile size-12 rounded-lg text-brand-500">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <ArrowUpRight className="size-5 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                  </div>
                  <div className="mt-auto pt-8">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-ink">{t[skill.key]}</h3>
                      <span className="rounded-md bg-accent-400/10 px-2 py-1 text-[10px] font-extrabold uppercase text-accent-500">
                        {skill.count} {t[skill.countKey]}
                      </span>
                    </div>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-ink-soft">
                      {content.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="icon-tile size-10 rounded-lg text-accent-500">
            <ChartNoAxesCombined className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase text-accent-500">{t.vocabularyKicker}</p>
            <h2 className="text-2xl font-black text-ink">{t.vocabularyTitle}</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {vocabularyResources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/${lang}/ielts/resources/${resource.slug}`}
              className="premium-card group rounded-lg p-4 transition-transform hover:-translate-y-1"
            >
              <p className="text-[10px] font-extrabold uppercase text-accent-500">
                {resource.eyebrow}
              </p>
              <h3 className="mt-2 text-base font-black leading-5 text-ink">{resource.title}</h3>
              <ArrowUpRight className="mt-5 size-4 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
