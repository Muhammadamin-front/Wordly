import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { Platform } from "react-native";
import { pushTokenApi } from "@/api/client";
import { useAuth } from "@/providers/auth-provider";
import { localeFrom, type Locale } from "@/i18n";

const DAILY_REVIEW_CHANNEL_ID = "vocora-daily-review";
const PUSH_TOKEN_KEY = "vocora.expoPushToken";
const DAILY_REVIEW_NOTIFICATION_ID_KEY = "vocora.dailyReviewNotificationId";
const NOTIFICATION_BOOTSTRAP_DELAY_MS = 1_000;

const reminderCopy: Record<Locale, { title: string; body: string }> = {
  uz: {
    title: "Vocora sizni kutyapti",
    body: "Bugungi so‘zlarni 5 daqiqada takrorlab chiqing.",
  },
  ru: {
    title: "Vocora ждёт вас",
    body: "Повторите сегодняшние слова за 5 минут.",
  },
  en: {
    title: "Vocora is waiting",
    body: "Review today’s words in 5 minutes.",
  },
};

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

function getProjectId() {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
}

async function configureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DAILY_REVIEW_CHANNEL_ID, {
    name: "Daily review",
    description: "Vocora vocabulary review reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: "#B94E28",
  });
}

async function getAndSaveExpoPushToken() {
  const projectId = getProjectId();
  if (!projectId) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token.data);
    return token.data;
  } catch {
    // Local reminders still work without a remote Expo push token. Server sync can retry later.
    return null;
  }
}

async function clearDailyReminder() {
  const previousId = await SecureStore.getItemAsync(DAILY_REVIEW_NOTIFICATION_ID_KEY);
  if (!previousId) return;
  await Notifications.cancelScheduledNotificationAsync(previousId).catch(() => undefined);
  await SecureStore.deleteItemAsync(DAILY_REVIEW_NOTIFICATION_ID_KEY);
}

async function scheduleDailyReviewReminder(locale: Locale) {
  const copy = reminderCopy[locale];
  await clearDailyReminder();
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: copy.title,
      body: copy.body,
      sound: false,
      color: "#B94E28",
      data: { route: "/(tabs)/review", source: "daily-review-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: DAILY_REVIEW_CHANNEL_ID,
      hour: 20,
      minute: 0,
    },
  });
  await SecureStore.setItemAsync(DAILY_REVIEW_NOTIFICATION_ID_KEY, notificationId);
}

async function enableVocoraNotifications(locale: Locale, accessToken: string | null) {
  if (Platform.OS === "web") return;
  await configureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  const finalStatus = current.granted ? current.status : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== "granted") return;
  const expoPushToken = await getAndSaveExpoPushToken();
  await scheduleDailyReviewReminder(locale);
  if (!expoPushToken || !accessToken || (Platform.OS !== "ios" && Platform.OS !== "android")) return;
  await pushTokenApi.register({
    provider: "expo",
    token: expoPushToken,
    platform: Platform.OS,
    app_version: Constants.expoConfig?.version,
  }, accessToken).catch(() => undefined);
}

function openRouteFromNotification(response: Notifications.NotificationResponse) {
  if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
  const route = response.notification.request.content.data?.route;
  if (route === "/(tabs)/review") router.push("/(tabs)/review");
}

export function NotificationBootstrap() {
  const { ready, token, user } = useAuth();
  const userId = user?.id ?? null;
  const locale = localeFrom(user?.profile.ui_locale);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = Notifications.addNotificationResponseReceivedListener(openRouteFromNotification);
    try {
      const lastResponse = Notifications.getLastNotificationResponse();
      if (lastResponse) {
        openRouteFromNotification(lastResponse);
        Notifications.clearLastNotificationResponse();
      }
    } catch {
      // Some development shells may not expose the native last-response API.
    }
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!ready || Platform.OS === "web") return;
    if (!userId) {
      void clearDailyReminder().catch(() => undefined);
      return;
    }
    const timer = setTimeout(() => {
      void enableVocoraNotifications(locale, token).catch(() => undefined);
    }, NOTIFICATION_BOOTSTRAP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [locale, ready, token, userId]);

  return null;
}
