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
  accent: string; // bright accent text readable on the dark card
  soon?: boolean;
  href?: string; // path suffix after /{lang}/ — for shelves with a bespoke page
}

export const SHELVES: ShelfMeta[] = [
  { slug: "a1", key: "A1", level: "A1", gradient: "from-brand-400/20 to-brand-400/5", bar: "bg-brand-500", text: "text-brand-600 dark:text-brand-300", ring: "ring-brand-400/30", accent: "text-brand-200" },
  { slug: "a2", key: "A2", level: "A2", gradient: "from-accent-500/20 to-accent-500/5", bar: "bg-accent-500", text: "text-accent-600 dark:text-accent-300", ring: "ring-accent-500/30", accent: "text-accent-300" },
  { slug: "b1", key: "B1", level: "B1", gradient: "from-brand-500/20 to-brand-500/5", bar: "bg-brand-500", text: "text-brand-600 dark:text-brand-300", ring: "ring-brand-500/30", accent: "text-brand-300" },
  { slug: "b2", key: "B2", level: "B2", gradient: "from-accent-600/18 to-accent-600/4", bar: "bg-accent-600", text: "text-accent-600 dark:text-accent-300", ring: "ring-accent-600/30", accent: "text-accent-300" },
  { slug: "c1", key: "C1", level: "C1", gradient: "from-brand-400/18 to-brand-400/4", bar: "bg-brand-600", text: "text-brand-700 dark:text-brand-200", ring: "ring-brand-400/30", accent: "text-brand-200" },
  { slug: "c2", key: "C2", level: "C2", gradient: "from-brand-800/18 to-brand-800/4", bar: "bg-brand-800", text: "text-brand-800 dark:text-brand-200", ring: "ring-brand-800/30", accent: "text-brand-200" },
  { slug: "ielts", key: "ielts", category: "ielts", gradient: "from-brand-600/18 to-accent-500/5", bar: "bg-brand-700", text: "text-brand-700 dark:text-brand-200", ring: "ring-brand-600/30", accent: "text-accent-300" },
  { slug: "toefl", key: "toefl", gradient: "from-brand-600/20 to-brand-600/5", bar: "bg-brand-600", text: "text-brand-600 dark:text-brand-300", ring: "ring-brand-600/30", accent: "text-brand-200", soon: true },
  { slug: "sat", key: "sat", gradient: "from-accent-500/20 to-accent-500/5", bar: "bg-accent-600", text: "text-accent-600 dark:text-accent-300", ring: "ring-accent-500/30", accent: "text-accent-300", soon: true },
  { slug: "phrasal", key: "phrasal", category: "phrasal", gradient: "from-sand-200/80 to-sand-200/30", bar: "bg-brand-400", text: "text-brand-700 dark:text-brand-200", ring: "ring-brand-400/30", accent: "text-brand-200" },
  { slug: "idioms", key: "idioms", category: "idioms", gradient: "from-accent-500/20 to-accent-500/5", bar: "bg-accent-600", text: "text-accent-600 dark:text-accent-300", ring: "ring-accent-500/30", accent: "text-accent-300" },
  { slug: "expressions", key: "expressions", href: "expressions", gradient: "from-brand-500/20 to-brand-500/5", bar: "bg-brand-500", text: "text-brand-600 dark:text-brand-300", ring: "ring-brand-500/30", accent: "text-brand-300" },
  { slug: "business", key: "business", gradient: "from-accent-500/20 to-accent-500/5", bar: "bg-accent-500", text: "text-accent-600 dark:text-accent-300", ring: "ring-accent-500/30", accent: "text-accent-300", soon: true },
];

export const shelfBySlug = (slug: string): ShelfMeta | undefined =>
  SHELVES.find((s) => s.slug === slug && !s.soon);
