import type { CharacterKey } from "@/lib/coach";

export interface CharacterTheme {
  /** Tailwind gradient for the character's card/avatar. */
  gradient: string;
  /** Ring/accent colour class. */
  accent: string;
  /** Soft background tint for their chat bubbles. */
  bubble: string;
}

export const CHARACTER_THEMES: Record<CharacterKey, CharacterTheme> = {
  gordon: {
    gradient: "from-slate-700 to-slate-900",
    accent: "ring-slate-500",
    bubble: "bg-slate-100 dark:bg-slate-800/60",
  },
  mochi: {
    gradient: "from-pink-400 to-rose-500",
    accent: "ring-pink-400",
    bubble: "bg-pink-50 dark:bg-pink-950/30",
  },
  alex: {
    gradient: "from-emerald-400 to-teal-500",
    accent: "ring-emerald-400",
    bubble: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  examiner: {
    gradient: "from-indigo-500 to-blue-600",
    accent: "ring-indigo-400",
    bubble: "bg-indigo-50 dark:bg-indigo-950/30",
  },
};

export const FRIENDSHIP_TITLES = [
  "Stranger",
  "Acquaintance",
  "Friend",
  "Good friend",
  "Close friend",
  "Best friend",
];

export function friendshipTitle(level: number): string {
  return FRIENDSHIP_TITLES[Math.min(level, FRIENDSHIP_TITLES.length) - 1] ?? FRIENDSHIP_TITLES[0];
}
