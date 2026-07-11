"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Briefcase,
  Crown,
  GraduationCap,
  Landmark,
  Lightbulb,
  Link2,
  Lock,
  PenTool,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { ProgressBar } from "@/components/library/progress-bar";
import type { ShelfMeta } from "@/lib/library";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  a1: Sprout,
  a2: BookOpen,
  b1: BookMarked,
  b2: GraduationCap,
  c1: Lightbulb,
  c2: Crown,
  ielts: Target,
  toefl: Landmark,
  sat: PenTool,
  phrasal: Link2,
  idioms: Lightbulb,
  business: Briefcase,
};

export interface ShelfStrings {
  name: string;
  desc: string;
}

export function LevelCard({
  lang,
  meta,
  strings,
  total,
  learned,
  labels,
}: {
  lang: string;
  meta: ShelfMeta;
  strings: ShelfStrings;
  total: number;
  learned: number;
  labels: { words: string; learned: string; continue: string; start: string; soon: string };
}) {
  const Icon = ICONS[meta.slug] ?? BookOpen;
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
  const locked = meta.soon || total === 0;

  const body = (
    <motion.div
      whileHover={locked ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/60",
        "bg-gradient-to-br backdrop-blur-sm",
        meta.gradient,
        "bg-card/60 p-6 shadow-sm transition-shadow",
        locked ? "opacity-70" : "hover:shadow-xl hover:ring-2",
        meta.ring
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl bg-white/70 shadow-sm dark:bg-white/10",
            meta.text
          )}
        >
          <Icon className="size-6" strokeWidth={2.2} />
        </span>
        {locked && (
          <span className="flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink-soft dark:bg-white/10">
            <Lock className="size-3" /> {labels.soon}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-xl font-extrabold tracking-tight text-ink">{strings.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{strings.desc}</p>

      {!locked && (
        <>
          <p className="mt-4 text-sm font-semibold text-ink">
            {learned} / {total}{" "}
            <span className="font-normal text-ink-soft">{labels.learned}</span>
          </p>
          <div className="mt-2">
            <ProgressBar value={pct} barClass={meta.bar} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={cn("text-sm font-bold", meta.text)}>{pct}%</span>
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-1",
                meta.text
              )}
            >
              {learned > 0 ? labels.continue : labels.start}
              <ArrowRight className="size-4" />
            </span>
          </div>
        </>
      )}
    </motion.div>
  );

  if (locked) return <div className="h-full">{body}</div>;
  return (
    <Link href={`/${lang}/library/${meta.slug}`} className="h-full">
      {body}
    </Link>
  );
}
