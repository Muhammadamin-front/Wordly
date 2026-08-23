import { Redirect, router, useLocalSearchParams } from "expo-router";

import { ListeningPracticeNative } from "@/components/ielts/listening-practice-native";
import { ReadingPracticeNative } from "@/components/ielts/reading-practice-native";
import { SpeakingPracticeNative } from "@/components/ielts/speaking-practice-native";
import { WritingPracticeNative } from "@/components/ielts/writing-practice-native";
import { Screen } from "@/components/ui";
import { IELTS_SKILLS, type IeltsSkill } from "@/ielts/content";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";

export default function IeltsSkillScreen() {
  const { skill: rawSkill } = useLocalSearchParams<{ skill?: string }>();
  const { user, token } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const skill = IELTS_SKILLS.includes(rawSkill as IeltsSkill) ? rawSkill as IeltsSkill : null;

  if (!skill) {
    return <Redirect href="/(tabs)/ielts" />;
  }

  if (skill === "reading") {
    return (
      <Screen appHeader appFooter>
        <ReadingPracticeNative locale={locale} scope={user?.id ?? "guest"} onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/ielts")} />
      </Screen>
    );
  }

  if (skill === "speaking") {
    return (
      <Screen appHeader appFooter scroll={false}>
        <SpeakingPracticeNative locale={locale} scope={user?.id ?? "guest"} onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/ielts")} />
      </Screen>
    );
  }

  if (skill === "writing") {
    return (
      <Screen appHeader appFooter>
        <WritingPracticeNative locale={locale} token={token} onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/ielts")} />
      </Screen>
    );
  }

  if (skill === "listening") {
    return (
      <Screen appHeader appFooter>
        <ListeningPracticeNative locale={locale} token={token} onBack={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/ielts")} />
      </Screen>
    );
  }

  return null;
}
