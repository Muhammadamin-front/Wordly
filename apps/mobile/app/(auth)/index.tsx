import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin, GoogleSigninButton, isSuccessResponse } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "@/api/client";
import { Brand, Button, ErrorNote, Field } from "@/components/ui";
import { copy, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { colors, fonts } from "@/theme/tokens";

const clientIds = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export default function AuthScreen() {
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [locale, setLocale] = useState<Locale>("uz");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const { accept } = useAuth();
  const t = copy[locale];
  const googleConfigured = Platform.select({
    ios: Boolean(clientIds.webClientId && clientIds.iosClientId),
    android: Boolean(clientIds.webClientId),
    default: Boolean(clientIds.webClientId),
  }) ?? false;

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let mounted = true;
    void AppleAuthentication.isAvailableAsync()
      .then((available) => { if (mounted) setAppleAvailable(available); })
      .catch(() => { if (mounted) setAppleAvailable(false); });
    return () => { mounted = false; };
  }, []);

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError(t.email);
      return;
    }
    if (registering && !normalizedName) {
      setError(t.name);
      return;
    }
    if (registering && password.length < 8) {
      setError(t.passwordHint);
      return;
    }
    if (!password) {
      setError(t.password);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const pair = registering
        ? await authApi.register({ email: normalizedEmail, password, display_name: normalizedName, ui_locale: locale })
        : await authApi.login({ email: normalizedEmail, password });
      await accept(pair);
      router.replace("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError(t.email);
      return;
    }
    setResetBusy(true);
    setResetSent(false);
    setError(null);
    try {
      await authApi.forgotPassword(normalizedEmail);
      setResetSent(true);
    } catch {
      setError(t.genericError);
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <SafeAreaView edges={[]} style={localStyles.safe}>
      <ImageBackground source={require("../../assets/images/vocora-auth-poster.png")} resizeMode="cover" style={localStyles.background}>
        <View style={localStyles.scrim} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={localStyles.keyboard}>
          <ScrollView contentContainerStyle={localStyles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <SafeAreaView edges={["top", "bottom"]} style={localStyles.sheet}>
              <View style={localStyles.topRow}>
                <Brand />
                <View style={localStyles.languageRow} accessibilityRole="radiogroup">
                  {(["uz", "ru", "en"] as Locale[]).map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityLabel={option.toUpperCase()}
                      accessibilityState={{ checked: locale === option }}
                      onPress={() => setLocale(option)}
                      style={({ pressed }) => [localStyles.languageButton, locale === option && localStyles.languageSelected, pressed && localStyles.pressed]}
                    >
                      <Text style={[localStyles.languageText, locale === option && localStyles.languageTextSelected]}>{option.toUpperCase()}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={localStyles.heading}>
                <Text style={localStyles.title}>{registering ? t.register : t.welcome}</Text>
                <Text style={localStyles.subtitle}>{registering ? t.registerSub : t.loginSub}</Text>
              </View>

              <View style={localStyles.form}>
                {registering ? <Field label={t.name} value={name} onChangeText={setName} autoCapitalize="words" maxLength={80} returnKeyType="next" /> : null}
                <Field label={t.email} value={email} onChangeText={(value) => { setEmail(value); setResetSent(false); }} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" returnKeyType="next" />
                <Field label={t.password} value={password} onChangeText={setPassword} secureTextEntry maxLength={128} returnKeyType="done" onSubmitEditing={() => void submit()} />
                {!registering ? (
                  <Pressable accessibilityRole="button" accessibilityLabel={t.forgotPassword} disabled={resetBusy} onPress={() => void requestPasswordReset()} style={({ pressed }) => [localStyles.forgotButton, (pressed || resetBusy) && localStyles.socialDisabled]}>
                    <Text style={localStyles.forgotText}>{resetBusy ? t.loading : t.forgotPassword}</Text>
                  </Pressable>
                ) : null}
                {resetSent ? <Text accessibilityRole="alert" style={localStyles.successNote}>{t.resetSent}</Text> : null}
                <ErrorNote message={error} />
                <Button loading={busy} onPress={() => void submit()}>{registering ? t.registerButton : t.login}</Button>
              </View>

              <View style={localStyles.divider}><View style={localStyles.dividerLine} /><Text style={localStyles.dividerText}>{t.or}</Text><View style={localStyles.dividerLine} /></View>
              <View style={localStyles.socialRow}>
                {googleConfigured ? (
                  <GoogleSignIn locale={locale} label={t.google} errorMessage={t.genericError} disabled={busy} onError={setError} />
                ) : (
                  <View style={[localStyles.socialButton, localStyles.socialDisabled]}><Ionicons name="logo-google" size={21} color={colors.muted} /><Text style={localStyles.socialText}>{t.google}</Text></View>
                )}
                {appleAvailable ? <AppleSignIn label={t.apple} errorMessage={t.genericError} disabled={busy} onError={setError} /> : null}
              </View>
              {!googleConfigured ? <Text style={localStyles.setupNote}>{t.googleSetup}</Text> : null}

              <View style={localStyles.bottomDivider} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${registering ? t.haveAccount : t.noAccount} ${registering ? t.login : t.registerButton}`}
                onPress={() => { setRegistering((value) => !value); setError(null); setResetSent(false); }}
                style={({ pressed }) => [localStyles.modeToggle, pressed && localStyles.pressed]}
              >
                <Text style={localStyles.modeText}>{registering ? t.haveAccount : t.noAccount} <Text style={localStyles.modeLink}>{registering ? t.login : t.registerButton}</Text></Text>
              </Pressable>
            </SafeAreaView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function GoogleSignIn({ locale, label, errorMessage, disabled, onError }: { locale: Locale; label: string; errorMessage: string; disabled: boolean; onError: (message: string | null) => void }) {
  const { accept } = useAuth();
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: clientIds.webClientId,
      ...(clientIds.iosClientId ? { iosClientId: clientIds.iosClientId } : {}),
    });
  }, []);

  async function signIn() {
    setBusy(true);
    onError(null);
    try {
      if (Platform.OS === "android") await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) return;
      if (!response.data.idToken) throw new Error("Google did not return an identity token.");
      await accept(await authApi.google(response.data.idToken, locale));
      router.replace("/");
    } catch {
      onError(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  return <GoogleSigninButton accessibilityLabel={label} accessibilityState={{ disabled, busy }} color={theme === "dark" ? GoogleSigninButton.Color.Dark : GoogleSigninButton.Color.Light} disabled={disabled || busy} onPress={() => void signIn()} size={GoogleSigninButton.Size.Wide} style={localStyles.googleButton} />;
}

function AppleSignIn({ label, errorMessage, disabled, onError }: { label: string; errorMessage: string; disabled: boolean; onError: (message: string | null) => void }) {
  const { accept } = useAuth();
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    onError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!credential.identityToken) throw new Error("Apple did not return an identity token.");
      const displayName = [credential.fullName?.givenName, credential.fullName?.middleName, credential.fullName?.familyName].filter(Boolean).join(" ") || undefined;
      await accept(await authApi.apple(credential.identityToken, displayName));
      router.replace("/");
    } catch (caught) {
      if ((caught as { code?: string }).code !== "ERR_REQUEST_CANCELED") onError(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View pointerEvents={disabled || busy ? "none" : "auto"} style={(disabled || busy) && localStyles.socialDisabled}>
      <AppleAuthentication.AppleAuthenticationButton
        accessibilityLabel={label}
        buttonStyle={theme === "dark" ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        cornerRadius={12}
        onPress={() => void signIn()}
        style={localStyles.appleButton}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brand950 },
  background: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(36,19,12,0.42)" },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 22, paddingVertical: 28 },
  sheet: { width: "100%", maxWidth: 480, alignSelf: "center", gap: 24, padding: 25, borderWidth: 1.5, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.cream, shadowColor: colors.brown, shadowOpacity: 0.48, shadowRadius: 0, shadowOffset: { width: 10, height: 12 }, elevation: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  languageRow: { flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.raised },
  languageButton: { minWidth: 40, minHeight: 44, alignItems: "center", justifyContent: "center" },
  languageSelected: { margin: 2, minWidth: 38, minHeight: 40, borderRadius: 7, backgroundColor: colors.brand600 },
  languageText: { fontFamily: fonts.uiMedium, color: colors.muted, fontSize: 12 },
  languageTextSelected: { color: colors.raised },
  heading: { alignItems: "center", gap: 10 },
  title: { fontFamily: fonts.display, fontSize: 40, lineHeight: 43, letterSpacing: 0.7, color: colors.ink, textAlign: "center", textTransform: "uppercase" },
  subtitle: { maxWidth: 290, fontFamily: fonts.ui, fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: "center" },
  form: { gap: 15 },
  forgotButton: { minHeight: 44, alignSelf: "flex-end", justifyContent: "center", marginTop: -10, paddingLeft: 14 },
  forgotText: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.rustDark },
  successNote: { fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 18, color: colors.teal },
  divider: { flexDirection: "row", alignItems: "center", gap: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.ui, fontSize: 11, color: colors.muted },
  socialRow: { gap: 12 },
  socialButton: { minHeight: 52, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.raised },
  socialText: { fontFamily: fonts.uiBold, fontSize: 14, color: colors.ink },
  googleButton: { width: "100%", height: 52 },
  appleButton: { width: "100%", height: 52 },
  socialDisabled: { opacity: 0.48 },
  setupNote: { marginTop: -15, fontFamily: fonts.ui, fontSize: 10, lineHeight: 15, color: colors.muted, textAlign: "center" },
  bottomDivider: { height: 1, backgroundColor: colors.line },
  modeToggle: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  modeText: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, textAlign: "center" },
  modeLink: { fontFamily: fonts.uiBold, color: colors.ink },
  pressed: { opacity: 0.7, transform: [{ translateY: 1 }] },
});
