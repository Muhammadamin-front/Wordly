import AsyncStorage from "@react-native-async-storage/async-storage";

import { ALL_LESSONS, GRAMMAR_LEVELS, LESSONS_BY_LEVEL, type GrammarLesson, type GrammarLevel } from "../../../web/lib/grammar";
import { localiseLesson } from "../../../web/lib/grammar/localise";

export { ALL_LESSONS, GRAMMAR_LEVELS, LESSONS_BY_LEVEL, localiseLesson, type GrammarLesson, type GrammarLevel };

const STORAGE_KEY = "vocora:grammar-done";
const LEGACY_STORAGE_KEY = "wordly:grammar-done";

function decode(value: string | null) {
  try {
    const parsed: unknown = JSON.parse(value ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

export async function loadGrammarDone() {
  const current = await AsyncStorage.getItem(STORAGE_KEY);
  if (current !== null) return decode(current);
  const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy === null) return new Set<string>();
  await AsyncStorage.multiSet([[STORAGE_KEY, legacy]]);
  await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  return decode(legacy);
}

export async function completeGrammarLesson(slug: string) {
  const done = await loadGrammarDone();
  done.add(slug);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  return done;
}
