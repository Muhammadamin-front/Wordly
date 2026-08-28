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
    gradient: "from-brand-700 to-brand-950",
    accent: "ring-brand-500",
    bubble: "bg-sand-100 dark:bg-brand-900/60",
  },
  mochi: {
    gradient: "from-accent-300 to-brand-500",
    accent: "ring-accent-300",
    bubble: "bg-brand-50 dark:bg-brand-950/45",
  },
  alex: {
    gradient: "from-brand-400 to-accent-500",
    accent: "ring-brand-400",
    bubble: "bg-brand-50 dark:bg-brand-950/30",
  },
  examiner: {
    gradient: "from-brand-500 to-brand-800",
    accent: "ring-brand-400",
    bubble: "bg-brand-50 dark:bg-brand-950/45",
  },
  raj: {
    gradient: "from-accent-500 to-brand-700",
    accent: "ring-accent-500",
    bubble: "bg-accent-50 dark:bg-brand-950/45",
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
