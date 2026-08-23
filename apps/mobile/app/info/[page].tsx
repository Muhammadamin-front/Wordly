import { Ionicons } from "@expo/vector-icons";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { Linking, StyleSheet, Text, View } from "react-native";

import { BackButton, Button, Heading, Paper, Screen, Stamp } from "@/components/ui";
import { legalContent, type LegalPage } from "@/info/legal";
import { localeFrom } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";

const iconByPage: Record<LegalPage, keyof typeof Ionicons.glyphMap> = { support: "help-buoy-outline", privacy: "shield-checkmark-outline", terms: "document-text-outline" };

export default function InfoDocument() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const current = Array.isArray(page) ? page[0] : page;
  const selected: LegalPage = current === "privacy" || current === "terms" ? current : "support";
  const { user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const content = legalContent(locale, selected);
  const back = locale === "uz" ? "Yordam va huquqiy ma’lumotlar" : locale === "ru" ? "Помощь и юридическая информация" : "Help and legal";
  const email = locale === "uz" ? "Support’ga yozish" : locale === "ru" ? "Написать в поддержку" : "Email support";
  return <Screen appHeader><BackButton label={back} onPress={() => router.replace("/info" as Href)} /><View style={styles.hero}><Ionicons name={iconByPage[selected]} size={28} color={colors.raised} /><Stamp tone="teal">{content.eyebrow}</Stamp><Heading sub={content.intro}>{content.title}</Heading></View>{selected === "support" ? <Button icon="mail-outline" onPress={() => void Linking.openURL("mailto:support@vocora.uz?subject=Vocora%20support")}>{email}</Button> : null}<View style={styles.sections}>{content.sections.map((section) => <Paper key={section.title} style={styles.section}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={styles.body}>{section.body}</Text></Paper>)}</View><Paper style={styles.review}><Ionicons name="information-circle-outline" size={19} color={colors.rustDark} /><Text style={styles.reviewText}>{content.review}</Text></Paper></Screen>;
}

const styles = StyleSheet.create({ hero: { gap: 11, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, padding: 19, backgroundColor: colors.brand950 }, sections: { gap: 10 }, section: { gap: 7, padding: 15 }, sectionTitle: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink }, body: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 22, color: colors.muted }, review: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: colors.brand100 }, reviewText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 19, color: colors.rustDark } });
