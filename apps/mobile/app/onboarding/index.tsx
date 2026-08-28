import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { request, type Onboarding as OnboardingResponse } from "@/api/client";
import { Button, ErrorNote, Heading, Screen, Stamp } from "@/components/ui";
import { copy, localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = typeof levels[number];
type Goal = "general" | "travel" | "career" | "ielts";
const minutesOptions = [5, 10, 15, 20] as const;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level>("A1");
  const [goal, setGoal] = useState<Goal>("general");
  const [minutes, setMinutes] = useState<5 | 10 | 15 | 20>(10);
  const [chosen, setChosen] = useState<string[]>(["daily-life"]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { token, user, updateUser, logout } = useAuth();
  const t = copy[localeFrom(user?.profile.ui_locale)];

  const goals = useMemo(() => [
    ["general", t.goalGeneral], ["travel", t.goalTravel], ["career", t.goalCareer], ["ielts", t.goalIelts],
  ] as const, [t]);
  const interests = useMemo(() => [
    ["daily-life", t.interestDaily], ["travel", t.interestTravel], ["work", t.interestWork],
    ["education", t.interestEducation], ["technology", t.interestTechnology], ["culture", t.interestCulture],
  ] as const, [t]);

  async function next() {
    setError(null);
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    if (!token || chosen.length === 0) return;

    setBusy(true);
    try {
      const result = await request<OnboardingResponse>("/users/me/onboarding", {
        method: "PUT",
        token,
        body: { cefr_level: level, learning_goal: goal, daily_minutes: minutes, learning_interests: chosen },
      });
      updateUser(result.user);
      router.replace({ pathname: "/(tabs)/review", params: { deckId: result.starter_deck_id } });
    } catch {
      setError(t.onboardingError);
    } finally {
      setBusy(false);
    }
  }

  function toggleInterest(value: string) {
    setChosen((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : current.length < 3 ? [...current, value] : current);
  }

  return (
    <Screen>
      {step === 0 ? <Button variant="quiet" icon="log-out-outline" onPress={() => void logout()}>{t.logout}</Button> : null}
      <Stamp>{`${t.placement} · ${step + 1}/4`}</Stamp>
      {step === 0 ? (
        <>
          <Heading sub={t.levelBody}>{t.level}</Heading>
          <View style={styles.grid} accessibilityRole="radiogroup">
            {levels.map((option) => <Choice key={option} selected={level === option} onPress={() => setLevel(option)} title={option} text="CEFR" radio />)}
          </View>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <Heading sub={t.goalBody}>{t.goal}</Heading>
          <View style={styles.list} accessibilityRole="radiogroup">
            {goals.map(([id, label]) => <Choice key={id} selected={goal === id} onPress={() => setGoal(id)} title={label} text={t.choiceHint} radio />)}
          </View>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Heading sub={t.timeBody}>{t.time}</Heading>
          <View style={styles.grid} accessibilityRole="radiogroup">
            {minutesOptions.map((option) => <Choice key={option} selected={minutes === option} onPress={() => setMinutes(option)} title={`${option}`} text={t.minutes} radio />)}
          </View>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <Heading sub={t.interestsBody}>{t.interests}</Heading>
          <View style={styles.list}>
            {interests.map(([id, label]) => <Choice key={id} selected={chosen.includes(id)} onPress={() => toggleInterest(id)} title={label} text={chosen.includes(id) ? t.selected : ""} />)}
          </View>
        </>
      ) : null}
      <ErrorNote message={error} />
      <View style={styles.actions}>
        {step > 0 ? <Button variant="secondary" onPress={() => { setStep((current) => current - 1); setError(null); }}>{t.back}</Button> : null}
        <Button disabled={step === 3 && chosen.length === 0} loading={busy} onPress={() => void next()}>{step === 3 ? t.startLesson : t.continue}</Button>
      </View>
    </Screen>
  );
}

function Choice({ selected, onPress, title, text, radio = false }: { selected: boolean; onPress: () => void; title: string; text: string; radio?: boolean }) {
  return (
    <Pressable
      accessibilityRole={radio ? "radio" : "checkbox"}
      accessibilityLabel={text ? `${title}, ${text}` : title}
      accessibilityState={radio ? { checked: selected } : { checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.selected]}
    >
      <Text style={[styles.choiceTitle, selected && styles.selectedText]}>{title}</Text>
      {text ? <Text style={[styles.choiceText, selected && styles.selectedText]}>{text}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  list: { gap: 10 },
  choice: { flexGrow: 1, minWidth: "42%", minHeight: 58, borderWidth: 1.2, borderColor: colors.brown, borderRadius: 14, padding: 14, backgroundColor: colors.raised, gap: 4, justifyContent: "center" },
  selected: { backgroundColor: colors.rust, borderColor: colors.ink },
  choiceTitle: { fontFamily: fonts.uiBold, color: colors.ink, fontSize: 15 },
  choiceText: { fontFamily: fonts.ui, color: colors.muted, fontSize: 12, lineHeight: 17 },
  selectedText: { color: colors.onAccent },
  actions: { gap: 10 },
});
