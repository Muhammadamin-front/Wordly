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
        "premium-card depth-scene group relative flex aspect-4/5 flex-col overflow-hidden rounded-lg p-5 text-ink",
        locked ? "grayscale-[0.45] opacity-75" : ""
      )}
    >
      <div
        aria-hidden
        className="absolute -right-7 top-8 h-40 w-28 overflow-hidden rounded-t-full border border-brand-900/10 bg-sand-50/48 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03] dark:bg-white/4"
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
          <span className={cn("flex size-11 items-center justify-center rounded-full text-sm font-black text-white shadow-sm", meta.bar)}>
            {meta.key}
          </span>
          <span className="flex size-9 items-center justify-center rounded-full border border-line bg-raised/76 text-ink-soft">
            <Icon className="size-4" strokeWidth={2.1} />
          </span>
        </span>
        {locked && (
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-raised/80 px-3 py-2 text-[10px] font-bold uppercase text-ink-soft backdrop-blur-xl">
            <Lock className="size-3.5" /> {labels.soon}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-24">
        <h3 className="max-w-[13ch] text-[1.55rem] font-black leading-[1.02] tracking-tight text-ink">
          {strings.name}
        </h3>
        <p className="mt-3 max-w-[27ch] text-sm/6 text-ink-soft">{strings.desc}</p>

        {custom ? (
          <div className="mt-5 flex items-center justify-between border-t border-line/70 pt-4">
            <span className="text-sm font-medium text-ink-soft">{labels.words}</span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-brand-800 transition-transform group-hover:translate-x-1 dark:text-brand-200">
              {labels.start}
              <ArrowRight className="size-4" />
            </span>
          </div>
        ) : (
          !locked && (
            <div className="mt-5 space-y-3 border-t border-line/70 pt-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-black tracking-tight text-ink">
                    {learned}
                    <span className="text-ink-soft/50">/{total}</span>
                  </p>
                  <p className="text-sm text-ink-soft">{labels.learned}</p>
                </div>
                <span className="rounded-full border border-line bg-raised/72 px-3 py-1.5 text-sm font-extrabold text-ink backdrop-blur-xl">
                  {pct}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                <div
                  className={cn("h-full rounded-full", meta.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
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
