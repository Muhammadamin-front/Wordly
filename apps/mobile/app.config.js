// Plain JS, deliberately not app.config.ts: EAS Build's own config-reading
// step (a fixed copy of @expo/require-utils bundled into their build worker,
// separate from anything this project pins) fails to parse this file as
// TypeScript — "SyntaxError: Unexpected token '{'" inside
// compileSourceTextModule, from /usr/local/eas-build-worker's own code, not
// this project's node_modules. Reproduced locally under both Node 24 and a
// worker-matching 20.20.2 without error, which means the failure is specific
// to whatever version of that parser the worker ships, not to Node's version
// or anything this project controls. Expo's own tracker has open reports of
// the same failure signature. .js sidesteps the whole TS-in-config parsing
// path — there is nothing left for that parser to mis-stem.
//
// JSDoc keeps editor type-checking on ConfigContext/ExpoConfig; there is
// nothing here `tsc --noEmit` would have caught that JSDoc + `strict`-mode
// editor hints don't already catch by hand.

/**
 * @param {string | undefined} clientId
 * @returns {string | null}
 */
function googleIosUrlScheme(clientId) {
  const suffix = ".apps.googleusercontent.com";
  if (!clientId?.endsWith(suffix)) return null;
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}

/** @returns {void} */
function assertProductionEnvironment() {
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

/**
 * @param {import("expo/config").ConfigContext} root0
 * @param {import("expo/config").ExpoConfig} root0.config
 * @returns {import("expo/config").ExpoConfig}
 */
module.exports = ({ config }) => {
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
