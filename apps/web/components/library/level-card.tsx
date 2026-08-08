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
  MessageCircle,
  PenTool,
  Sprout,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { createTiltHandlers } from "@/components/ui/tilt-card";
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
  expressions: MessageCircle,
};

export interface ShelfStrings {
  name: string;
  desc: string;
  unit?: string;
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
  const tilt = createTiltHandlers({ rotateX: 12, rotateY: 14, lift: -8 });
  const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
  const custom = !!meta.href;
  const locked = meta.soon || (!custom && total === 0);

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      onPointerMove={locked ? undefined : tilt.onPointerMove}
      onPointerLeave={locked ? undefined : tilt.onPointerLeave}
      onPointerCancel={locked ? undefined : tilt.onPointerCancel}
      className={cn(
        "premium-card depth-scene group relative flex min-h-[236px] flex-col overflow-hidden rounded-lg p-3 text-ink sm:aspect-4/5 sm:min-h-0 sm:p-5",
        locked ? "grayscale-[0.45] opacity-75" : ""
      )}
    >
      <div
        aria-hidden
        className="absolute -right-5 top-8 h-20 w-14 overflow-hidden rounded-t-full border border-brand-900/10 bg-sand-50/48 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03] sm:-right-7 sm:h-40 sm:w-28 dark:bg-white/4"
      >
        <div className={cn("absolute inset-x-5 bottom-0 h-28 rounded-t-full opacity-14", meta.bar)} />
        <div className="absolute -inset-x-8 top-14 h-px rotate-45 bg-brand-900/12" />
        <div className="absolute -inset-x-8 top-14 h-px -rotate-45 bg-brand-900/12" />
        <div className="absolute inset-x-4 bottom-4 h-16 rounded-t-full border border-brand-900/12" />
        <div className="absolute inset-x-8 bottom-0 h-10 rounded-t-full border border-brand-900/10" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(45deg,currentColor_1px,transparent_1px),linear-gradient(-45deg,currentColor_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="relative z-20 flex items-start justify-between">
        <span className="flex items-center gap-2">
          <span className={cn("flex size-8 items-center justify-center rounded-full text-[10px] font-black text-white shadow-sm sm:size-11 sm:text-sm", meta.bar)}>
            {meta.key}
          </span>
          <span className="hidden size-9 items-center justify-center rounded-full border border-line bg-raised/76 text-ink-soft sm:flex">
            <Icon className="size-4" strokeWidth={2.1} />
          </span>
        </span>
        {locked && (
          <span className="flex size-7 items-center justify-center rounded-full border border-line bg-raised/80 text-ink-soft backdrop-blur-xl sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-2 sm:text-[10px] sm:font-bold sm:uppercase">
            <Lock className="size-3.5" /> <span className="hidden sm:inline">{labels.soon}</span>
          </span>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-5 sm:pt-24">
        <h3 className="line-clamp-2 max-w-[13ch] text-[0.98rem] font-black leading-[1.08] tracking-tight text-ink sm:text-[1.55rem] sm:leading-[1.02]">
          {strings.name}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-[27ch] text-[11px] leading-4 text-ink-soft sm:mt-3 sm:block sm:text-sm/6">{strings.desc}</p>

        {custom ? (
          <div className="mt-2 flex items-center justify-between border-t border-line/70 pt-2 sm:mt-5 sm:pt-4">
            <span className="text-xs font-bold text-ink-soft sm:text-sm">
              {total.toLocaleString(lang)} {strings.unit ?? labels.words}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-brand-800 transition-transform group-hover:translate-x-1 sm:gap-1.5 sm:text-sm dark:text-brand-200">
              <span className="hidden sm:inline">{labels.start}</span>
              <ArrowRight className="size-4" />
            </span>
          </div>
        ) : (
          !locked && (
            <div className="mt-2 space-y-1.5 border-t border-line/70 pt-2 sm:mt-5 sm:space-y-3 sm:pt-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-base font-black tracking-tight text-ink sm:text-3xl">
                    {learned}
                    <span className="text-ink-soft/50">/{total}</span>
                  </p>
                  <p className="hidden text-sm text-ink-soft sm:block">{labels.learned}</p>
                </div>
                <span className="rounded-full border border-line bg-raised/72 px-2 py-1 text-xs font-extrabold text-ink backdrop-blur-xl sm:px-3 sm:py-1.5 sm:text-sm">
                  {pct}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                <div
                  className={cn("h-full rounded-full", meta.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="hidden items-center justify-between sm:flex">
                <span className="text-sm font-medium text-ink-soft">{labels.words}</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-brand-800 transition-transform group-hover:translate-x-1 dark:text-brand-200">
                  {learned > 0 ? labels.continue : labels.start}
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          )
        )}
      </div>

    </motion.div>
  );

  if (locked) return <div className="h-full">{content}</div>;
  return (
    <Link href={`/${lang}/${meta.href ?? `library/${meta.slug}`}`} className="block h-full">
      {content}
    </Link>
  );
}
