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
import Image from "next/image";
import Link from "next/link";

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
        "group relative flex aspect-4/5 flex-col justify-end overflow-hidden rounded-2xl",
        "shadow-md ring-1 ring-black/5",
        locked ? "grayscale-[0.4]" : "hover:shadow-2xl"
      )}
    >
      {/* Hero art */}
      <Image
        src={`/heroes/${meta.slug}.jpg`}
        alt={strings.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
      {/* Readability scrim + level-tinted bottom gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
      <div className={cn("absolute inset-0 bg-linear-to-t to-transparent", meta.overlay)} />

      {/* Top chips */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/90 text-ink shadow-sm backdrop-blur-sm">
          <Icon className="size-5" strokeWidth={2.4} />
        </span>
        {locked && (
          <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
            <Lock className="size-3" /> {labels.soon}
          </span>
        )}
      </div>

      {/* Bottom content */}
      <div className="relative z-10 p-5">
        <h3 className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {strings.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/75">{strings.desc}</p>

        {!locked && (
          <>
            <p className="mt-3 text-sm font-semibold text-white">
              {learned} / {total}{" "}
              <span className="font-normal text-white/60">{labels.learned}</span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className={cn("h-full rounded-full", meta.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className={cn("text-sm font-bold", meta.accent)}>{pct}%</span>
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold text-white transition-transform group-hover:translate-x-1"
                )}
              >
                {learned > 0 ? labels.continue : labels.start}
                <ArrowRight className="size-4" />
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  if (locked) return <div className="h-full">{body}</div>;
  return (
    <Link href={`/${lang}/library/${meta.slug}`} className="h-full">
      {body}
    </Link>
  );
}
