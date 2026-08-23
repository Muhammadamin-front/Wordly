import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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
    const value = match[2].replace(/^(["'])(.*)\1$/, "$2");
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

const apiUrl = new URL(process.env.EXPO_PUBLIC_API_URL);
if (apiUrl.protocol !== "https:") {
  console.error("EXPO_PUBLIC_API_URL must use HTTPS for a production build.");
  process.exit(1);
}
if (apiUrl.pathname !== "/") {
  console.error("EXPO_PUBLIC_API_URL must be an origin only; the app adds /api/v1 automatically.");
  process.exit(1);
}

for (const key of required.slice(1)) {
  if (!process.env[key].endsWith(".apps.googleusercontent.com")) {
    console.error(`${key} does not look like a Google OAuth client ID.`);
    process.exit(1);
  }
}

console.log("Release environment looks complete.");
