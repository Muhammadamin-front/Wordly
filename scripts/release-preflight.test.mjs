import assert from "node:assert/strict";
import test from "node:test";

import { validateReleaseEnv } from "./release-preflight.mjs";

const webClient = "123-web.apps.googleusercontent.com";
const iosClient = "123-ios.apps.googleusercontent.com";

function validRoot() {
  return {
    ENVIRONMENT: "production",
    SECRET_KEY: "aB3dE5gH7jK9mN2pQ4sT6vW8yZ1cD3fG5hJ7kL9mN2pQ4sT6vW8yZ1cD3fG5hJ7",
    FRONTEND_ORIGIN: "https://vocora.uz",
    NEXT_PUBLIC_API_URL: "https://api.vocora.uz",
    COOKIE_SECURE: "true",
    PAYMENTS_SANDBOX: "false",
    EMAIL_PROVIDER: "resend",
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "Vocora <noreply@vocora.uz>",
    CLOUDFLARE_TUNNEL_TOKEN: "tunnel-token",
    GOOGLE_CLIENT_ID: webClient,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: webClient,
    APPLE_CLIENT_ID: "uz.vocora.mobile",
    API_BIND_HOST: "127.0.0.1",
    POSTGRES_PASSWORD: "strong-db-password",
    DATABASE_URL: "postgresql+asyncpg://words:strong-db-password@postgres:5432/words",
    UZUM_TERMINAL_ID: "terminal",
    UZUM_API_KEY: "api-key",
    UZUM_WEBHOOK_SECRET: "webhook-secret",
    SENTRY_DSN: "https://public@sentry.example/1",
    NEXT_PUBLIC_SENTRY_DSN: "https://public@sentry.example/2",
    GEMINI_API_KEY: "gemini-key",
  };
}

const validMobile = {
  EXPO_PUBLIC_API_URL: "https://api.vocora.uz",
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: webClient,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: iosClient,
};

test("a complete production environment has no blockers", () => {
  assert.deepEqual(validateReleaseEnv(validRoot(), validMobile).errors, []);
});

test("development defaults and missing providers are release blockers", () => {
  const result = validateReleaseEnv({ ENVIRONMENT: "development", COOKIE_SECURE: "false" }, {});
  assert.ok(result.errors.some((error) => error.includes("ENVIRONMENT")));
  assert.ok(result.errors.some((error) => error.includes("COOKIE_SECURE")));
  assert.ok(result.errors.some((error) => error.includes("CLOUDFLARE_TUNNEL_TOKEN")));
  assert.ok(result.errors.some((error) => error.includes("EXPO_PUBLIC_API_URL")));
});

test("partial payment credentials are rejected", () => {
  const root = validRoot();
  delete root.UZUM_API_KEY;
  assert.ok(validateReleaseEnv(root, validMobile).errors.some((error) => error.includes("partially configured")));
});

test("Google web and iOS clients cannot be the same", () => {
  const mobile = { ...validMobile, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: webClient };
  assert.ok(validateReleaseEnv(validRoot(), mobile).errors.some((error) => error.includes("must be different")));
});

test("web and mobile cannot point at different API origins", () => {
  const mobile = { ...validMobile, EXPO_PUBLIC_API_URL: "https://wrong.example" };
  const result = validateReleaseEnv(validRoot(), mobile);
  assert.ok(result.errors.some((error) => error.includes("https://api.vocora.uz")));
  assert.ok(result.errors.some((error) => error.includes("same production API origin")));
});

test("native Apple audience is required", () => {
  const root = validRoot();
  delete root.APPLE_CLIENT_ID;
  assert.ok(validateReleaseEnv(root, validMobile).errors.some((error) => error.includes("APPLE_CLIENT_ID")));
});
