import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { pushTokenApi, request, type Queue } from "@/api/client";
import { useAuth } from "@/providers/auth-provider";
import { localeFrom, type Locale } from "@/i18n";

// Version the Android channel: Android keeps a channel's original sound and
// importance forever, so a new ID upgrades users from the previous silent one.
const DAILY_REVIEW_CHANNEL_ID = "vocora-daily-review-v2";
const DAILY_REVIEW_CATEGORY_ID = "vocora-review";
const OPEN_REVIEW_ACTION_ID = "open-vocora-review";
const PUSH_TOKEN_KEY = "vocora.expoPushToken";
const DAILY_REVIEW_NOTIFICATION_ID_KEY = "vocora.dailyReviewNotificationId";
const NOTIFICATIONS_ENABLED_KEY = "vocora.notificationsEnabled";
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

const reviewActionCopy: Record<Locale, string> = {
  uz: "Takrorlash",
  ru: "Повторить",
  en: "Review now",
};

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

function getProjectId() {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
}

async function configureNotificationPresentation(locale: Locale) {
  await Notifications.setNotificationCategoryAsync(DAILY_REVIEW_CATEGORY_ID, [
    {
      identifier: OPEN_REVIEW_ACTION_ID,
      buttonTitle: reviewActionCopy[locale],
      options: { opensAppToForeground: true },
    },
  ]);
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(DAILY_REVIEW_CHANNEL_ID, {
    name: "Daily review",
    description: "Vocora vocabulary review reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: "#B94E28",
    sound: "default",
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

export async function clearDailyReviewReminder() {
  if (Platform.OS === "web") return;
  await clearDailyReminder();
}

async function scheduleDailyReviewReminder(locale: Locale) {
  const copy = reminderCopy[locale];
  await clearDailyReminder();
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: copy.title,
      body: copy.body,
      sound: "default",
      color: "#B94E28",
      categoryIdentifier: DAILY_REVIEW_CATEGORY_ID,
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
  if (Platform.OS === "web") return false;
  await configureNotificationPresentation(locale);
  const current = await Notifications.getPermissionsAsync();
  const requested = current.granted
    ? current
    : await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  if (!requested.granted) {
    await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, "0");
    return false;
  }
  await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, "1");
  const expoPushToken = await getAndSaveExpoPushToken();
  const queue = accessToken
    ? await request<Queue>("/review/queue", { token: accessToken }).catch(() => null)
    : null;
  if (queue) {
    if (queue.due_count + queue.new_count > 0) await scheduleDailyReviewReminder(locale);
    else await clearDailyReminder();
  }
  if (!expoPushToken || !accessToken || (Platform.OS !== "ios" && Platform.OS !== "android")) return true;
  await pushTokenApi.register({
    provider: "expo",
    token: expoPushToken,
    platform: Platform.OS,
    app_version: Constants.expoConfig?.version,
  }, accessToken).catch(() => undefined);
  return true;
}

export async function getVocoraNotificationsEnabled() {
  if (Platform.OS === "web") return false;
  const preference = await SecureStore.getItemAsync(NOTIFICATIONS_ENABLED_KEY);
  const permission = await Notifications.getPermissionsAsync();
  return preference === "1" && permission.granted;
}

export async function setVocoraNotificationsEnabled(enabled: boolean, locale: Locale, accessToken: string | null) {
  if (Platform.OS === "web") return false;
  if (!enabled) {
    await SecureStore.setItemAsync(NOTIFICATIONS_ENABLED_KEY, "0");
    await clearDailyReminder();
    const expoPushToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (expoPushToken && accessToken) {
      await pushTokenApi.unregister(expoPushToken, accessToken).catch(() => undefined);
    }
    return false;
  }
  return enableVocoraNotifications(locale, accessToken);
}

function openRouteFromNotification(response: Notifications.NotificationResponse) {
  if (![Notifications.DEFAULT_ACTION_IDENTIFIER, OPEN_REVIEW_ACTION_ID].includes(response.actionIdentifier)) return;
  const route = response.notification.request.content.data?.route;
  if (route === "/(tabs)/review") router.push("/(tabs)/review");
}

export function NotificationBootstrap() {
  const { ready, token, user } = useAuth();
  const userId = user?.id ?? null;
  const locale = localeFrom(user?.profile.ui_locale);
  const tokenRef = useRef(token);
  tokenRef.current = token;

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
      void SecureStore.getItemAsync(NOTIFICATIONS_ENABLED_KEY).then((preference) => {
        if (preference === "1") return enableVocoraNotifications(locale, tokenRef.current);
        return undefined;
      }).catch(() => undefined);
    }, NOTIFICATION_BOOTSTRAP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [locale, ready, userId]);

  return null;
}
