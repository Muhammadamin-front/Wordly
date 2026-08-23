import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Heading, Screen } from "@/components/ui";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: { title: "Yordam va huquqiy ma’lumotlar", subtitle: "Account, to‘lov yoki o‘qish bo‘yicha yordam oling va Vocora siyosatlari bilan tanishing.", support: "Vocora support", supportSub: "Kirish, subscription, to‘lov va o‘qish savollari", privacy: "Maxfiylik siyosati", privacySub: "Ma’lumotlaringizdan qanday foydalanishimiz", terms: "Foydalanish shartlari", termsSub: "Xizmatdan foydalanish qoidalari" },
  ru: { title: "Помощь и юридическая информация", subtitle: "Получите помощь по аккаунту, оплате или обучению и ознакомьтесь с политиками Vocora.", support: "Поддержка Vocora", supportSub: "Вход, подписка, оплата и вопросы по обучению", privacy: "Политика конфиденциальности", privacySub: "Как мы используем ваши данные", terms: "Условия использования", termsSub: "Правила использования сервиса" },
  en: { title: "Help and legal", subtitle: "Get help with your account, payments, or learning, and read Vocora’s policies.", support: "Vocora support", supportSub: "Sign-in, subscription, payment, and learning questions", privacy: "Privacy Policy", privacySub: "How we handle your information", terms: "Terms of Service", termsSub: "Rules for using the service" },
} as const;

export default function InfoHome() {
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const pages: Array<{ page: "support" | "privacy" | "terms"; icon: keyof typeof Ionicons.glyphMap; title: string; body: string; color: string }> = [
    { page: "support", icon: "help-buoy-outline", title: t.support, body: t.supportSub, color: colors.teal },
    { page: "privacy", icon: "shield-checkmark-outline", title: t.privacy, body: t.privacySub, color: colors.rust },
    { page: "terms", icon: "document-text-outline", title: t.terms, body: t.termsSub, color: "#84522B" },
  ];
  return <Screen appHeader><Heading sub={t.subtitle}>{t.title}</Heading><View style={styles.list}>{pages.map((item) => <Pressable key={item.page} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => router.push(`/info/${item.page}` as Href)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: `${item.color}1F` }]}><Ionicons name={item.icon} size={22} color={item.color} /></View><View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.body}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Pressable>)}</View></Screen>;
}

const styles = StyleSheet.create({ list: { gap: 10 }, row: { minHeight: 84, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: .14, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 2 }, icon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 13 }, copy: { flex: 1, minWidth: 0, gap: 3 }, title: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink }, body: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted }, pressed: { opacity: .72, transform: [{ translateY: 1 }] } });
