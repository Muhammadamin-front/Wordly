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
        "depth-scene group relative flex min-h-[268px] flex-col overflow-hidden rounded-[16px] border-2 border-[#24130c] bg-brand-950 p-3 text-white shadow-[5px_7px_0_rgba(84,37,15,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_10px_0_rgba(84,37,15,0.6)] sm:min-h-75 sm:rounded-[18px] sm:p-5",
        locked ? "grayscale-[0.35] opacity-75" : ""
      )}
    >
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(243,230,203,0.18),transparent_22%),radial-gradient(circle_at_78%_12%,rgba(185,78,40,0.18),transparent_24%)]" />
      <div aria-hidden className="absolute -right-10 -top-8 h-36 w-28 rotate-12 border border-[#f3e6cb]/18 bg-[#b94e28]/18 sm:h-52 sm:w-40" />
      <div aria-hidden className="absolute right-4 top-14 h-24 w-10 rotate-[18deg] border border-[#f3e6cb]/18 bg-[#d69c63]/20 sm:right-8 sm:h-36 sm:w-14" />
      <div aria-hidden className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-[#24130c] via-[#24130c]/72 to-transparent" />

      <div className="relative z-20 flex items-start justify-between">
        <span className="flex items-center gap-2">
          <span className={cn("flex size-8 items-center justify-center rounded-full text-[10px] font-black text-[#f7ecd7] shadow-[0_12px_28px_rgba(0,0,0,0.24)] sm:size-11 sm:text-sm", meta.bar)}>
            {meta.key}
          </span>
          <span className="hidden size-9 items-center justify-center rounded-full border border-white/18 bg-white/12 text-[#ead9bd] backdrop-blur-md sm:flex">
            <Icon className="size-4" strokeWidth={2.1} />
          </span>
        </span>
        {locked && (
          <span className="flex size-7 items-center justify-center rounded-full border border-white/18 bg-black/24 text-[#ead9bd] backdrop-blur-xl sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-2 sm:text-[10px] sm:font-bold sm:uppercase">
            <Lock className="size-3.5" /> <span className="hidden sm:inline">{labels.soon}</span>
          </span>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-5 sm:pt-24">
        <h3 className="line-clamp-2 max-w-[13ch] font-display text-2xl leading-[0.9] tracking-wide text-white sm:text-[2.35rem]">
          {strings.name}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-[27ch] text-[11px] leading-4 text-[#d9cab2]/82 sm:mt-3 sm:block sm:text-sm/6">{strings.desc}</p>

        {custom ? (
          <div className="mt-2 flex items-center justify-between border-t border-white/16 pt-2 sm:mt-5 sm:pt-4">
            <span className="text-xs font-bold text-[#d9cab2]/80 sm:text-sm">
              {total.toLocaleString(lang)} {strings.unit ?? labels.words}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#f3d4a4] transition-transform group-hover:translate-x-1 sm:gap-1.5 sm:text-sm">
              <span className="hidden sm:inline">{labels.start}</span>
              <ArrowRight className="size-4" />
            </span>
          </div>
        ) : (
          !locked && (
            <div className="mt-2 space-y-1.5 border-t border-white/16 pt-2 sm:mt-5 sm:space-y-3 sm:pt-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-base font-black tracking-tight text-white sm:text-3xl">
                    {learned}
                    <span className="text-[#d9cab2]/48">/{total}</span>
                  </p>
                  <p className="hidden text-sm text-[#d9cab2]/78 sm:block">{labels.learned}</p>
                </div>
                <span className="rounded-full border border-white/16 bg-white/12 px-2 py-1 text-xs font-extrabold text-white backdrop-blur-xl sm:px-3 sm:py-1.5 sm:text-sm">
                  {pct}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/16">
                <div
                  className={cn("h-full rounded-full", meta.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="hidden items-center justify-between sm:flex">
                <span className="text-sm font-medium text-[#d9cab2]/80">{labels.words}</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-[#f3d4a4] transition-transform group-hover:translate-x-1">
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
