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
  IELTS_SKILL_CONTENT,
  IELTS_VOCABULARY_RESOURCES,
  type IeltsSkill,
} from "@/lib/ielts-resources";

interface SkillCard {
  key: IeltsSkill;
  icon: LucideIcon;
  label: string;
  count: string;
}

const SKILLS: SkillCard[] = [
  { key: "reading", icon: BookOpen, label: "O'qish", count: "8 qo'llanma" },
  { key: "listening", icon: Headphones, label: "Tinglash", count: "8 resurs" },
  { key: "writing", icon: PenLine, label: "Yozish", count: "12 essay turi" },
  { key: "speaking", icon: Mic2, label: "Gapirish", count: "120 topic" },
];

export function IeltsHub({ lang }: { lang: string; t: unknown }) {
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
              IELTS vocabulary hub
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-6xl">
              IELTS uchun kerakli tilni o&apos;rganing
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              AI baholash o&apos;rniga yuqori qiymatli statik resurslar: model javoblar,
              aniq strategiyalar, academic collocation va har bir skill uchun vocabulary.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["600+", "IELTS so'z"],
              ["120", "speaking topic"],
              ["0", "AI xarajat"],
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
            Wordly avvalo vocabulary platformasi. IELTS bu so&apos;z boyligini real imtihon
            kontekstida mustahkamlovchi qo&apos;shimcha markaz.
          </p>
        </div>
      </motion.section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase text-accent-500">4 skill</p>
            <h2 className="mt-1 text-2xl font-black text-ink">O&apos;rganish yo&apos;nalishlari</h2>
          </div>
          <Link
            href={`/${lang}/vocabulary?category=ielts`}
            className="hidden items-center gap-2 text-sm font-bold text-brand-500 sm:inline-flex"
          >
            IELTS so&apos;zlari
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SKILLS.map((skill, index) => {
            const Icon = skill.icon;
            const content = IELTS_SKILL_CONTENT[skill.key];
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
                      <h3 className="text-2xl font-black text-ink">{skill.label}</h3>
                      <span className="rounded-md bg-accent-400/10 px-2 py-1 text-[10px] font-extrabold uppercase text-accent-500">
                        {skill.count}
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
            <p className="text-xs font-extrabold uppercase text-accent-500">Lexical resource</p>
            <h2 className="text-2xl font-black text-ink">Vocabulary kutubxonasi</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {IELTS_VOCABULARY_RESOURCES.map((resource) => (
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
