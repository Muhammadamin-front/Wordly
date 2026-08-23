import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import type { WordPage } from "@/api/client";
import { WordDetailSheet } from "@/components/word-detail-sheet";
import type { Locale } from "@/i18n";
import { colors, fonts } from "@/theme/tokens";

type WordItem = WordPage["items"][number];

const labels = {
  uz: { flip: "Tarjimani ko'rish", front: "So'z tomoniga qaytarish", detail: "Batafsil ko'rish", add: "Kartalarga qo'shish", added: "Qo'shildi", retry: "Qayta urinib ko'ring", del: "O'chirish", listen: "Talaffuzni eshitish" },
  ru: { flip: "Показать перевод", front: "Вернуться к слову", detail: "Подробнее", add: "Добавить в карточки", added: "Добавлено", retry: "Попробуйте снова", del: "Удалить", listen: "Прослушать произношение" },
  en: { flip: "Show translation", front: "Return to word", detail: "View details", add: "Add to cards", added: "Added", retry: "Try again", del: "Delete", listen: "Hear pronunciation" },
} as const;

export function VocabularyCard({
  word,
  locale,
  onAdd,
  added,
  adding,
  addError,
  onDelete,
}: {
  word: WordItem;
  locale: Locale;
  /** Present on search/shelf listings; omitted on plain-display contexts. */
  onAdd?: () => void;
  added?: boolean;
  adding?: boolean;
  addError?: boolean;
  /** Present only in My Cards, where the card is already owned. */
  onDelete?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const t = labels[locale];
  const category = word.category;
  const categoryName = category
    ? locale === "ru" ? category.name_ru : locale === "en" ? category.name_en : category.name_uz
    : null;
  const primaryTranslation = locale === "ru"
    ? word.primary_translation_ru ?? word.primary_translation_uz
    : word.primary_translation_uz ?? word.primary_translation_ru;
  const secondaryTranslation = locale === "ru" ? word.primary_translation_uz : word.primary_translation_ru;

  return (
    <View style={styles.shadowWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${word.headword}. ${flipped ? t.front : t.flip}`}
        onPress={() => setFlipped((current) => !current)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {flipped ? (
          <View style={styles.face}>
            <Text numberOfLines={1} style={styles.backHeadword}>{word.headword}</Text>
            <Text numberOfLines={2} style={styles.translation}>{primaryTranslation ?? word.pos}</Text>
            {secondaryTranslation && secondaryTranslation !== primaryTranslation ? <Text numberOfLines={1} style={styles.secondaryTranslation}>{secondaryTranslation}</Text> : null}
            {categoryName ? (
              <View style={styles.categoryStamp}>
                {category?.emoji ? <Text style={styles.categoryEmoji}>{category.emoji}</Text> : null}
                <Text numberOfLines={1} style={styles.categoryText}>{categoryName}</Text>
              </View>
            ) : null}
            <View style={styles.backActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t.detail}: ${word.headword}`}
                onPress={() => setDetailOpen(true)}
                style={({ pressed }) => [styles.detailButton, pressed && styles.detailPressed]}
              >
                <Text numberOfLines={1} style={styles.detailText}>{t.detail}</Text>
                <Ionicons name="arrow-up-outline" size={14} color={colors.raised} style={{ transform: [{ rotate: "45deg" }] }} />
              </Pressable>
              {onDelete ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t.del}: ${word.headword}`}
                  onPress={onDelete}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.detailPressed]}
                >
                  <Ionicons name="trash-outline" size={15} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.face}>
            <View style={styles.cardTop}>
              <View style={styles.wordMeta}>
                <View style={styles.levelStamp}><Text style={styles.levelText}>{word.cefr_level}</Text></View>
                <Text numberOfLines={1} style={styles.pos}>{word.pos}</Text>
              </View>
              {onAdd ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={added ? t.added : addError ? `${t.add}: ${word.headword}` : `${t.add}: ${word.headword}`}
                  accessibilityHint={addError ? t.retry : undefined}
                  accessibilityState={{ disabled: added || adding, busy: adding }}
                  disabled={added || adding}
                  onPress={onAdd}
                  style={({ pressed }) => [styles.addButton, added && styles.addButtonDone, addError && styles.addButtonError, pressed && !added && !adding && styles.detailPressed]}
                >
                  {adding ? <ActivityIndicator size="small" color={colors.ink} /> : <Ionicons name={added ? "checkmark" : addError ? "alert-circle-outline" : "add"} size={16} color={added ? colors.gold500 : addError ? colors.danger : colors.ink} />}
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t.listen}: ${word.headword}`}
                onPress={() => { Speech.stop(); Speech.speak(word.headword, { language: "en-US", rate: 0.9 }); }}
                style={({ pressed }) => [styles.audioButton, pressed && styles.detailPressed]}
              ><Ionicons name="volume-medium-outline" size={16} color={colors.ink} /></Pressable>
            </View>
            <Text numberOfLines={1} style={styles.headword}>{word.headword}</Text>
            {word.primary_example_en ? <Text numberOfLines={3} style={styles.example}>{word.primary_example_en}</Text> : <Text style={styles.example}>—</Text>}
          </View>
        )}
      </Pressable>
      <WordDetailSheet summary={word} locale={locale} visible={detailOpen} added={added} adding={adding} addError={addError} onAdd={onAdd} onClose={() => setDetailOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    width: "48%",
    minHeight: 164,
    borderRadius: 12,
    backgroundColor: colors.brown,
    shadowColor: colors.brown,
    shadowOpacity: 0.2,
    shadowRadius: 0,
    shadowOffset: { width: 5, height: 6 },
    elevation: 4,
  },
  card: {
    flex: 1,
    minHeight: 164,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  cardPressed: { transform: [{ translateX: 2 }, { translateY: 2 }], opacity: 0.9 },
  face: { flex: 1, padding: 9 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 5 },
  wordMeta: { minWidth: 0, flex: 1, flexDirection: "row", alignItems: "center", gap: 5 },
  levelStamp: { minWidth: 31, minHeight: 26, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.brand600, borderRadius: 6, backgroundColor: "rgba(185,78,40,0.10)" },
  levelText: { fontFamily: fonts.uiMedium, fontSize: 9, color: colors.brand600 },
  pos: { minWidth: 0, flex: 1, fontFamily: fonts.uiBold, fontSize: 9, color: colors.muted },
  audioButton: { width: 29, height: 29, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 7, backgroundColor: colors.raised, shadowColor: colors.brown, shadowOpacity: 0.18, shadowRadius: 0, shadowOffset: { width: 2, height: 2 }, elevation: 2 },
  headword: { marginTop: 13, fontFamily: fonts.display, fontSize: 23, lineHeight: 27, letterSpacing: 0.4, color: colors.ink, textTransform: "uppercase" },
  example: { marginTop: "auto", paddingLeft: 6, borderLeftWidth: 1, borderLeftColor: colors.brand400, fontFamily: fonts.ui, fontSize: 9, lineHeight: 13, color: colors.muted },
  backHeadword: { fontFamily: fonts.uiMedium, fontSize: 9, color: colors.muted, textTransform: "uppercase" },
  translation: { marginTop: 5, fontFamily: fonts.display, fontSize: 24, lineHeight: 27, letterSpacing: 0.3, color: colors.ink, textTransform: "uppercase" },
  secondaryTranslation: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 9, color: colors.muted },
  categoryStamp: { alignSelf: "flex-start", maxWidth: "100%", marginTop: "auto", minHeight: 26, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, borderWidth: 1, borderColor: colors.teal, borderRadius: 6, backgroundColor: "rgba(70,120,120,0.10)" },
  categoryEmoji: { fontSize: 10 },
  categoryText: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 8, letterSpacing: 0.45, color: colors.teal, textTransform: "uppercase" },
  backActions: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  detailButton: { flex: 1, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: colors.brand950, borderRadius: 7, backgroundColor: colors.brand600, shadowColor: colors.brown, shadowOpacity: 0.75, shadowRadius: 0, shadowOffset: { width: 2, height: 3 }, elevation: 2 },
  deleteButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(220,38,38,0.35)", borderRadius: 7, backgroundColor: "rgba(220,38,38,0.10)" },
  detailPressed: { transform: [{ translateX: 1 }, { translateY: 1 }] },
  detailText: { flexShrink: 1, fontFamily: fonts.uiBold, fontSize: 9, color: colors.raised },
  addButton: { width: 29, height: 29, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 7, backgroundColor: colors.raised, shadowColor: colors.brown, shadowOpacity: 0.18, shadowRadius: 0, shadowOffset: { width: 2, height: 2 }, elevation: 2 },
  addButtonDone: { borderColor: colors.gold500, backgroundColor: "rgba(70,120,120,0.14)" },
  addButtonError: { borderColor: "rgba(220,38,38,0.50)", backgroundColor: "rgba(220,38,38,0.08)" },
});
