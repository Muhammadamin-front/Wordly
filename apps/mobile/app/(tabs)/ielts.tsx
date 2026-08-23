import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/ui";
import { getIeltsResources, type IeltsSkill } from "@/ielts/content";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const labels = {
  uz: { eyebrow: "IELTS lug'at markazi", title: "IELTS baholaydigan tilni o'rganing", subtitle: "Yuqori qiymatli model javoblar, aniq strategiyalar, akademik collocation va skillga mos lug'at.", words: "IELTS so'zlari", writingCta: "Yozish", skills: "4 ko'nikma", paths: "O'rganish yo'nalishlari", brand: "Vocora avvalo vocabulary platformasi. IELTS esa lug'atni real imtihon kontekstida mustahkamlovchi qo'shimcha markaz.", reading: "O'qish", listening: "Tinglash", writing: "Yozish", speaking: "Gapirish", descriptions: ["Har bir asosiy Task 1 va Task 2 turi uchun model tuzilmalar va lug'at.", "Tuzoqlar, parafraz va savol turlari uchun bosqichma-bosqich qo'llanma.", "120 mavzu, Band 8–9 javob modellari va tabiiy iboralar.", "Section 1–4, aksentlar, raqamlar, xaritalar va keng tarqalgan xatolar."], units: ["12 essay turi", "8 qo'llanma", "120 mavzu", "8 resurs"], topics: "mavzu", resources: "resurs", resourceKicker: "Lug'at resursi", resourceTitle: "Lug'at kutubxonasi" },
  ru: { eyebrow: "Центр лексики IELTS", title: "Изучайте язык, который ценится на IELTS", subtitle: "Модельные ответы, чёткие стратегии, академические коллокации и лексика по каждому навыку.", words: "Слова IELTS", writingCta: "Письмо", skills: "4 навыка", paths: "Направления обучения", brand: "Vocora прежде всего развивает словарный запас. IELTS закрепляет лексику в реальном контексте экзамена.", reading: "Чтение", listening: "Аудирование", writing: "Письмо", speaking: "Говорение", descriptions: ["Модели и лексика для основных типов Task 1 и Task 2.", "Пошаговые стратегии по ловушкам, парафразу и типам вопросов.", "120 тем, ответы Band 8–9 и естественные выражения.", "Sections 1–4, акценты, числа, карты и частые ошибки."], units: ["12 типов эссе", "8 руководств", "120 тем", "8 ресурсов"], topics: "тем", resources: "ресурсов", resourceKicker: "Лексический ресурс", resourceTitle: "Библиотека лексики" },
  en: { eyebrow: "IELTS vocabulary hub", title: "Learn the language IELTS rewards", subtitle: "High-value model answers, clear strategies, academic collocations, and skill-focused vocabulary.", words: "IELTS words", writingCta: "Writing", skills: "4 skills", paths: "Learning paths", brand: "Vocora is a vocabulary platform first. IELTS strengthens vocabulary in real exam contexts.", reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking", descriptions: ["Model structures and vocabulary for every major Task 1 and Task 2 type.", "Step-by-step guides for traps, paraphrase, and every common question type.", "120 topics, Band 8–9 model answers, and natural phrases.", "Sections 1–4, accents, numbers, maps, and common mistakes."], units: ["12 essay types", "8 guides", "120 topics", "8 resources"], topics: "topics", resources: "resources", resourceKicker: "Vocabulary resource", resourceTitle: "Vocabulary library" },
} as const;

const skillMeta = [
  { key: "writing", icon: "create-outline" as const },
  { key: "reading", icon: "book-outline" as const },
  { key: "speaking", icon: "mic-outline" as const },
  { key: "listening", icon: "headset-outline" as const },
] satisfies { key: IeltsSkill; icon: keyof typeof Ionicons.glyphMap }[];

export default function Ielts() {
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const resources = getIeltsResources(locale);

  const skillName = (key: string) => t[key as keyof Pick<typeof t, "reading" | "listening" | "writing" | "speaking">];
  return (
    <Screen appHeader>
      <View style={styles.hero}>
        <Text style={styles.watermark}>IELTS</Text>
        <View style={styles.eyebrow}><Ionicons name="sparkles" size={15} color={colors.gold500} /><Text style={styles.eyebrowText}>{t.eyebrow}</Text></View>
        <Text style={styles.heroTitle}>{t.title}</Text>
        <Text style={styles.heroBody}>{t.subtitle}</Text>
        <View style={styles.heroActions}>
          <Pressable accessibilityRole="button" accessibilityLabel={t.words} onPress={() => router.push({ pathname: "/library/[key]", params: { key: "ielts", name: t.words } })} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>{t.words}</Text><Ionicons name="arrow-forward" size={16} color={colors.raised} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t.writingCta} onPress={() => router.push({ pathname: "/ielts/[skill]", params: { skill: "writing" } })} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>{t.writingCta}</Text><Ionicons name="arrow-forward" size={16} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>600+</Text><Text style={styles.statLabel}>{t.words}</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>120</Text><Text style={styles.statLabel}>{t.topics}</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{resources.length}</Text><Text style={styles.statLabel}>{t.resources}</Text></View>
        </View>
        <View style={styles.brandNote}><Ionicons name="library-outline" size={16} color={colors.gold500} /><Text style={styles.brandText}>{t.brand}</Text></View>
      </View>

      <View style={styles.sectionIntro}><Text style={styles.kicker}>{t.skills}</Text><Text style={styles.sectionTitle}>{t.paths}</Text></View>
      <View style={styles.skillList}>
        {skillMeta.map((skill, index) => (
          <Pressable
            key={skill.key}
            accessibilityRole="button"
            accessibilityLabel={skillName(skill.key)}
            onPress={() => router.push({ pathname: "/ielts/[skill]", params: { skill: skill.key } })}
            style={({ pressed }) => [styles.skillCard, pressed && styles.pressed]}
          >
            <View style={styles.skillTop}><View style={styles.skillIcon}><Ionicons name={skill.icon} size={21} color={colors.brand600} /></View><Ionicons name="arrow-forward" size={18} color={colors.muted} /></View>
            <View style={styles.skillBottom}>
              <View style={styles.skillTitleRow}><Text style={styles.skillTitle}>{skillName(skill.key)}</Text><Text style={styles.skillUnit}>{t.units[index]}</Text></View>
              <Text style={styles.skillDescription}>{t.descriptions[index]}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.resourceIntro}>
        <View style={styles.resourceIcon}><Ionicons name="stats-chart-outline" size={18} color={colors.teal} /></View>
        <View><Text style={styles.kicker}>{t.resourceKicker}</Text><Text style={styles.resourceTitle}>{t.resourceTitle}</Text></View>
      </View>
      <View style={styles.resourceList}>
        {resources.map((resource) => (
          <Pressable
            key={resource.slug}
            accessibilityRole="button"
            accessibilityLabel={resource.title}
            onPress={() => router.push({ pathname: "/ielts/resource/[slug]", params: { slug: resource.slug } })}
            style={({ pressed }) => [styles.resourceCard, pressed && styles.pressed]}
          >
            <View style={styles.resourceCopy}><Text style={styles.resourceEyebrow}>{resource.eyebrow}</Text><Text style={styles.resourceName}>{resource.title}</Text></View>
            <Ionicons name="arrow-forward" size={17} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { position: "relative", gap: 15, overflow: "hidden", padding: 19, borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.cream, shadowColor: colors.brand950, shadowOpacity: 0.09, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  watermark: { position: "absolute", right: -3, top: -9, fontFamily: fonts.display, fontSize: 86, letterSpacing: 1, color: "rgba(185,78,40,0.08)" },
  eyebrow: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 9, minHeight: 30, borderWidth: 1, borderColor: colors.teal, borderRadius: 8, backgroundColor: "rgba(70,120,120,0.10)" },
  eyebrowText: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase", color: colors.brand700 },
  heroTitle: { maxWidth: 310, fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: 0.6, color: colors.ink, textTransform: "uppercase" },
  heroBody: { maxWidth: 315, fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted },
  heroActions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  primaryButton: { alignSelf: "flex-start", minHeight: 46, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 17, borderWidth: 1, borderColor: colors.brand800, borderRadius: 11, backgroundColor: colors.brand600, shadowColor: colors.brown, shadowOpacity: 0.72, shadowRadius: 0, shadowOffset: { width: 3, height: 4 }, elevation: 3 },
  primaryButtonText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.raised },
  secondaryButton: { alignSelf: "flex-start", minHeight: 46, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 17, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.raised, shadowColor: colors.brown, shadowOpacity: 0.15, shadowRadius: 0, shadowOffset: { width: 2, height: 3 }, elevation: 2 },
  secondaryButtonText: { fontFamily: fonts.uiBold, fontSize: 13, color: colors.ink },
  stats: { flexDirection: "row", gap: 7, padding: 7, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.cream },
  stat: { flex: 1, minHeight: 72, alignItems: "center", justifyContent: "center", padding: 7, borderRadius: 9, backgroundColor: colors.raised },
  statValue: { fontFamily: fonts.display, fontSize: 29, lineHeight: 32, color: colors.ink },
  statLabel: { marginTop: 2, fontFamily: fonts.uiBold, fontSize: 8.5, lineHeight: 12, textAlign: "center", textTransform: "uppercase", color: colors.muted },
  brandNote: { marginHorizontal: -19, marginBottom: -19, marginTop: 3, minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 19, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.brand50 },
  brandText: { flex: 1, fontFamily: fonts.uiBold, fontSize: 10.5, lineHeight: 16, color: colors.brand800 },
  sectionIntro: { gap: 4, marginTop: 6 },
  kicker: { fontFamily: fonts.uiBold, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: colors.gold500 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  skillList: { gap: 11 },
  skillCard: { minHeight: 168, justifyContent: "space-between", padding: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.cream, shadowColor: colors.brand950, shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  skillTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  skillIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.brand200, borderRadius: 12, backgroundColor: colors.brand50 },
  skillBottom: { gap: 8, paddingTop: 24 },
  skillTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  skillTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.ink },
  skillUnit: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.teal, borderRadius: 8, backgroundColor: "rgba(70,120,120,0.10)", fontFamily: fonts.uiBold, fontSize: 9, color: colors.teal },
  skillDescription: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 20, color: colors.muted },
  resourceIntro: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 11 },
  resourceIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.raised },
  resourceTitle: { marginTop: 2, fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  resourceList: { gap: 9 },
  resourceCard: { minHeight: 78, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 15, borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.12, shadowRadius: 0, shadowOffset: { width: 3, height: 3 }, elevation: 2 },
  resourceCopy: { flex: 1, gap: 4 },
  resourceEyebrow: { fontFamily: fonts.uiBold, fontSize: 9.5, letterSpacing: 0.55, textTransform: "uppercase", color: colors.teal },
  resourceName: { fontFamily: fonts.uiBold, fontSize: 13.5, lineHeight: 19, color: colors.ink },
  pressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
});
