"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// Observe data-theme on <html>; re-renders on any change (including from
// other tabs' storage events or the init script).
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme | null {
  return null;
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("words_theme", next);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const Icon = theme === "light" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => applyTheme(getSnapshot() === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="icon-tile flex size-9 items-center justify-center rounded-lg text-ink-soft transition-all hover:-translate-y-0.5 hover:text-ink"
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
