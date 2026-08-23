import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { type Href, router, usePathname } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { request, type User } from "@/api/client";
import { copy, localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { colors, fonts } from "@/theme/tokens";

type MenuItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href?: Href;
  webPath?: string;
  matches?: (pathname: string) => boolean;
};

// Keep all five primary destinations readable without sacrificing the 48 dp
// Android touch target. The shared value is also used by Screen padding and
// Expo Router's tab bar.
export const BOTTOM_NAV_HEIGHT = 82;
export const COMPACT_TAB_WIDTH = 360;

const compactTabLabels = {
  uz: { home: "Bosh", learn: "Dars", library: "Kartalar", ielts: "IELTS", progress: "Natija" },
  ru: { home: "Главная", learn: "Учёба", library: "Карты", ielts: "IELTS", progress: "Прогресс" },
  en: { home: "Home", learn: "Learn", library: "Cards", ielts: "IELTS", progress: "Progress" },
} as const;

export function primaryTabLabels(locale: Locale, compact: boolean) {
  if (compact) return compactTabLabels[locale];
  const t = copy[locale];
  return { home: t.home, learn: t.learn, library: t.library, ielts: "IELTS", progress: t.progress };
}

const menuCopy = {
  uz: {
    home: "Bosh",
    learn: "O'rganish",
    library: "Kutubxona",
    progress: "Progress",
    more: "Ko'proq",
    practice: "Mashqlar",
    grammar: "Grammatika",
    skills: "Ko'nikmalar",
    statistics: "Statistika",
    achievements: "Yutuqlar",
    leaderboard: "Reyting",
    friends: "Do'stlar",
    classes: "Sinflar",
    teacher: "O'qituvchi",
    billing: "Tariflar",
    info: "Yordam",
    coach: "AI Coach",
    multiplayer: "Multiplayer",
  },
  ru: {
    home: "Главная",
    learn: "Учиться",
    library: "Библиотека",
    progress: "Прогресс",
    more: "Еще",
    practice: "Практика",
    grammar: "Грамматика",
    skills: "Навыки",
    statistics: "Статистика",
    achievements: "Достижения",
    leaderboard: "Рейтинг",
    friends: "Друзья",
    classes: "Классы",
    teacher: "Преподаватель",
    billing: "Тарифы",
    info: "Помощь",
    coach: "AI Coach",
    multiplayer: "Multiplayer",
  },
  en: {
    home: "Home",
    learn: "Learn",
    library: "Library",
    progress: "Progress",
    more: "More",
    practice: "Practice",
    grammar: "Grammar",
    skills: "Skills",
    statistics: "Statistics",
    achievements: "Achievements",
    leaderboard: "Leaderboard",
    friends: "Friends",
    classes: "Classes",
    teacher: "Teacher",
    billing: "Billing",
    info: "Help",
    coach: "AI Coach",
    multiplayer: "Multiplayer",
  },
} as const;

const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? "https://vocora.uz").replace(/\/$/, "");
const themeLabels = {
  uz: { dark: "Tungi rejimga o'tish", light: "Yorug' rejimga o'tish" },
  ru: { dark: "Включить тёмную тему", light: "Включить светлую тему" },
  en: { dark: "Switch to dark mode", light: "Switch to light mode" },
} as const;

function VocoraMark() {
  return (
    <Svg accessibilityElementsHidden importantForAccessibility="no-hide-descendants" width={34} height={34} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="vocora-mark" x1="5" y1="3" x2="35" y2="38" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#C86A3B" />
          <Stop offset="0.56" stopColor="#B94E28" />
          <Stop offset="1" stopColor="#7E2D1C" />
        </LinearGradient>
      </Defs>
      <Rect x="1" y="1" width="38" height="38" rx="10" fill="url(#vocora-mark)" stroke="#24130C" strokeWidth="2" />
      <Path d="M7.2 9.6c2.4-.7 5.1.6 6 3l5.8 15.7 5.8-15.7c.9-2.4 3.5-3.7 6-3l-9 22.6c-.5 1.3-1.6 2.1-2.8 2.1s-2.3-.8-2.8-2.1L7.2 9.6Z" fill="#FFF8EA" />
      <Path d="M26.7 10.6c2.1-1.3 4.7-.7 6.1 1.1L21 34.1c-1.1 0-2-.5-2.7-1.4l8.4-22.1Z" fill="#6C9390" />
      <Path d="M15.9 29.2c2.7.9 5.3.9 7.9 0l-4.8 5.4-3.1-5.4Z" fill="#F3E6CB" opacity={0.86} />
      <Circle cx="20" cy="12.4" r="5.2" fill="#D7B38A" />
      <Circle cx="18" cy="12.4" r="0.8" fill="#24130C" />
      <Circle cx="20" cy="12.4" r="0.8" fill="#24130C" />
      <Circle cx="22" cy="12.4" r="0.8" fill="#24130C" />
    </Svg>
  );
}

export function Brand({ onPress }: { onPress?: () => void }) {
  const content = (
    <>
      <View style={styles.logoMark}>
        <VocoraMark />
      </View>
      <Text style={styles.brandText}>Vocora</Text>
    </>
  );

  if (!onPress) return <View style={styles.brand}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Vocora"
      onPress={onPress}
      style={({ pressed }) => [styles.brand, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function AppHeader() {
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width - 16, 760);
  const { user, token, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = copy[locale];
  const nav = menuCopy[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [changingLocale, setChangingLocale] = useState(false);
  const [localeError, setLocaleError] = useState(false);

  const primaryItems: MenuItem[] = [
    { key: "dashboard", href: "/(tabs)", icon: "sparkles-outline", label: nav.home, matches: (path) => path === "/" },
    { key: "today", href: "/(tabs)/review", icon: "calendar-outline", label: nav.learn, matches: (path) => path.startsWith("/review") },
    { key: "decks", href: "/(tabs)/library", icon: "library-outline", label: nav.library, matches: (path) => path.startsWith("/library") || path.startsWith("/words") },
    { key: "ielts", href: "/(tabs)/ielts", icon: "school-outline", label: "IELTS", matches: (path) => path.startsWith("/ielts") || path.startsWith("/expressions") },
    { key: "mastery", href: "/(tabs)/progress", icon: "map-outline", label: nav.progress, matches: (path) => path.startsWith("/progress") },
  ];
  const secondaryItems: MenuItem[] = [
    { key: "profile", href: "/(tabs)/profile", icon: "person-circle-outline", label: t.profile, matches: (path) => path.startsWith("/profile") },
    { key: "games", href: "/games" as Href, icon: "game-controller-outline", label: nav.practice, matches: (path) => path.startsWith("/games") },
    { key: "multiplayer", href: "/multiplayer" as Href, icon: "people-outline", label: nav.multiplayer, matches: (path) => path.startsWith("/multiplayer") },
    { key: "coach", href: "/coach" as Href, icon: "chatbubbles-outline", label: nav.coach, matches: (path) => path.startsWith("/coach") },
    { key: "grammar", href: "/grammar" as Href, icon: "shapes-outline", label: nav.grammar, matches: (path) => path.startsWith("/grammar") },
    { key: "skills", href: "/skills" as Href, icon: "book-outline", label: nav.skills, matches: (path) => path.startsWith("/skills") },
    { key: "statistics", href: "/statistics" as Href, icon: "bar-chart-outline", label: nav.statistics, matches: (path) => path.startsWith("/statistics") || path.startsWith("/mistakes") },
    { key: "achievements", href: "/achievements" as Href, icon: "medal-outline", label: nav.achievements, matches: (path) => path.startsWith("/achievements") },
    { key: "leaderboard", href: "/community" as Href, icon: "trophy-outline", label: nav.leaderboard, matches: (path) => path.startsWith("/community") },
    { key: "friends", href: "/community" as Href, icon: "people-outline", label: nav.friends, matches: (path) => path.startsWith("/community") },
    { key: "classes", href: "/classes" as Href, icon: "people-circle-outline", label: nav.classes, matches: (path) => path.startsWith("/classes") },
    { key: "teacher", href: "/teacher" as Href, icon: "school-outline", label: nav.teacher, matches: (path) => path.startsWith("/teacher") },
    { key: "billing", href: "/billing" as Href, icon: "card-outline", label: nav.billing, matches: (path) => path.startsWith("/billing") },
    { key: "info", href: "/info" as Href, icon: "help-buoy-outline", label: nav.info, matches: (path) => path.startsWith("/info") },
  ];
  const selectItem = async (item: MenuItem) => {
    setOpen(false);
    if (item.href) {
      router.navigate(item.href);
      return;
    }
    if (item.webPath) await WebBrowser.openBrowserAsync(`${WEB_URL}/${locale}/${item.webPath}`);
  };

  const changeLocale = async (nextLocale: Locale) => {
    if (!token || changingLocale || nextLocale === locale) return;
    setChangingLocale(true);
    setLocaleError(false);
    try {
      const updated = await request<User>("/users/me", {
        method: "PATCH",
        token,
        body: { ui_locale: nextLocale },
      });
      updateUser(updated);
    } catch {
      setLocaleError(true);
    } finally {
      setChangingLocale(false);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = item.matches?.(pathname) ?? false;
    return (
      <Pressable
        key={item.key}
        accessibilityRole="menuitem"
        accessibilityLabel={item.label}
        accessibilityHint={item.webPath ? t.opensWebsite : undefined}
        accessibilityState={{ selected: active }}
        onPress={() => void selectItem(item)}
        style={({ pressed }) => [styles.menuItem, active && styles.menuItemActive, pressed && styles.menuItemPressed]}
      >
        <View style={[styles.menuIcon, active && styles.menuIconActive]}>
          <Ionicons name={item.icon} size={18} color={active ? colors.brand600 : item.key === "dashboard" ? colors.gold500 : colors.brand500} />
        </View>
        <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={[styles.headerBar, { width: frameWidth, marginHorizontal: 0, alignSelf: "center" }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.menu}
            accessibilityState={{ expanded: open }}
            hitSlop={4}
            onPress={() => setOpen(true)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons name="menu" size={22} color={colors.muted} />
          </Pressable>
          <Brand onPress={() => router.navigate("/(tabs)")} />
        </View>
      </SafeAreaView>

      <Modal animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent transparent visible={open}>
        <View style={styles.modalRoot}>
          <Pressable accessibilityRole="button" accessibilityLabel={t.closeMenu} onPress={() => setOpen(false)} style={styles.backdrop} />
          <SafeAreaView edges={["top", "bottom"]} style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Brand onPress={() => { setOpen(false); router.navigate("/(tabs)"); }} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.closeMenu}
                hitSlop={4}
                onPress={() => setOpen(false)}
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView accessibilityRole="menu" contentContainerStyle={styles.menuList} showsVerticalScrollIndicator={false}>
              <View style={styles.menuGroup}>{primaryItems.map(renderMenuItem)}</View>
              <View style={styles.menuGroup}>
                <Text style={styles.menuTitle}>{nav.more}</Text>
                {secondaryItems.map(renderMenuItem)}
              </View>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <View style={styles.footerControls}>
                <View accessibilityRole="radiogroup" style={styles.localeRow}>
                  {(["uz", "ru", "en"] as Locale[]).map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityLabel={option.toUpperCase()}
                      accessibilityState={{ disabled: changingLocale, selected: locale === option }}
                      disabled={changingLocale}
                      onPress={() => void changeLocale(option)}
                      style={({ pressed }) => [styles.localeChip, locale === option && styles.localeChipActive, (pressed || changingLocale) && styles.localeChipPressed]}
                    >
                      <Text style={[styles.localeText, locale === option && styles.localeTextActive]}>{option.toUpperCase()}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable accessibilityRole="switch" accessibilityLabel={themeLabels[locale][theme === "light" ? "dark" : "light"]} accessibilityState={{ checked: theme === "dark" }} onPress={toggleTheme} style={({ pressed }) => [styles.themeButton, pressed && styles.pressed]}>
                  <Ionicons name={theme === "dark" ? "sunny-outline" : "moon-outline"} size={19} color={colors.ink} />
                </Pressable>
              </View>
              {localeError ? <Text style={styles.localeError}>{t.profileSaveError}</Text> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.logout}
                onPress={async () => { setOpen(false); await logout(); }}
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
              >
                <Ionicons name="log-out-outline" size={19} color={colors.ink} />
                <Text style={styles.logoutText}>{t.logout}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

export function AppBottomNav() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const tab = primaryTabLabels(locale, width < COMPACT_TAB_WIDTH);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const items: MenuItem[] = [
    { key: "dashboard", href: "/(tabs)", icon: "home-outline", label: tab.home, matches: (path) => path === "/" },
    { key: "today", href: "/(tabs)/review", icon: "repeat-outline", label: tab.learn, matches: (path) => path.startsWith("/review") },
    { key: "decks", href: "/(tabs)/library", icon: "book-outline", label: tab.library, matches: (path) => path.startsWith("/library") || path.startsWith("/words") },
    { key: "ielts", href: "/(tabs)/ielts", icon: "school-outline", label: tab.ielts, matches: (path) => path.startsWith("/ielts") || path.startsWith("/expressions") },
    { key: "mastery", href: "/(tabs)/progress", icon: "map-outline", label: tab.progress, matches: (path) => path.startsWith("/progress") },
  ];

  return (
    <View accessibilityRole="tablist" style={[styles.bottomNav, { bottom: Math.max(insets.bottom, 8), left: Math.max(8, (width - Math.min(width - 16, 760)) / 2), right: Math.max(8, (width - Math.min(width - 16, 760)) / 2) }]}>
      {items.map((item) => {
        const active = item.matches?.(pathname) ?? false;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => item.href && router.navigate(item.href)}
            style={({ pressed }) => [styles.bottomNavItem, active && styles.bottomNavItemActive, pressed && styles.pressed]}
          >
            <Ionicons name={item.icon} size={19} color={active ? colors.raised : colors.muted} />
            <Text numberOfLines={1} style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    zIndex: 30,
    left: 8,
    right: 8,
    height: BOTTOM_NAV_HEIGHT,
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.cream,
    shadowColor: colors.brown,
    shadowOpacity: 0.28,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 5 },
    elevation: 8,
  },
  bottomNavItem: { flex: 1, minWidth: 0, minHeight: 66, alignItems: "center", justifyContent: "center", gap: 4, marginHorizontal: 2, borderRadius: 10 },
  bottomNavItemActive: { backgroundColor: colors.brand600 },
  bottomNavLabel: { width: "100%", minWidth: 0, paddingHorizontal: 1, fontFamily: fonts.uiBold, fontSize: 10, lineHeight: 13, textAlign: "center", color: colors.muted },
  bottomNavLabelActive: { color: colors.raised },
  headerSafe: { backgroundColor: colors.paper },
  headerBar: {
    height: 56,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.cream,
    shadowColor: colors.brown,
    shadowOpacity: 0.22,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 5 },
    elevation: 4,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    backgroundColor: colors.raised,
    shadowColor: colors.brown,
    shadowOpacity: 0.15,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 2 },
    elevation: 1,
  },
  brand: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, flexShrink: 1 },
  logoMark: { width: 34, height: 34, borderRadius: 10, shadowColor: colors.brown, shadowOpacity: 0.7, shadowRadius: 0, shadowOffset: { width: 3, height: 3 }, elevation: 3 },
  brandText: { fontFamily: fonts.uiBold, fontSize: 19, letterSpacing: -0.55, color: colors.ink },
  modalRoot: { flex: 1, flexDirection: "row" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(36, 19, 12, 0.42)" },
  drawer: {
    width: "92%",
    maxWidth: 352,
    flex: 1,
    backgroundColor: colors.cream,
    borderRightWidth: 1,
    borderRightColor: colors.line,
    shadowColor: colors.brown,
    shadowOpacity: 0.34,
    shadowRadius: 0,
    shadowOffset: { width: 8, height: 0 },
    elevation: 16,
  },
  drawerHeader: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  menuList: { flexGrow: 1, gap: 18, padding: 16 },
  menuGroup: { gap: 4 },
  menuTitle: { paddingHorizontal: 12, paddingBottom: 4, fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  menuItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 9,
  },
  menuItemActive: { backgroundColor: "rgba(185,78,40,0.10)" },
  menuItemPressed: { backgroundColor: "rgba(84,37,15,0.08)" },
  menuIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  menuIconActive: { borderRadius: 8, backgroundColor: "rgba(185,78,40,0.10)" },
  menuLabel: { flex: 1, fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink },
  menuLabelActive: { color: colors.brand700 },
  drawerFooter: { gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.raised },
  footerControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  localeRow: { alignSelf: "flex-start", flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: colors.line, borderRadius: 9 },
  localeChip: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream },
  localeChipActive: { backgroundColor: colors.brand600 },
  localeChipPressed: { opacity: 0.58 },
  localeText: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.muted },
  localeTextActive: { color: colors.raised },
  themeButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.cream },
  localeError: { fontFamily: fonts.uiMedium, fontSize: 11, lineHeight: 16, color: colors.danger },
  logoutButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    backgroundColor: colors.raised,
  },
  logoutText: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink },
  pressed: { opacity: 0.68, transform: [{ translateY: 1 }] },
});
