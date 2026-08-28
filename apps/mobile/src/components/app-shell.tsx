import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, Image, Platform, StyleSheet, Text, View } from "react-native";
import { NotificationBootstrap } from "@/notifications/bootstrap";
import { GrammarProgressBootstrap } from "@/grammar/progress-bootstrap";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { SoundProvider } from "@/sound/sound-provider";
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

  useEffect(() => {
    if (Platform.OS === "web") return;

    focusManager.setFocused(AppState.currentState === "active");
    const subscription = AppState.addEventListener("change", (state) => {
      focusManager.setFocused(state === "active");
    });

    return () => {
      subscription.remove();
      focusManager.setFocused(undefined);
    };
  }, []);

  if (!loaded && !fontError) return null;
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <SoundProvider>
            <NotificationBootstrap />
            <GrammarProgressBootstrap />
            <BrandedStartupGate>{children}</BrandedStartupGate>
          </SoundProvider>
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
  const progress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    if (reduceMotion) return;

    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1_350,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion]);

  const pulseStyle = (inputRange: number[]) => ({
    opacity: progress.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: "clamp" }),
    transform: [{
      scale: progress.interpolate({ inputRange, outputRange: [0.78, 1, 0.78], extrapolate: "clamp" }),
    }],
  });

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Vocora loading" style={styles.startup}>
      <View style={styles.brandLockup}>
        <View style={styles.logoHalo}>
          <Image source={require("../../assets/images/vocora-mark.png")} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.brand}>Vocora</Text>
      </View>

      <View style={styles.loadingDock} importantForAccessibility="no-hide-descendants">
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingMark, reduceMotion ? styles.loadingMarkStill : pulseStyle([0, 0.17, 0.38])]} />
          <Animated.View style={[styles.loadingMark, reduceMotion ? styles.loadingMarkStill : pulseStyle([0.22, 0.5, 0.72])]} />
          <Animated.View style={[styles.loadingMark, reduceMotion ? styles.loadingMarkStill : pulseStyle([0.58, 0.82, 1])]} />
        </View>
        <Text style={styles.loadingLabel}>Tayyorlanmoqda...</Text>
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
    paddingHorizontal: 28,
    paddingVertical: 48,
    backgroundColor: colors.paper,
  },
  brandLockup: {
    alignItems: "center",
    gap: 18,
    transform: [{ translateY: -12 }],
  },
  logoHalo: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    backgroundColor: colors.raised,
    shadowColor: colors.brown,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  logo: {
    width: 78,
    height: 78,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: 1.4,
    color: colors.ink,
    textTransform: "uppercase",
  },
  loadingDock: {
    position: "absolute",
    bottom: 44,
    alignItems: "center",
    gap: 10,
  },
  loadingTrack: {
    minHeight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingMark: {
    width: 9,
    height: 9,
    borderRadius: 3,
    backgroundColor: colors.rust,
  },
  loadingMarkStill: {
    opacity: 0.72,
  },
  loadingLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: colors.muted,
    textAlign: "center",
  },
});
