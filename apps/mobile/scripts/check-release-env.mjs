import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const EXPECTED_APP_ID = "uz.vocora.mobile";
const EXPECTED_EAS_PROJECT_ID = "c35c76dd-027a-47d9-a1f6-c2e9c7ec1669";

// EAS injects production variables into process.env. Local release checks need
// the same values from Expo's conventional env files, without ever printing a
// secret or overriding explicitly supplied CI/EAS values.
const suppliedEnvironment = new Set(Object.keys(process.env));
for (const filename of [".env", ".env.local"]) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || suppliedEnvironment.has(match[1])) continue;
    const value = match[2].trim().replace(/^(["'])(.*)\1$/, "$2").trim();
    process.env[match[1]] = value;
  }
}

const required = [
  "EXPO_PUBLIC_API_URL",
  "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
  "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
];

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Missing release environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

let apiUrl;
try {
  apiUrl = new URL(process.env.EXPO_PUBLIC_API_URL);
} catch {
  console.error("EXPO_PUBLIC_API_URL must be a valid URL.");
  process.exit(1);
}
if (apiUrl.protocol !== "https:") {
  console.error("EXPO_PUBLIC_API_URL must use HTTPS for a production build.");
  process.exit(1);
}
if (apiUrl.origin !== "https://api.vocora.uz") {
  console.error("EXPO_PUBLIC_API_URL must be https://api.vocora.uz for a production build.");
  process.exit(1);
}
if (
  apiUrl.pathname !== "/"
  || apiUrl.username
  || apiUrl.password
  || apiUrl.search
  || apiUrl.hash
) {
  console.error("EXPO_PUBLIC_API_URL must be an origin only; the app adds /api/v1 automatically.");
  process.exit(1);
}

for (const key of required.slice(1)) {
  if (!process.env[key].endsWith(".apps.googleusercontent.com")) {
    console.error(`${key} does not look like a Google OAuth client ID.`);
    process.exit(1);
  }
}

if (
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  === process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
) {
  console.error("Web and iOS Google OAuth client IDs must be different clients.");
  process.exit(1);
}

const appConfig = JSON.parse(readFileSync(resolve(process.cwd(), "app.json"), "utf8"));
const expo = appConfig.expo ?? {};
if (expo.android?.package !== EXPECTED_APP_ID || expo.ios?.bundleIdentifier !== EXPECTED_APP_ID) {
  console.error(`Android package and iOS bundle identifier must both be ${EXPECTED_APP_ID}.`);
  process.exit(1);
}
if (expo.extra?.eas?.projectId !== EXPECTED_EAS_PROJECT_ID) {
  console.error("app.json is linked to an unexpected EAS project.");
  process.exit(1);
}

console.log("Release environment looks complete.");
