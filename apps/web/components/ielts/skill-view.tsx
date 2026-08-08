"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Check,
  CircleDot,
  Headphones,
  ListChecks,
  Mic2,
  PenLine,
  Quote,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import {
  ieltsSkillContent,
  ieltsVocabularyResources,
  speakingTopicGroups,
  type IeltsResourceSection,
  type IeltsSkill,
} from "@/lib/ielts-resources";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const SKILL_META: Record<IeltsSkill, { icon: LucideIcon }> = {
  reading: { icon: BookOpen },
  listening: { icon: Headphones },
  writing: { icon: PenLine },
  speaking: { icon: Mic2 },
};

export function SkillView({
  lang,
  skill,
  t,
}: {
  lang: string;
  skill: IeltsSkill;
  t: Dictionary["ieltsHub"];
}) {
  const content = ieltsSkillContent(lang, skill);
  const vocabularyResources = ieltsVocabularyResources(lang);
  const meta = SKILL_META[skill];
  const Icon = meta.icon;

  useEffect(() => {
    trackEvent("ielts_skill_opened", {
      locale: lang,
      skill,
      section_count: content.sections.length,
    });
  }, [content.sections.length, lang, skill]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href={`/${lang}/ielts`}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-card/60 px-3 py-2 text-sm font-bold text-ink-soft transition-transform hover:-translate-y-0.5 hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t.center}
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-panel mt-5 rounded-lg p-6 sm:p-8"
      >
        <div className="grid gap-7 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-accent-400/25 bg-accent-400/10 px-3 py-1.5 text-xs font-extrabold uppercase text-accent-500">
              <Icon className="size-4" aria-hidden />
              {content.eyebrow}
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-ink sm:text-6xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">
              {content.description}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {content.stats.map((stat) => (
              <div key={stat.label} className="premium-card rounded-lg p-3 text-center">
                <p className="text-xl font-black text-ink sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase text-ink-soft">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label={t.pageSections}>
        {content.sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 rounded-lg border border-line bg-card/60 px-3 py-2 text-xs font-bold text-ink-soft transition-colors hover:border-brand-400/50 hover:text-ink"
          >
            {section.title}
          </a>
        ))}
        {skill === "speaking" && (
          <a
            href="#topics"
            className="shrink-0 rounded-lg border border-line bg-card/60 px-3 py-2 text-xs font-bold text-ink-soft transition-colors hover:border-brand-400/50 hover:text-ink"
          >
            120 {t.topics}
          </a>
        )}
      </nav>

      <div className="mt-5 space-y-5">
        {content.sections.map((section, index) => (
          <GuideSection key={section.id} section={section} index={index} t={t} />
        ))}
      </div>

      {skill === "speaking" && <SpeakingTopics lang={lang} t={t} />}

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="icon-tile size-10 rounded-lg text-accent-500">
            <BookMarked className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase text-accent-500">
              {t.vocabularyNext}
            </p>
            <h2 className="text-2xl font-black text-ink">{t.continueVocabulary}</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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

function GuideSection({
  section,
  index,
  t,
}: {
  section: IeltsResourceSection;
  index: number;
  t: Dictionary["ieltsHub"];
}) {
  return (
    <motion.section
      id={section.id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: Math.min(index * 0.03, 0.15) }}
      className="surface-panel scroll-mt-24 rounded-lg p-5 sm:p-6"
    >
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-extrabold uppercase text-accent-500">{section.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{section.title}</h2>
          <p className="mt-3 text-sm leading-7 text-ink-soft">{section.description}</p>
        </div>

        <div className="space-y-3">
          {section.steps && (
            <div className="rounded-lg border border-line bg-card/60 p-4">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-ink">
                <ListChecks className="size-4 text-brand-500" aria-hidden />
                {t.stepByStep}
              </h3>
              <ol className="mt-3 space-y-2">
                {section.steps.map((step, stepIndex) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-ink-soft">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-600/10 text-[11px] font-black text-brand-500">
                      {stepIndex + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {section.example && (
            <div className="rounded-lg border border-accent-400/20 bg-accent-400/5 p-4">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-ink">
                <Quote className="size-4 text-accent-500" aria-hidden />
                {t.modelExample}
              </h3>
              <p className="mt-3 border-l-2 border-accent-400/40 pl-4 text-sm leading-7 text-ink">
                {section.example}
              </p>
            </div>
          )}

          {section.vocabulary && (
            <div className="rounded-lg border border-line bg-card/60 p-4">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-ink">
                <Sparkles className="size-4 text-accent-500" aria-hidden />
                {t.vocabularyHighlight}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {section.vocabulary.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-brand-400/20 bg-brand-600/8 px-2.5 py-1.5 text-xs font-bold leading-5 text-ink"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {section.traps && (
            <div className="rounded-lg border border-warning/20 bg-warning/8 p-4">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-ink">
                <AlertTriangle className="size-4 text-warning" aria-hidden />
                {t.commonTraps}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.traps.map((trap) => (
                  <li key={trap} className="flex gap-2 text-sm leading-6 text-ink-soft">
                    <CircleDot className="mt-1 size-3.5 shrink-0 text-warning" aria-hidden />
                    {trap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function SpeakingTopics({ lang, t }: { lang: string; t: Dictionary["ieltsHub"] }) {
  const groups = speakingTopicGroups(lang);
  const topicCount = groups.reduce((total, group) => total + group.topics.length, 0);
  return (
    <section id="topics" className="mt-8 scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase text-accent-500">{t.cueCardBank}</p>
          <h2 className="mt-1 text-2xl font-black text-ink">{topicCount} {t.commonTopics}</h2>
        </div>
        <span className="rounded-lg border border-line bg-card/60 px-3 py-2 text-xs font-bold text-ink-soft">
          {groups.length} {t.topicFamilies}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ group, topics }) => (
          <div key={group} className="premium-card rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-ink">
              <Target className="size-4 text-brand-500" aria-hidden />
              {group}
            </h3>
            <ul className="mt-3 space-y-2">
              {topics.map((topic) => (
                <li key={topic} className="flex gap-2 text-xs leading-5 text-ink-soft">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent-500" aria-hidden />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/20 bg-success/8 p-4 text-sm text-ink-soft">
        <BadgeCheck className="size-5 shrink-0 text-success" aria-hidden />
        {t.dailyChallenge}
      </div>
    </section>
  );
}
