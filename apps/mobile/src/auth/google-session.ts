import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

export const googleClientIds = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim(),
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim(),
};

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export type NativeGoogleSignInModule = typeof import("@react-native-google-signin/google-signin");

let nativeGoogleSignInModule: NativeGoogleSignInModule | null | undefined;

export function getNativeGoogleSignInModule() {
  if (Platform.OS === "web" || isExpoGo) return null;
  if (nativeGoogleSignInModule !== undefined) return nativeGoogleSignInModule;
  try {
    nativeGoogleSignInModule = require("@react-native-google-signin/google-signin") as NativeGoogleSignInModule;
  } catch {
    nativeGoogleSignInModule = null;
  }
  return nativeGoogleSignInModule;
}

export function configureNativeGoogleSignIn() {
  const google = getNativeGoogleSignInModule();
  if (!google) return null;
  google.GoogleSignin.configure({
    webClientId: googleClientIds.webClientId,
    ...(googleClientIds.iosClientId ? { iosClientId: googleClientIds.iosClientId } : {}),
  });
  return google;
}

type WebGoogleIdentity = typeof globalThis & {
  google?: {
    accounts?: {
      id?: {
        disableAutoSelect?: () => void;
      };
    };
  };
};

export function disableWebGoogleAutoSelect() {
  if (Platform.OS !== "web") return;
  (globalThis as WebGoogleIdentity).google?.accounts?.id?.disableAutoSelect?.();
}

export async function clearGoogleSignInSession() {
  disableWebGoogleAutoSelect();
  const google = getNativeGoogleSignInModule();
  if (!google) return;
  await google.GoogleSignin.signOut().catch(() => undefined);
}
