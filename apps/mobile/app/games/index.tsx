import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Heading, Screen } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

export const GAME_TYPES = ["word_match", "speed_quiz", "fill_blank", "audio_guess", "typing_race", "memory", "hangman", "spelling_bee", "sentence_builder", "word_search", "crossword", "story_mode"] as const;
export type GameType = (typeof GAME_TYPES)[number];

type GameMeta = { icon: keyof typeof Ionicons.glyphMap; name: string; description: string; color: string };
const gameMeta: Record<Locale, Record<GameType, GameMeta>> = {
  uz: {
    word_match: { icon: "git-compare-outline", name: "Word Match", description: "So‘z va tarjimani juftlang.", color: colors.teal },
    speed_quiz: { icon: "flash-outline", name: "Speed Quiz", description: "Tezkor tarjima savollari.", color: colors.rust },
    fill_blank: { icon: "create-outline", name: "Fill the Blank", description: "Gapdagi bo‘sh joyni to‘ldiring.", color: colors.teal },
    audio_guess: { icon: "headset-outline", name: "Audio Guess", description: "Talaffuzni eshitib toping.", color: colors.rust },
    typing_race: { icon: "keypad-outline", name: "Typing Race", description: "Tarjimaga mos so‘zni yozing.", color: colors.teal },
    memory: { icon: "grid-outline", name: "Memory", description: "Juftliklarni xotiradan toping.", color: colors.rust },
    hangman: { icon: "text-outline", name: "Hangman", description: "So‘zni harflab toping.", color: colors.teal },
    spelling_bee: { icon: "volume-high-outline", name: "Spelling Bee", description: "Eshitib to‘g‘ri yozing.", color: colors.rust },
    sentence_builder: { icon: "reorder-three-outline", name: "Sentence Builder", description: "Jumlani qayta tuzing.", color: colors.teal },
    word_search: { icon: "search-outline", name: "Word Search", description: "Tarjimadan so‘zni toping.", color: colors.rust },
    crossword: { icon: "apps-outline", name: "Crossword", description: "Izohdan so‘zni toping.", color: colors.teal },
    story_mode: { icon: "book-outline", name: "Story Mode", description: "Hikoyani to‘g‘ri so‘z bilan davom ettiring.", color: colors.rust },
  },
  ru: {
    word_match: { icon: "git-compare-outline", name: "Word Match", description: "Соединяйте слово и перевод.", color: colors.teal },
    speed_quiz: { icon: "flash-outline", name: "Speed Quiz", description: "Быстрые вопросы на перевод.", color: colors.rust },
    fill_blank: { icon: "create-outline", name: "Fill the Blank", description: "Заполните пропуск в предложении.", color: colors.teal },
    audio_guess: { icon: "headset-outline", name: "Audio Guess", description: "Угадайте слово по произношению.", color: colors.rust },
    typing_race: { icon: "keypad-outline", name: "Typing Race", description: "Напишите слово по переводу.", color: colors.teal },
    memory: { icon: "grid-outline", name: "Memory", description: "Находите пары по памяти.", color: colors.rust },
    hangman: { icon: "text-outline", name: "Hangman", description: "Угадайте слово по буквам.", color: colors.teal },
    spelling_bee: { icon: "volume-high-outline", name: "Spelling Bee", description: "Услышьте и напишите правильно.", color: colors.rust },
    sentence_builder: { icon: "reorder-three-outline", name: "Sentence Builder", description: "Соберите предложение.", color: colors.teal },
    word_search: { icon: "search-outline", name: "Word Search", description: "Найдите слово по переводу.", color: colors.rust },
    crossword: { icon: "apps-outline", name: "Crossword", description: "Найдите слово по определению.", color: colors.teal },
    story_mode: { icon: "book-outline", name: "Story Mode", description: "Продолжите историю правильным словом.", color: colors.rust },
  },
  en: {
    word_match: { icon: "git-compare-outline", name: "Word Match", description: "Match a word with its meaning.", color: colors.teal },
    speed_quiz: { icon: "flash-outline", name: "Speed Quiz", description: "Fast translation questions.", color: colors.rust },
    fill_blank: { icon: "create-outline", name: "Fill the Blank", description: "Complete the missing word.", color: colors.teal },
    audio_guess: { icon: "headset-outline", name: "Audio Guess", description: "Guess from pronunciation.", color: colors.rust },
    typing_race: { icon: "keypad-outline", name: "Typing Race", description: "Type the English word.", color: colors.teal },
    memory: { icon: "grid-outline", name: "Memory", description: "Find pairs from memory.", color: colors.rust },
    hangman: { icon: "text-outline", name: "Hangman", description: "Find the word letter by letter.", color: colors.teal },
    spelling_bee: { icon: "volume-high-outline", name: "Spelling Bee", description: "Hear it and spell it.", color: colors.rust },
    sentence_builder: { icon: "reorder-three-outline", name: "Sentence Builder", description: "Rebuild the sentence.", color: colors.teal },
    word_search: { icon: "search-outline", name: "Word Search", description: "Find the word from its meaning.", color: colors.rust },
    crossword: { icon: "apps-outline", name: "Crossword", description: "Find the word from its clue.", color: colors.teal },
    story_mode: { icon: "book-outline", name: "Story Mode", description: "Continue the story with the right word.", color: colors.rust },
  },
};

export function metaFor(type: GameType, locale: Locale) { return gameMeta[locale][type]; }

export default function GamesHub() {
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const copy = locale === "uz"
    ? { title: "O‘yinlar", subtitle: "Har bir o‘yin — so‘zlarni eslab qolish uchun qisqa, foydali mashq." }
    : locale === "ru"
      ? { title: "Игры", subtitle: "Каждая игра — короткая полезная практика для запоминания слов." }
      : { title: "Games", subtitle: "Every game is a short, useful way to remember more words." };

  return (
    <Screen appHeader>
      <View style={styles.hero}>
        <Ionicons name="game-controller-outline" size={28} color={colors.raised} />
        <Heading sub={copy.subtitle}>{copy.title}</Heading>
      </View>
      <View style={styles.grid}>
        {GAME_TYPES.map((type) => {
          const meta = metaFor(type, locale);
          return <Pressable key={type} accessibilityRole="button" accessibilityLabel={meta.name} onPress={() => router.push({ pathname: "/games/[type]", params: { type } } as never)} style={({ pressed }) => [styles.game, pressed && styles.gamePressed]}>
            <View style={[styles.icon, { backgroundColor: `${meta.color}1A`, borderColor: `${meta.color}80` }]}><Ionicons name={meta.icon} size={21} color={meta.color} /></View>
            <View style={styles.gameCopy}><Text style={styles.gameName}>{meta.name}</Text><Text style={styles.gameDescription}>{meta.description}</Text></View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>;
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 12, padding: 20, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, backgroundColor: colors.brand950, shadowColor: colors.brown, shadowOpacity: 0.24, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  grid: { gap: 10 },
  game: { minHeight: 82, flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.cream },
  gamePressed: { opacity: 0.72, transform: [{ translateY: 1 }] },
  icon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderRadius: 12 },
  gameCopy: { flex: 1, minWidth: 0, gap: 4 },
  gameName: { fontFamily: fonts.uiBold, fontSize: 15, color: colors.ink },
  gameDescription: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 18, color: colors.muted },
});
