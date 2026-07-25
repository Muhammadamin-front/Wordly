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
        "premium-card depth-scene group relative flex aspect-4/5 flex-col overflow-hidden rounded-[28px] border border-white/10 p-5 text-white shadow-[0_22px_70px_rgba(8,12,20,0.18)]",
        locked ? "grayscale-[0.3]" : ""
      )}
    >
      <div className={cn("absolute inset-0 bg-linear-to-br", meta.art)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_14%,rgba(255,255,255,0.24),transparent_24%),radial-gradient(circle_at_85%_8%,rgba(255,255,255,0.12),transparent_18%),linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_22%,rgba(0,0,0,0.34))]" />
      <div className="absolute inset-0 opacity-[0.18] mix-blend-soft-light [background-image:linear-gradient(135deg,rgba(255,255,255,0.12)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.12)_75%,transparent_75%,transparent)] [background-size:20px_20px]" />
      <div className={cn("absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/26 to-transparent", meta.overlay)} />

      <Icon
        className="depth-parallax float-slow absolute -right-10 -top-12 size-52 rotate-12 text-white/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
        strokeWidth={1.45}
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/14 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/92 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
          <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm">
            <Icon className="size-4" strokeWidth={2.3} />
          </span>
          {meta.key}
        </span>
        {locked && (
          <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-2xl">
            <Lock className="size-3.5" /> {labels.soon}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-auto pt-24">
        <h3 className="max-w-[12ch] text-[1.7rem] font-black leading-[0.96] tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
          {strings.name}
        </h3>
        <p className="mt-2 max-w-[28ch] text-sm/6 text-white/78">{strings.desc}</p>

        {custom ? (
          <div className="mt-5 flex items-center justify-between border-t border-white/12 pt-4">
            <span className="text-sm font-medium text-white/62">{labels.words}</span>
            <span className="flex items-center gap-1.5 text-sm font-bold text-white transition-transform group-hover:translate-x-1">
              {labels.start}
              <ArrowRight className="size-4" />
            </span>
          </div>
        ) : (
          !locked && (
            <div className="mt-5 space-y-3 border-t border-white/12 pt-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-black tracking-tight text-white">
                    {learned}
                    <span className="text-white/45">/{total}</span>
                  </p>
                  <p className="text-sm text-white/70">{labels.learned}</p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-sm font-extrabold text-white backdrop-blur-2xl">
                  {pct}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/16">
                <div
                  className={cn(
                    "h-full rounded-full shadow-[0_0_24px_rgba(255,255,255,0.2)]",
                    meta.bar
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/62">{labels.words}</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-white transition-transform group-hover:translate-x-1">
                  {learned > 0 ? labels.continue : labels.start}
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          )
        )}
      </div>

      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at var(--shine-x, 50%) var(--shine-y, 25%), rgb(255 255 255 / 0.18), transparent 28%)",
        }}
      />
    </motion.div>
  );

  if (locked) return <div className="h-full">{content}</div>;
  return (
    <Link href={`/${lang}/${meta.href ?? `library/${meta.slug}`}`} className="block h-full">
      {content}
    </Link>
  );
}
