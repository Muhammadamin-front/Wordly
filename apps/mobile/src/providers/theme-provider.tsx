import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, View } from "react-native";

import { setActiveTheme, type AppTheme } from "@/theme/tokens";

const THEME_KEY = "vocora-theme";

type ThemeValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const initial = Appearance.getColorScheme() === "dark" ? "dark" : "light";
    setActiveTheme(initial);
    return initial;
  });

  const applyTheme = useCallback((next: AppTheme, persist = true) => {
    setActiveTheme(next);
    Appearance.setColorScheme(next);
    setThemeState(next);
    if (persist) void AsyncStorage.setItem(THEME_KEY, next);
  }, []);

  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (mounted && (stored === "dark" || stored === "light")) applyTheme(stored, false);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [applyTheme]);

  const setTheme = useCallback((next: AppTheme) => applyTheme(next), [applyTheme]);
  const toggleTheme = useCallback(() => applyTheme(theme === "light" ? "dark" : "light"), [applyTheme, theme]);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [setTheme, theme, toggleTheme]);

  return <ThemeContext.Provider value={value}><View key={theme} style={{ flex: 1 }}>{children}</View></ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be within ThemeProvider");
  return value;
}
