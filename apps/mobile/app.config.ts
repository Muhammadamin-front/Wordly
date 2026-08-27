import type { ConfigContext, ExpoConfig } from "expo/config";

function googleIosUrlScheme(clientId?: string): string | null {
  const suffix = ".apps.googleusercontent.com";
  if (!clientId?.endsWith(suffix)) return null;
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}

function assertProductionEnvironment(): void {
  const profile = process.env.EAS_BUILD_PROFILE;
  if (profile !== "production" && profile !== "preview") return;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  // "preview" (internal/TestFlight distribution, real devices) only needs a
  // real, reachable API URL — a missing one used to silently bake
  // 127.0.0.1/10.0.2.2 into the bundle, so a device build would fail with a
  // generic "Unable to reach Vocora" and no clue why. It doesn't require
  // production's exact hostname or Google client IDs.
  if (!apiUrl || !apiUrl.startsWith("https://")) {
    throw new Error(`EXPO_PUBLIC_API_URL must be a real https:// URL in the EAS "${profile}" environment.`);
  }
  if (profile !== "production") return;

  if (apiUrl !== "https://api.vocora.uz") {
    throw new Error("EXPO_PUBLIC_API_URL must be https://api.vocora.uz in the EAS production environment.");
  }
  if (!webClientId?.endsWith(".apps.googleusercontent.com")) {
    throw new Error("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID must be set in the EAS production environment.");
  }
  if (!iosClientId?.endsWith(".apps.googleusercontent.com")) {
    throw new Error("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be set in the EAS production environment.");
  }
  if (webClientId === iosClientId) {
    throw new Error("Google Web and iOS OAuth client IDs must be different clients.");
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  assertProductionEnvironment();
  const iosUrlScheme = googleIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  if (process.env.EAS_BUILD_PROFILE === "production" && !iosUrlScheme) {
    throw new Error("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be set in the EAS production environment.");
  }

  const plugins = (config.plugins ?? []).filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== "@react-native-google-signin/google-signin";
  });

  if (iosUrlScheme) {
    plugins.push(["@react-native-google-signin/google-signin", { iosUrlScheme }]);
  }

  return {
    ...config,
    name: config.name ?? "Vocora",
    slug: config.slug ?? "vocora",
    plugins,
  };
};
