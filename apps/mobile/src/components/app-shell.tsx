import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect, useMemo } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, fontError] = useFonts({
    BebasNeue: require("../../assets/fonts/bebas-neue-latin-400.ttf"),
    Manrope: require("../../assets/fonts/manrope-latin-400.ttf"),
    ManropeMedium: require("../../assets/fonts/manrope-latin-500.ttf"),
    ManropeBold: require("../../assets/fonts/manrope-latin-700.ttf"),
  });
  const client = useMemo(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 20_000 } },
  }), []);

  useEffect(() => {
    if (loaded || fontError) void SplashScreen.hideAsync().catch(() => undefined);
  }, [fontError, loaded]);

  if (!loaded && !fontError) return null;
  return <QueryClientProvider client={client}><AuthProvider><ThemeProvider>{children}</ThemeProvider></AuthProvider></QueryClientProvider>;
}
