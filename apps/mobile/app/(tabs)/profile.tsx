import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { authApi, request, type User } from "@/api/client";
import { Button, ErrorNote, Field, Heading, Paper, Screen, Stamp } from "@/components/ui";
import { copy, format, localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

export default function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  const savedLocale = localeFrom(user?.profile.ui_locale);
  const [name, setName] = useState(user?.profile.display_name ?? "");
  const [locale, setLocale] = useState<Locale>(savedLocale);
  const t = copy[locale];
  const changed = name.trim() !== (user?.profile.display_name ?? "") || locale !== savedLocale;

  const save = useMutation({
    mutationFn: () => request<User>("/users/me", {
      method: "PATCH",
      token,
      body: { display_name: name.trim(), ui_locale: locale },
    }),
    onSuccess: (updated) => updateUser(updated),
  });

  const deletion = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Missing access token");
      await authApi.deleteAccount(token);
    },
    onSuccess: async () => { await logout(); },
  });

  function confirmDeletion() {
    deletion.reset();
    Alert.alert(t.deleteAccountTitle, t.deleteAccountBody, [
      { text: t.cancel, style: "cancel" },
      { text: t.deleteAccountConfirm, style: "destructive", onPress: () => deletion.mutate() },
    ]);
  }

  const interestLabels: Record<string, string> = {
    "daily-life": t.interestDaily,
    travel: t.interestTravel,
    work: t.interestWork,
    education: t.interestEducation,
    technology: t.interestTechnology,
    culture: t.interestCulture,
  };
  const interests = (user?.profile.learning_interests ?? []).map((interest) => interestLabels[interest] ?? interest).join(", ");

  return (
    <Screen appHeader>
      <Stamp tone="teal">{`${user?.profile.cefr_level ?? "A1"} · ${user?.profile.learning_goal ?? "general"}`}</Stamp>
      <Heading sub={user?.email ?? ""}>{user?.profile.display_name || t.profile}</Heading>

      <Paper>
        <View style={{ gap: 14 }}>
          <Field label={t.name} value={name} maxLength={80} autoCapitalize="words" onChangeText={(value) => { setName(value); save.reset(); }} />
          <Text style={{ fontFamily: fonts.uiBold, fontSize: 12, color: colors.ink }}>{t.language}</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 8 }}>
            {(["uz", "ru", "en"] as Locale[]).map((option) => {
              const selected = locale === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityLabel={option.toUpperCase()}
                  accessibilityState={{ selected }}
                  onPress={() => { setLocale(option); save.reset(); }}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    minWidth: 52,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: colors.brown,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    backgroundColor: selected ? colors.rust : colors.raised,
                    opacity: pressed ? 0.72 : 1,
                  })}
                >
                  <Text style={{ fontFamily: fonts.uiBold, color: selected ? colors.raised : colors.ink }}>{option.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button disabled={!changed || !name.trim()} loading={save.isPending} onPress={() => save.mutate()}>{save.isSuccess ? t.saved : t.save}</Button>
          <ErrorNote message={save.isError ? t.profileSaveError : null} />
        </View>
      </Paper>

      <Paper>
        <Text style={{ fontFamily: fonts.uiBold, color: colors.ink }}>{t.yourPath}</Text>
        <Text style={{ fontFamily: fonts.ui, color: colors.muted, marginTop: 6 }}>{format(t.pathSummary, { minutes: user?.profile.daily_minutes ?? 0, interests })}</Text>
      </Paper>
      <Button variant="secondary" icon="log-out-outline" onPress={() => void logout()}>{t.logout}</Button>

      <Paper style={{ borderColor: colors.danger }}>
        <View style={{ gap: 12 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: fonts.uiBold, color: colors.danger }}>{t.accountPrivacy}</Text>
            <Text style={{ fontFamily: fonts.ui, color: colors.muted, lineHeight: 21 }}>{t.deleteAccountDescription}</Text>
          </View>
          <Button variant="danger" icon="trash-outline" loading={deletion.isPending} onPress={confirmDeletion}>{t.deleteAccount}</Button>
          <ErrorNote message={deletion.isError ? t.deleteAccountError : null} />
        </View>
      </Paper>
    </Screen>
  );
}
