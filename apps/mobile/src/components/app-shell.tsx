import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { NotificationBootstrap } from "@/notifications/bootstrap";
import { GrammarProgressBootstrap } from "@/grammar/progress-bootstrap";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

const MIN_BRAND_STARTUP_MS = 1_150;

export function AppShell({ children }: { children: ReactNode }) {
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
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationBootstrap />
          <GrammarProgressBootstrap />
          <BrandedStartupGate>{children}</BrandedStartupGate>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function BrandedStartupGate({ children }: { children: ReactNode }) {
  const { ready } = useAuth();
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinimumTimePassed(true), MIN_BRAND_STARTUP_MS);
    return () => clearTimeout(timer);
  }, []);

  const showStartup = !ready || !minimumTimePassed;

  return (
    <View style={styles.root}>
      {children}
      {showStartup ? <StartupScreen /> : null}
    </View>
  );
}

function StartupScreen() {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Vocora loading" style={styles.startup}>
      <View style={styles.logoCard}>
        <View style={styles.logoHalo}>
          <Image source={require("../../assets/images/vocora-mark.png")} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.brand}>Vocora</Text>
        <Text style={styles.caption}>So‘zlaringiz tayyorlanmoqda...</Text>
        <ActivityIndicator color={colors.rust} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  startup: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: colors.paper,
  },
  logoCard: {
    width: "100%",
    maxWidth: 310,
    alignItems: "center",
    gap: 14,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(84, 37, 15, 0.20)",
    backgroundColor: colors.cream,
    shadowColor: colors.brown,
    shadowOpacity: 0.16,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 7 },
    elevation: 5,
  },
  logoHalo: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(185, 78, 40, 0.26)",
    backgroundColor: colors.raised,
  },
  logo: {
    width: 72,
    height: 72,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: 1.1,
    color: colors.ink,
    textTransform: "uppercase",
  },
  caption: {
    marginTop: -8,
    marginBottom: 4,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: "center",
  },
});
