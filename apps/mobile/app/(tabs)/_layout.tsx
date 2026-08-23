import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Protected } from "@/components/protected";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { BOTTOM_NAV_HEIGHT, COMPACT_TAB_WIDTH, primaryTabLabels } from "@/components/app-header";
import { colors, fonts } from "@/theme/tokens";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  review: "repeat-outline",
  library: "book-outline",
  ielts: "school-outline",
  progress: "map-outline",
};

export default function TabsLayout() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = primaryTabLabels(locale, width < COMPACT_TAB_WIDTH);
  const tabFrameWidth = Math.min(width - 16, 760);
  const tabInset = Math.max(8, (width - tabFrameWidth) / 2);

  return (
    <Protected>
      <Tabs
        screenOptions={({ route }: { route: { name: string } }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.raised,
          tabBarInactiveTintColor: colors.muted,
          tabBarActiveBackgroundColor: colors.brand600,
          tabBarStyle: {
            position: "absolute",
            left: tabInset,
            right: tabInset,
            bottom: Math.max(insets.bottom, 8),
            height: BOTTOM_NAV_HEIGHT,
            paddingHorizontal: 5,
            paddingVertical: 6,
            backgroundColor: colors.cream,
            borderWidth: 1.5,
            borderTopWidth: 1.5,
            borderColor: colors.line,
            borderRadius: 16,
            shadowColor: colors.brown,
            shadowOpacity: 0.28,
            shadowRadius: 0,
            shadowOffset: { width: 4, height: 5 },
            elevation: 8,
          },
          tabBarItemStyle: { flex: 1, minWidth: 0, minHeight: 66, marginHorizontal: 2, borderRadius: 10 },
          tabBarLabelStyle: { marginTop: 0, marginBottom: 1, fontFamily: fonts.uiBold, fontSize: 10, lineHeight: 13 },
          tabBarIconStyle: { marginTop: 0 },
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={icons[route.name] ?? "ellipse-outline"} size={Math.min(size, 20)} color={color} />
          ),
        })}
      >
        <Tabs.Screen name="index" options={{ title: t.home }} />
        <Tabs.Screen name="review" options={{ title: t.learn }} />
        <Tabs.Screen name="library" options={{ title: t.library }} />
        <Tabs.Screen name="ielts" options={{ title: t.ielts }} />
        <Tabs.Screen name="progress" options={{ title: t.progress }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </Protected>
  );
}
