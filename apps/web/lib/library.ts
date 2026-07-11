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
  gradient: string;
  bar: string;
  text: string;
  ring: string;
  soon?: boolean;
}

export const SHELVES: ShelfMeta[] = [
  { slug: "a1", key: "A1", level: "A1", gradient: "from-green-500/20 to-green-500/5", bar: "bg-green-500", text: "text-green-600 dark:text-green-400", ring: "ring-green-500/30" },
  { slug: "a2", key: "A2", level: "A2", gradient: "from-emerald-500/20 to-emerald-500/5", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/30" },
  { slug: "b1", key: "B1", level: "B1", gradient: "from-blue-500/20 to-blue-500/5", bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/30" },
  { slug: "b2", key: "B2", level: "B2", gradient: "from-indigo-500/20 to-indigo-500/5", bar: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-500/30" },
  { slug: "c1", key: "C1", level: "C1", gradient: "from-purple-500/20 to-purple-500/5", bar: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-500/30" },
  { slug: "c2", key: "C2", level: "C2", gradient: "from-violet-500/20 to-violet-500/5", bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/30" },
  { slug: "ielts", key: "ielts", category: "ielts", gradient: "from-orange-500/20 to-orange-500/5", bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/30" },
  { slug: "toefl", key: "toefl", gradient: "from-red-500/20 to-red-500/5", bar: "bg-red-500", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/30", soon: true },
  { slug: "sat", key: "sat", gradient: "from-slate-500/20 to-slate-500/5", bar: "bg-slate-600", text: "text-slate-600 dark:text-slate-300", ring: "ring-slate-500/30", soon: true },
  { slug: "phrasal", key: "phrasal", category: "phrasal", gradient: "from-yellow-500/20 to-yellow-500/5", bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", ring: "ring-yellow-500/30" },
  { slug: "idioms", key: "idioms", category: "idioms", gradient: "from-amber-600/20 to-amber-600/5", bar: "bg-amber-600", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-600/30" },
  { slug: "business", key: "business", gradient: "from-cyan-500/20 to-cyan-500/5", bar: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/30", soon: true },
];

export const shelfBySlug = (slug: string): ShelfMeta | undefined =>
  SHELVES.find((s) => s.slug === slug && !s.soon);
