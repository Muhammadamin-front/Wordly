import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { request, type BillingPlan, type BillingStatus, type Checkout, type Referral, type Subscription } from "@/api/client";
import { Button, ErrorNote, Heading, Loader, Paper, Screen, Stamp } from "@/components/ui";
import { localeFrom, type Locale } from "@/i18n";
import { useAuth } from "@/providers/auth-provider";
import { colors, fonts } from "@/theme/tokens";
import { formatApiDate } from "@/utils/dates";

const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? "https://vocora.uz").replace(/\/$/, "");
const labels = {
  uz: { title: "Vocora Premium", subtitle: "Ko‘proq mashq va kuchliroq o‘rganish uchun rejangizni tanlang.", active: "Premium faol", free: "Bepul", monthly: "Oylik Premium", quarterly: "3 oylik Premium", yearly: "Yillik Premium", current: "Joriy reja", pay: "To‘lash", perMonth: "/ oy", perQuarter: "/ 3 oy", perYear: "/ yil", notConfigured: "To‘lov hozircha sozlanmagan.", paymentError: "Checkout sahifasini ochib bo‘lmadi.", mobileStoreNote: "Bu native build tashqi karta checkoutini ochmaydi. Mavjud Premium holatingiz shu hisobda avtomatik ko‘rinadi.", expires: "Amal qilish muddati", cancel: "Obunani bekor qilish", cancelTitle: "Obuna bekor qilinsinmi?", cancelBody: "Premium muddati tugagunicha davom etadi, keyin yangilanmaydi.", cancelConfirm: "Bekor qilish", referral: "Do‘stingizni taklif qiling", referralBody: "Ushbu kodni ulashing.", invited: "taklif qilindi", rewarded: "mukofot oldi", refresh: "Yangilash", loading: "Tariflar yuklanmoqda...", retry: "Qayta urinish", provider: "To‘lov usulini tanlang" },
  ru: { title: "Vocora Premium", subtitle: "Выберите план для более сильной и регулярной практики.", active: "Premium активен", free: "Бесплатно", monthly: "Premium на месяц", quarterly: "Premium на 3 месяца", yearly: "Premium на год", current: "Текущий план", pay: "Оплатить", perMonth: "/ месяц", perQuarter: "/ 3 мес", perYear: "/ год", notConfigured: "Оплата пока не настроена.", paymentError: "Не удалось открыть страницу оплаты.", mobileStoreNote: "Эта нативная сборка не открывает внешнюю оплату картой. Ваш текущий статус Premium автоматически отображается в этом аккаунте.", expires: "Действует до", cancel: "Отменить подписку", cancelTitle: "Отменить подписку?", cancelBody: "Premium останется активным до окончания срока и не будет продлён.", cancelConfirm: "Отменить", referral: "Пригласите друга", referralBody: "Поделитесь этим кодом.", invited: "приглашено", rewarded: "получили награду", refresh: "Обновить", loading: "Загружаем тарифы...", retry: "Повторить", provider: "Выберите способ оплаты" },
  en: { title: "Vocora Premium", subtitle: "Choose a plan for stronger, more consistent practice.", active: "Premium active", free: "Free", monthly: "Premium monthly", quarterly: "Premium quarterly", yearly: "Premium yearly", current: "Current plan", pay: "Pay", perMonth: "/ month", perQuarter: "/ 3mo", perYear: "/ year", notConfigured: "Payments are not configured yet.", paymentError: "We couldn't open the checkout page.", mobileStoreNote: "This native build does not open an external card checkout. Your existing Premium status appears automatically on this account.", expires: "Expires", cancel: "Cancel subscription", cancelTitle: "Cancel subscription?", cancelBody: "Premium stays active until its expiry date and will not renew.", cancelConfirm: "Cancel", referral: "Invite a friend", referralBody: "Share this code.", invited: "invited", rewarded: "rewarded", refresh: "Refresh", loading: "Loading plans...", retry: "Try again", provider: "Choose a payment method" },
} as const;

export default function Billing() {
  const { token, user } = useAuth();
  const locale = localeFrom(user?.profile.ui_locale);
  const t = labels[locale];
  const queryClient = useQueryClient();
  const billing = useQuery({ queryKey: ["billing"], queryFn: async () => {
    const [plans, status, subscription, referral] = await Promise.all([
      request<{ plans: BillingPlan[] }>("/billing/plans", { token }),
      request<BillingStatus>("/billing/status", { token }),
      request<Subscription>("/billing/subscription", { token }),
      request<Referral>("/billing/referral", { token }),
    ]);
    return { plans: plans.plans, status, subscription, referral };
  }, enabled: Boolean(token) });
  const checkout = useMutation({
    mutationFn: async ({ plan, provider }: { plan: BillingPlan; provider: "payme" | "click" | "uzum" }) => {
      const result = await request<Checkout>("/billing/checkout", { method: "POST", token, body: { plan_code: plan.code, provider, return_url: `${WEB_URL}/${locale}/billing` } });
      await WebBrowser.openBrowserAsync(result.checkout_url);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["billing"] }),
  });
  const cancel = useMutation({ mutationFn: () => request<{ message: string }>("/billing/cancel", { method: "POST", token }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["billing"] }) });
  const refresh = () => void billing.refetch();
  const confirmCancel = () => Alert.alert(t.cancelTitle, t.cancelBody, [{ text: t.cancel, style: "cancel" }, { text: t.cancelConfirm, style: "destructive", onPress: () => cancel.mutate() }]);

  if (billing.isLoading) return <Screen appHeader><Loader label={t.loading} /></Screen>;
  if (billing.isError || !billing.data) return <Screen appHeader><Heading>{t.paymentError}</Heading><Button icon="refresh" onPress={refresh}>{t.retry}</Button></Screen>;
  const { plans, status, subscription, referral } = billing.data;
  const error = checkout.isError ? t.paymentError : cancel.isError ? t.paymentError : null;
  return <Screen appHeader refreshing={billing.isRefetching} onRefresh={refresh}><View style={styles.hero}><Ionicons name="diamond-outline" size={27} color={colors.onAccent} /><Heading sub={t.subtitle}>{t.title}</Heading></View>{subscription.is_premium ? <SubscriptionCard locale={locale} subscription={subscription} cancelling={cancel.isPending} onCancel={confirmCancel} /> : null}{!status.checkout_enabled ? <Paper><Text style={styles.info}>{t.notConfigured}</Text></Paper> : null}<Text style={styles.provider}>{t.provider}</Text><View style={styles.plans}>{plans.map((plan) => <PlanCard key={plan.code} locale={locale} plan={plan} status={status} current={subscription.is_premium && subscription.plan_code === plan.code} loading={checkout.isPending} onCheckout={(provider) => checkout.mutate({ plan, provider })} />)}</View><ErrorNote message={error} /><Paper style={styles.referral}><Ionicons name="gift-outline" size={23} color={colors.teal} /><Text style={styles.referralTitle}>{t.referral}</Text><Text style={styles.referralBody}>{t.referralBody}</Text><Text selectable style={styles.referralCode}>{referral.code}</Text><Text style={styles.referralMeta}>{referral.invited} {t.invited} · {referral.rewarded} {t.rewarded}</Text></Paper></Screen>;
}

function SubscriptionCard({ locale, subscription, cancelling, onCancel }: { locale: Locale; subscription: Subscription; cancelling: boolean; onCancel: () => void }) {
  const t = labels[locale];
  const expires = formatApiDate(subscription.expires_at, locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "long", year: "numeric" });
  return <Paper style={styles.active}><View style={styles.activeTop}><View><Text style={styles.activeTitle}>{t.active}</Text><Text style={styles.activePlan}>{subscription.plan_code}</Text></View><Ionicons name="checkmark-circle" size={27} color={colors.teal} /></View>{expires ? <Text style={styles.activeBody}>{t.expires}: {expires}</Text> : null}<Button variant="quiet" loading={cancelling} onPress={onCancel}>{t.cancel}</Button></Paper>;
}

function PlanCard({ locale, plan, status, current, loading, onCheckout }: { locale: Locale; plan: BillingPlan; status: BillingStatus; current: boolean; loading: boolean; onCheckout: (provider: "payme" | "click" | "uzum") => void }) {
  const t = labels[locale];
  // plan.code is "<tier>_<duration>" for every paid plan (plus/pro/max ×
  // monthly/quarterly/yearly) — see PUBLIC_PLAN_CODES in services/plans.py.
  // Mobile still shows a generic "Premium ..." label rather than the
  // Plus/Pro/Max names web now shows; this screen only redirects to web
  // checkout anyway (see canUseHostedCheckout below), so a fuller relabel
  // is deferred with the rest of the mobile pricing UI.
  const tier = plan.code.split("_")[0];
  const durationWord = plan.code.endsWith("_yearly") ? t.yearly : plan.code.endsWith("_quarterly") ? t.quarterly : t.monthly;
  const durationPeriod = plan.code.endsWith("_yearly") ? t.perYear : plan.code.endsWith("_quarterly") ? t.perQuarter : t.perMonth;
  const title = plan.code === "free" ? t.free : tier === "plus" ? durationWord : `${tier[0].toUpperCase()}${tier.slice(1)} ${durationWord}`;
  const periodic = plan.code === "free" ? "" : durationPeriod;
  const price = new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "uz-UZ").format(plan.price_som);
  const canUseHostedCheckout = Platform.OS === "web";
  const sellable = plan.code !== "free" && status.checkout_enabled && !current && canUseHostedCheckout;
  const awaitingStoreBilling = plan.code !== "free" && status.checkout_enabled && !current && !canUseHostedCheckout;
  return <Paper style={[styles.plan, current && styles.planCurrent]}>{current ? <Stamp tone="teal">{t.current}</Stamp> : null}<Text style={styles.planTitle}>{title}</Text><Text style={styles.price}>{plan.price_som ? `${price} so‘m` : t.free}</Text>{periodic ? <Text style={styles.period}>{periodic}</Text> : null}<Text style={styles.planBody}>{plan.duration_days} {locale === "uz" ? "kun" : locale === "ru" ? "дней" : "days"}</Text>{sellable ? <View style={styles.payments}>{status.providers.payme ? <Button loading={loading} onPress={() => onCheckout("payme")}>Payme</Button> : null}{status.providers.click ? <Button loading={loading} variant="secondary" onPress={() => onCheckout("click")}>Click</Button> : null}{status.providers.uzum ? <Button loading={loading} variant="secondary" onPress={() => onCheckout("uzum")}>Uzum Checkout</Button> : null}</View> : null}{awaitingStoreBilling ? <Text style={styles.mobileStoreNote}>{t.mobileStoreNote}</Text> : null}</Paper>;
}

const styles = StyleSheet.create({
  hero: { gap: 12, padding: 20, borderWidth: 1.5, borderColor: colors.brand950, borderRadius: 16, backgroundColor: colors.inkSurface, shadowColor: colors.brown, shadowOpacity: 0.24, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  info: { fontFamily: fonts.uiMedium, fontSize: 14, lineHeight: 22, color: colors.muted },
  provider: { fontFamily: fonts.uiBold, fontSize: 12, color: colors.muted },
  plans: { gap: 12 },
  plan: { gap: 7 },
  planCurrent: { borderColor: colors.teal },
  planTitle: { fontFamily: fonts.uiBold, fontSize: 17, color: colors.ink },
  price: { fontFamily: fonts.display, fontSize: 35, lineHeight: 39, color: colors.ink },
  period: { marginTop: -5, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted },
  planBody: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted },
  payments: { flexDirection: "row", gap: 9, marginTop: 5 },
  mobileStoreNote: { marginTop: 5, fontFamily: fonts.uiMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
  active: { gap: 10, borderColor: colors.teal, backgroundColor: "rgba(70,120,120,0.08)" },
  activeTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  activeTitle: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink },
  activePlan: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.teal },
  activeBody: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted },
  referral: { alignItems: "center", gap: 7, paddingVertical: 23 },
  referralTitle: { fontFamily: fonts.uiBold, fontSize: 16, color: colors.ink },
  referralBody: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted },
  referralCode: { marginTop: 5, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 17, paddingVertical: 10, fontFamily: fonts.uiBold, fontSize: 19, letterSpacing: 2, color: colors.ink, backgroundColor: colors.raised },
  referralMeta: { marginTop: 3, fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted },
});
