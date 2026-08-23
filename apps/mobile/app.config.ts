import type { ConfigContext, ExpoConfig } from "expo/config";

function googleIosUrlScheme(clientId?: string): string | null {
  const suffix = ".apps.googleusercontent.com";
  if (!clientId?.endsWith(suffix)) return null;
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}

export default ({ config }: ConfigContext): ExpoConfig => {
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
