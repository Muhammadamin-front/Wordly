import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Speech from "expo-speech";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { request, type Word, type WordPage } from "@/api/client";
import { Button, ErrorNote, Loader } from "@/components/ui";
import type { Locale } from "@/i18n";
import { colors, fonts } from "@/theme/tokens";

type WordSummary = WordPage["items"][number];

const labels = {
  uz: { close: "Yopish", retry: "Qayta urinish", listen: "Talaffuzni eshitish", meaning: "Ma'no", definition: "Ta'rif", usage: "Qo'llanishi", examples: "Misollar", family: "So'z oilasi", mistake: "Ko'p uchraydigan xato", loading: "So'z ma'lumotlari yuklanmoqda", loadError: "So'z ma'lumotlarini yuklab bo'lmadi.", addError: "So'zni kartalarga qo'shib bo'lmadi. Qayta urinib ko'ring.", add: "Kartalarga qo'shish", added: "Kartalarga qo'shildi" },
  ru: { close: "Закрыть", retry: "Повторить", listen: "Прослушать произношение", meaning: "Значение", definition: "Определение", usage: "Употребление", examples: "Примеры", family: "Семья слов", mistake: "Распространённая ошибка", loading: "Загружаем сведения о слове", loadError: "Не удалось загрузить сведения о слове.", addError: "Не удалось добавить слово в карточки. Попробуйте снова.", add: "Добавить в карточки", added: "Добавлено в карточки" },
  en: { close: "Close", retry: "Try again", listen: "Hear pronunciation", meaning: "Meaning", definition: "Definition", usage: "Usage", examples: "Examples", family: "Word family", mistake: "Common mistake", loading: "Loading word details", loadError: "We couldn't load word details.", addError: "We couldn't add this word to your cards. Try again.", add: "Add to cards", added: "Added to cards" },
} as const;

export function WordDetailSheet({ summary, locale, visible, added = false, adding = false, addError = false, onAdd, onClose }: {
  summary: WordSummary;
  locale: Locale;
  visible: boolean;
  added?: boolean;
  adding?: boolean;
  addError?: boolean;
  onAdd?: () => void;
  onClose: () => void;
}) {
  const t = labels[locale];
  const detail = useQuery({ queryKey: ["word", summary.slug], queryFn: () => request<Word>(`/words/${encodeURIComponent(summary.slug)}`), enabled: visible });
  const word = detail.data;
  const firstSense = word?.senses[0];
  const translation = localizedTranslation(firstSense, locale) ?? (locale === "ru" ? summary.primary_translation_ru : summary.primary_translation_uz);
  const category = word?.category ?? summary.category;
  const categoryName = category ? locale === "uz" ? category.name_uz : locale === "ru" ? category.name_ru : category.name_en : null;
  const tags = [word?.cefr_level ?? summary.cefr_level, word?.pos ?? summary.pos, word?.ipa ?? summary.ipa, categoryName].filter(Boolean) as string[];

  return <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" statusBarTranslucent transparent visible={visible}>
    <View style={styles.backdrop}>
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safe}>
        <View accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <View style={styles.titleRow}>
                <Text numberOfLines={2} style={styles.headword}>{summary.headword}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`${t.listen}: ${summary.headword}`} onPress={() => { Speech.stop(); Speech.speak(summary.headword, { language: "en-US", rate: 0.9 }); }} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><Ionicons name="volume-high-outline" size={18} color={colors.teal} /></Pressable>
              </View>
              {translation ? <Text numberOfLines={3} style={styles.translation}>{translation}</Text> : null}
              <View style={styles.tags}>{tags.map((tag) => <View key={tag} style={styles.tag}><Text numberOfLines={1} style={styles.tagText}>{tag}</Text></View>)}</View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t.close} hitSlop={8} onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><Ionicons name="close" size={22} color={colors.ink} /></Pressable>
          </View>
          {onAdd ? <View style={styles.addArea}><Button icon={added ? "checkmark" : "add"} disabled={added} loading={adding} onPress={onAdd}>{added ? t.added : t.add}</Button><ErrorNote message={addError ? t.addError : null} /></View> : null}
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {detail.isLoading ? <Loader label={t.loading} /> : null}
            {detail.isError ? <View style={styles.errorState}><Text accessibilityRole="alert" style={styles.error}>{t.loadError}</Text><Button icon="refresh" onPress={() => void detail.refetch()}>{t.retry}</Button></View> : null}
            {word ? <WordDetails word={word} locale={locale} labels={t} /> : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  </Modal>;
}

function WordDetails({ word, locale, labels: t }: { word: Word; locale: Locale; labels: (typeof labels)[Locale] }) {
  return <View style={styles.details}>
    {word.senses.map((sense, index) => <View key={sense.id} style={styles.sense}>
      {word.senses.length > 1 ? <Text style={styles.meaning}>{t.meaning} {index + 1}</Text> : null}
      <Text style={styles.senseTranslation}>{localizedTranslation(sense, locale)}</Text>
      <Section title={t.definition}><Text style={styles.bodyText}>{sense.definition_en}</Text></Section>
      {sense.usage_note ? <Section title={t.usage}><View style={styles.usage}><Ionicons name="bulb-outline" size={17} color={colors.teal} /><Text style={styles.usageText}>{sense.usage_note}</Text></View></Section> : null}
      {sense.examples.length ? <Section title={t.examples}><View style={styles.examples}>{sense.examples.slice(0, 3).map((example) => <View key={example.id} style={styles.example}><Text style={styles.exampleEnglish}>{example.text_en}</Text>{locale !== "en" ? <Text style={styles.exampleTranslation}>{locale === "uz" ? example.text_uz : example.text_ru}</Text> : null}</View>)}</View></Section> : null}
    </View>)}
    {word.word_family ? <Section title={t.family}><Text style={styles.bodyText}>{word.word_family}</Text></Section> : null}
    {word.common_mistake ? <View style={styles.mistake}><View style={styles.mistakeTitle}><Ionicons name="warning-outline" size={17} color={colors.danger} /><Text style={styles.mistakeTitleText}>{t.mistake}</Text></View><Text style={styles.mistakeText}>{word.common_mistake}</Text></View> : null}
  </View>;
}

function localizedTranslation(sense: Word["senses"][number] | undefined, locale: Locale) {
  if (!sense) return null;
  return locale === "uz" ? sense.translation_uz : locale === "ru" ? sense.translation_ru : sense.definition_en;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(36,19,12,0.64)" }, safe: { width: "100%", maxWidth: 760, alignSelf: "center", maxHeight: "100%" }, sheet: { maxHeight: "94%", overflow: "hidden", borderTopWidth: 1.5, borderColor: colors.line, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: colors.raised, shadowColor: colors.brand950, shadowOpacity: 0.34, shadowRadius: 22, shadowOffset: { width: 0, height: -8 }, elevation: 16 }, header: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.cream }, headerCopy: { flex: 1, minWidth: 0, gap: 8 }, titleRow: { flexDirection: "row", alignItems: "center", gap: 8 }, headword: { flexShrink: 1, fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: 0.45, color: colors.ink, textTransform: "uppercase" }, translation: { maxWidth: 540, fontFamily: fonts.uiBold, fontSize: 17, lineHeight: 24, color: colors.rust }, tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, tag: { maxWidth: "100%", borderWidth: 1, borderColor: colors.line, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.raised }, tagText: { fontFamily: fonts.uiBold, fontSize: 10, color: colors.muted }, iconButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.teal, borderRadius: 10, backgroundColor: "rgba(70,120,120,0.10)" }, closeButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 11, backgroundColor: colors.raised }, addArea: { gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.raised }, body: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 34 }, details: { gap: 22 }, sense: { gap: 4, paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: colors.line }, meaning: { fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: 0.5, color: colors.brand600, textTransform: "uppercase" }, senseTranslation: { fontFamily: fonts.uiBold, fontSize: 18, lineHeight: 26, color: colors.ink }, section: { gap: 6, marginTop: 10 }, sectionTitle: { fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: 0.45, color: colors.muted, textTransform: "uppercase" }, bodyText: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 23, color: colors.ink }, usage: { flexDirection: "row", gap: 9, padding: 12, borderWidth: 1, borderColor: "rgba(70,120,120,0.28)", borderRadius: 12, backgroundColor: "rgba(70,120,120,0.08)" }, usageText: { flex: 1, fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.ink }, examples: { gap: 8 }, example: { gap: 5, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.paper }, exampleEnglish: { fontFamily: fonts.uiMedium, fontSize: 14, lineHeight: 21, color: colors.ink }, exampleTranslation: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 19, color: colors.muted }, mistake: { gap: 8, padding: 14, borderWidth: 1, borderColor: "rgba(220,38,38,0.30)", borderRadius: 12, backgroundColor: "rgba(220,38,38,0.06)" }, mistakeTitle: { flexDirection: "row", alignItems: "center", gap: 7 }, mistakeTitleText: { fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: 0.45, color: colors.danger, textTransform: "uppercase" }, mistakeText: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.ink }, errorState: { alignItems: "center", gap: 12, paddingVertical: 24 }, error: { fontFamily: fonts.uiMedium, fontSize: 14, lineHeight: 22, textAlign: "center", color: colors.danger }, pressed: { opacity: 0.66, transform: [{ translateY: 1 }] },
});
