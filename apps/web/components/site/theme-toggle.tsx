"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/site/theme-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locales";

const LABELS: Record<Locale, Record<"dark" | "light", string>> = {
  uz: {
    dark: "Tungi rejimga o'tish",
    light: "Yorug' rejimga o'tish",
  },
  ru: {
    dark: "Включить темную тему",
    light: "Включить светлую тему",
  },
  en: {
    dark: "Switch to dark mode",
    light: "Switch to light mode",
  },
};

export function ThemeToggle({ lang, className }: { lang: Locale; className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const targetTheme = theme === "light" ? "dark" : "light";
  const label = LABELS[lang][targetTheme];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        "group relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-card/74 text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_8px_22px_rgba(23,74,63,0.08)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand-400/60 hover:bg-raised hover:text-brand-700 hover:shadow-[0_12px_28px_rgba(23,74,63,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_28px_rgba(0,0,0,0.24)] dark:hover:text-accent-300",
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-1 rounded-md bg-accent-400/12 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-brand-400/12"
      />
      <Moon className="relative size-[18px] transition-transform duration-300 group-hover:-rotate-6 dark:hidden" aria-hidden />
      <Sun
        className="relative hidden size-[18px] transition-transform duration-500 group-hover:rotate-45 dark:block"
        aria-hidden
      />
    </button>
  );
}
