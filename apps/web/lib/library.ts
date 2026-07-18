import { apiFetch } from "@/lib/api";

export interface Shelf {
  key: string; // "A1".."C2" or a category slug like "ielts"
  total: number;
  added: number;
  learned: number;
}

export const libraryApi = {
  overview: () => apiFetch<{ shelves: Shelf[] }>("/library/overview", { auth: true }),
};

/** Static presentation metadata per shelf. Tailwind can't build dynamic class
 *  names, so every gradient/bar/text class is written out literally. */
export interface ShelfMeta {
  slug: string; // URL segment under /library/
  key: string; // overview key ("A1", "ielts") — absent for coming-soon shelves
  level?: string; // CEFR filter for the words API
  category?: string; // category filter for the words API
  gradient: string; // level-detail header tint
  bar: string; // progress bar fill
  text: string; // accent text on light surfaces (level page)
  ring: string;
  overlay: string; // bottom gradient over the card (dark, level-tinted)
  accent: string; // bright accent text readable on the dark card
  art: string; // full-card gradient (replaces per-level cover art — no assets)
  soon?: boolean;
  href?: string; // path suffix after /{lang}/ — for shelves with a bespoke page
}

export const SHELVES: ShelfMeta[] = [
  { slug: "a1", key: "A1", level: "A1", gradient: "from-green-500/20 to-green-500/5", bar: "bg-green-500", text: "text-green-600 dark:text-green-400", ring: "ring-green-500/30", overlay: "from-green-950 via-green-950/70", accent: "text-green-300", art: "from-green-500 via-green-700 to-green-950" },
  { slug: "a2", key: "A2", level: "A2", gradient: "from-emerald-500/20 to-emerald-500/5", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/30", overlay: "from-emerald-950 via-emerald-950/70", accent: "text-emerald-300", art: "from-emerald-500 via-emerald-700 to-emerald-950" },
  { slug: "b1", key: "B1", level: "B1", gradient: "from-blue-500/20 to-blue-500/5", bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/30", overlay: "from-blue-950 via-blue-950/70", accent: "text-blue-300", art: "from-blue-500 via-blue-700 to-blue-950" },
  { slug: "b2", key: "B2", level: "B2", gradient: "from-indigo-500/20 to-indigo-500/5", bar: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-500/30", overlay: "from-indigo-950 via-indigo-950/70", accent: "text-indigo-300", art: "from-indigo-500 via-indigo-700 to-indigo-950" },
  { slug: "c1", key: "C1", level: "C1", gradient: "from-purple-500/20 to-purple-500/5", bar: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-500/30", overlay: "from-purple-950 via-purple-950/70", accent: "text-purple-300", art: "from-purple-500 via-purple-700 to-purple-950" },
  { slug: "c2", key: "C2", level: "C2", gradient: "from-violet-500/20 to-violet-500/5", bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/30", overlay: "from-violet-950 via-violet-950/70", accent: "text-violet-300", art: "from-violet-500 via-violet-700 to-violet-950" },
  { slug: "ielts", key: "ielts", category: "ielts", gradient: "from-orange-500/20 to-orange-500/5", bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/30", overlay: "from-orange-950 via-orange-950/70", accent: "text-orange-300", art: "from-orange-500 via-orange-700 to-orange-950" },
  { slug: "toefl", key: "toefl", gradient: "from-red-500/20 to-red-500/5", bar: "bg-red-500", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/30", overlay: "from-red-950 via-red-950/70", accent: "text-red-300", art: "from-red-500 via-red-700 to-red-950", soon: true },
  { slug: "sat", key: "sat", gradient: "from-slate-500/20 to-slate-500/5", bar: "bg-slate-600", text: "text-slate-600 dark:text-slate-300", ring: "ring-slate-500/30", overlay: "from-slate-950 via-slate-950/70", accent: "text-slate-300", art: "from-slate-500 via-slate-700 to-slate-950", soon: true },
  { slug: "phrasal", key: "phrasal", category: "phrasal", gradient: "from-yellow-500/20 to-yellow-500/5", bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", ring: "ring-yellow-500/30", overlay: "from-yellow-950 via-yellow-950/70", accent: "text-yellow-300", art: "from-yellow-500 via-yellow-700 to-yellow-950" },
  { slug: "idioms", key: "idioms", category: "idioms", gradient: "from-amber-600/20 to-amber-600/5", bar: "bg-amber-600", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-600/30", overlay: "from-amber-950 via-amber-950/70", accent: "text-amber-300", art: "from-amber-500 via-amber-700 to-amber-950" },
  { slug: "expressions", key: "expressions", href: "expressions", gradient: "from-rose-500/20 to-rose-500/5", bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/30", overlay: "from-rose-950 via-rose-950/70", accent: "text-rose-300", art: "from-rose-500 via-rose-700 to-rose-950" },
  { slug: "business", key: "business", gradient: "from-cyan-500/20 to-cyan-500/5", bar: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/30", overlay: "from-cyan-950 via-cyan-950/70", accent: "text-cyan-300", art: "from-cyan-500 via-cyan-700 to-cyan-950", soon: true },
];

export const shelfBySlug = (slug: string): ShelfMeta | undefined =>
  SHELVES.find((s) => s.slug === slug && !s.soon);
