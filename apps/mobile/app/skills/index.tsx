import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Heading, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

type Skill = { key: "grammar" | "ielts"; icon: keyof typeof Ionicons.glyphMap; name: string; description: string; color: string };
const content: Record<Locale, { title: string; subtitle: string; skills: Skill[] }> = {
  uz: { title: "Ko‘nikmalar", subtitle: "Lug‘atni haqiqiy o‘qish, yozish, tinglash va grammatikada qo‘llang.", skills: [
    { key: "grammar", icon: "shapes-outline", name: "Grammatika", description: "Darajangizga mos 10 ta savol bilan mashq qiling.", color: colors.rust },
    { key: "ielts", icon: "school-outline", name: "IELTS practice", description: "Reading, Writing, Listening va Speaking mashqlari.", color: colors.teal },
  ] },
  ru: { title: "Навыки", subtitle: "Применяйте словарь в чтении, письме, аудировании и грамматике.", skills: [
    { key: "grammar", icon: "shapes-outline", name: "Грамматика", description: "Практика из 10 вопросов для вашего уровня.", color: colors.rust },
    { key: "ielts", icon: "school-outline", name: "IELTS practice", description: "Практика Reading, Writing, Listening и Speaking.", color: colors.teal },
  ] },
  en: { title: "Skills", subtitle: "Put your vocabulary to use through grammar and focused IELTS practice.", skills: [
    { key: "grammar", icon: "shapes-outline", name: "Grammar", description: "Practise your level with a focused set of 10 questions.", color: colors.rust },
    { key: "ielts", icon: "school-outline", name: "IELTS practice", description: "Reading, Writing, Listening and Speaking practice.", color: colors.teal },
  ] },
};

export default function SkillsHub() {
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = content[locale];
  return <Screen appHeader><View style={styles.hero}><Ionicons name="sparkles-outline" size={27} color={colors.onAccent} /><Heading sub={t.subtitle}>{t.title}</Heading></View><View style={styles.list}>{t.skills.map((skill) => <Pressable key={skill.key} accessibilityRole="button" accessibilityLabel={skill.name} onPress={() => router.push((skill.key === "grammar" ? "/skills/grammar" : "/(tabs)/ielts") as never)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: `${skill.color}1A`, borderColor: `${skill.color}80` }]}><Ionicons name={skill.icon} size={22} color={skill.color} /></View><View style={styles.copy}><Text style={styles.name}>{skill.name}</Text><Text style={styles.description}>{skill.description}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>)}</View></Screen>;
}

const styles = StyleSheet.create({
  hero: { gap: 12, padding: 20, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, backgroundColor: colors.inkSurface, shadowColor: colors.brown, shadowOpacity: 0.24, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  list: { gap: 10 },
  item: { minHeight: 86, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
  icon: { width: 47, height: 47, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 12 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink },
  description: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted },
});
