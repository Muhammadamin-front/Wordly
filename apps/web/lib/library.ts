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
  art: string; // color tint layered over the cover artwork
  cover: string; // illustrated shelf cover
  soon?: boolean;
  href?: string; // path suffix after /{lang}/ — for shelves with a bespoke page
}

export const SHELVES: ShelfMeta[] = [
  { slug: "a1", key: "A1", level: "A1", gradient: "from-green-500/20 to-green-500/5", bar: "bg-green-500", text: "text-green-600 dark:text-green-400", ring: "ring-green-500/30", overlay: "from-green-950 via-green-950/70", accent: "text-green-300", art: "from-green-500 via-green-700 to-green-950", cover: "/images/levels/a1-rookie.png" },
  { slug: "a2", key: "A2", level: "A2", gradient: "from-emerald-500/20 to-emerald-500/5", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/30", overlay: "from-emerald-950 via-emerald-950/70", accent: "text-emerald-300", art: "from-emerald-500 via-emerald-700 to-emerald-950", cover: "/images/levels/a2-apprentice.png" },
  { slug: "b1", key: "B1", level: "B1", gradient: "from-brand-500/20 to-brand-500/5", bar: "bg-brand-500", text: "text-brand-600 dark:text-brand-300", ring: "ring-brand-500/30", overlay: "from-brand-950 via-brand-950/70", accent: "text-brand-300", art: "from-brand-500 via-brand-700 to-brand-950", cover: "/images/levels/b1-communicator.png" },
  { slug: "b2", key: "B2", level: "B2", gradient: "from-teal-700/18 to-teal-700/4", bar: "bg-teal-800", text: "text-teal-800 dark:text-teal-300", ring: "ring-teal-700/30", overlay: "from-teal-950 via-teal-950/70", accent: "text-teal-300", art: "from-teal-600 via-teal-800 to-teal-950", cover: "/images/levels/b2-guardian.png" },
  { slug: "c1", key: "C1", level: "C1", gradient: "from-amber-500/18 to-amber-500/4", bar: "bg-amber-600", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-500/30", overlay: "from-amber-950 via-amber-950/70", accent: "text-amber-300", art: "from-amber-500 via-amber-700 to-amber-950", cover: "/images/levels/c1-scholar.png" },
  { slug: "c2", key: "C2", level: "C2", gradient: "from-stone-500/18 to-stone-500/4", bar: "bg-stone-600", text: "text-stone-700 dark:text-stone-300", ring: "ring-stone-500/30", overlay: "from-stone-950 via-stone-950/70", accent: "text-stone-300", art: "from-stone-500 via-stone-700 to-stone-950", cover: "/images/levels/c2-master.png" },
  { slug: "ielts", key: "ielts", category: "ielts", gradient: "from-brand-600/18 to-accent-500/5", bar: "bg-brand-700", text: "text-brand-700 dark:text-brand-200", ring: "ring-brand-600/30", overlay: "from-brand-950 via-brand-950/70", accent: "text-accent-300", art: "from-brand-600 via-brand-800 to-brand-950", cover: "/images/levels/ielts-champion.png" },
  { slug: "toefl", key: "toefl", gradient: "from-red-500/20 to-red-500/5", bar: "bg-red-500", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/30", overlay: "from-red-950 via-red-950/70", accent: "text-red-300", art: "from-red-500 via-red-700 to-red-950", cover: "/images/levels/ielts-champion.png", soon: true },
  { slug: "sat", key: "sat", gradient: "from-slate-500/20 to-slate-500/5", bar: "bg-slate-600", text: "text-slate-600 dark:text-slate-300", ring: "ring-slate-500/30", overlay: "from-slate-950 via-slate-950/70", accent: "text-slate-300", art: "from-slate-500 via-slate-700 to-slate-950", cover: "/images/levels/c1-scholar.png", soon: true },
  { slug: "phrasal", key: "phrasal", category: "phrasal", gradient: "from-yellow-500/20 to-yellow-500/5", bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", ring: "ring-yellow-500/30", overlay: "from-yellow-950 via-yellow-950/70", accent: "text-yellow-300", art: "from-yellow-500 via-yellow-700 to-yellow-950", cover: "/images/levels/a2-apprentice.png" },
  { slug: "idioms", key: "idioms", category: "idioms", gradient: "from-amber-600/20 to-amber-600/5", bar: "bg-amber-600", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-600/30", overlay: "from-amber-950 via-amber-950/70", accent: "text-amber-300", art: "from-amber-500 via-amber-700 to-amber-950", cover: "/images/levels/b1-communicator.png" },
  { slug: "expressions", key: "expressions", href: "expressions", gradient: "from-brand-500/20 to-brand-500/5", bar: "bg-brand-500", text: "text-brand-600 dark:text-brand-300", ring: "ring-brand-500/30", overlay: "from-brand-950 via-brand-950/70", accent: "text-brand-300", art: "from-brand-500 via-brand-700 to-brand-950", cover: "/images/levels/b2-guardian.png" },
  { slug: "business", key: "business", gradient: "from-teal-500/20 to-teal-500/5", bar: "bg-teal-500", text: "text-teal-600 dark:text-teal-300", ring: "ring-teal-500/30", overlay: "from-teal-950 via-teal-950/70", accent: "text-teal-300", art: "from-teal-500 via-teal-700 to-teal-950", cover: "/images/levels/c1-scholar.png", soon: true },
];

export const shelfBySlug = (slug: string): ShelfMeta | undefined =>
  SHELVES.find((s) => s.slug === slug && !s.soon);
