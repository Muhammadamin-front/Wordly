"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "vocora-theme";
const THEME_CHANGE_EVENT = "vocora-theme-change";
const THEME_COLORS: Record<Theme, string> = {
  light: "#f3e6cb",
  dark: "#24130c",
};

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** The chosen theme, read from storage rather than from the DOM.
 *
 *  The DOM attribute used to be the source of truth, which broke on a locale
 *  switch: changing /uz/... to /ru/... re-renders the [lang] layout, React
 *  reconciles <html> and drops the data-theme attribute it did not render, and
 *  the reader was thrown back to light mid-session. Storage survives that. */
function currentDocumentTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Fall through to whatever the pre-paint script put on the element.
  }
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function serverTheme(): Theme {
  return "light";
}

function applyDocumentTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
}

function subscribeToTheme(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const storedTheme = event.newValue === "dark" ? "dark" : "light";
    applyDocumentTheme(storedTheme);
    onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, currentDocumentTheme, serverTheme);
  const pathname = usePathname();

  // Re-assert the attribute after navigation. Moving between locales re-renders
  // the root layout, and React clears data-theme on the way through.
  useEffect(() => {
    if (document.documentElement.dataset.theme !== theme) {
      applyDocumentTheme(theme);
    }
  }, [pathname, theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    applyDocumentTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The theme still works when storage is unavailable.
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    window.setTimeout(() => root.classList.remove("theme-switching"), 360);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(currentDocumentTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [setTheme, theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
