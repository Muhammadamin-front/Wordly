"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
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
  { key: "writing", icon: PenLine, count: 12, countKey: "essayTypes" },
  { key: "reading", icon: BookOpen, count: 8, countKey: "guides" },
  { key: "speaking", icon: Mic2, count: 120, countKey: "topics" },
  { key: "listening", icon: Headphones, count: 8, countKey: "resources" },
];

export function IeltsHub({ lang, t }: { lang: string; t: Dictionary["ieltsHub"] }) {
  const vocabularyResources = ieltsVocabularyResources(lang);
  return (
    <main className="app-container page-stack flex-1">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel overflow-hidden rounded-[18px]"
      >
        <div className="relative grid gap-8 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <span aria-hidden className="absolute -right-6 -top-10 font-display text-[11rem] leading-none tracking-wide text-brand-600/8">IELTS</span>
          <div>
            <span className="print-label inline-flex items-center gap-2 border-accent-500 bg-accent-400/10 text-accent-600">
              <Sparkles className="size-4" aria-hidden />
              {t.eyebrow}
            </span>
            <h1 className="type-h1 mt-5 max-w-3xl text-ink">
              {t.title}
            </h1>
            <p className="type-body mt-4 max-w-2xl text-ink-soft">
              {t.subtitle}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${lang}/vocabulary?category=ielts`}>
                <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-brand-950 bg-primary px-5 text-sm font-bold text-white shadow-[3px_4px_0_#54250f] transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[5px_6px_0_#54250f] dark:text-brand-50">
                  {t.ieltsWords}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
              <Link href={`/${lang}/ielts/writing`}>
                <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-raised px-5 text-sm font-bold text-ink shadow-[2px_3px_0_rgb(84,37,15,0.16)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-hover hover:text-primary">
                  {t.writing}
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </Link>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-2 rounded-[14px] border-2 border-line bg-card p-2 shadow-[4px_5px_0_rgb(84,37,15,0.16)]">
            {[
              ["600+", t.ieltsWords],
              ["120", t.topics],
              [String(vocabularyResources.length), t.resources],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[10px] bg-raised p-3 text-center">
                <p className="font-display text-3xl tracking-wide text-ink sm:text-4xl">{value}</p>
                <p className="type-caption mt-1 text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-line bg-brand-600/8 px-6 py-3 dark:bg-brand-950/45 sm:px-8">
          <p className="flex items-center gap-2 text-xs font-bold text-brand-800 dark:text-ink-soft">
            <LibraryBig className="size-4 text-accent-500" aria-hidden />
            {t.brandNote}
          </p>
        </div>
      </motion.section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="type-label text-accent-500">{t.skillsKicker}</p>
            <h2 className="type-h2 mt-1 text-ink">{t.skillsTitle}</h2>
          </div>
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
                  className="premium-card group flex min-h-44 flex-col rounded-[14px] p-5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="icon-tile size-12 rounded-lg text-brand-500">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <ArrowUpRight className="size-5 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                  </div>
                  <div className="mt-auto pt-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="type-h3 text-ink">{t[skill.key]}</h3>
                      <span className="print-label border-accent-500 bg-accent-400/10 px-2 py-1 text-[10px] text-accent-600">
                        {skill.count} {t[skill.countKey]}
                      </span>
                    </div>
                    <p className="type-body-small mt-2 max-w-lg text-ink-soft">
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
            <p className="type-label text-accent-500">{t.vocabularyKicker}</p>
            <h2 className="type-h3 text-ink">{t.vocabularyTitle}</h2>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {vocabularyResources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/${lang}/ielts/resources/${resource.slug}`}
              className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-card p-4 shadow-[2px_3px_0_rgb(84,37,15,0.12)] transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-400 hover:bg-raised"
            >
              <span>
                <p className="type-caption text-accent-500">{resource.eyebrow}</p>
                <h3 className="mt-1 text-sm font-bold leading-5 text-ink">{resource.title}</h3>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
