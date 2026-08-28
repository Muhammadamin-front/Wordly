#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    values[match[1]] = match[2].trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
  }
  return values;
}

function exactHttpsOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.search
      && !url.hash
      && (url.pathname === "" || url.pathname === "/");
  } catch {
    return false;
  }
}

function googleClientId(value) {
  return Boolean(value?.endsWith(".apps.googleusercontent.com"));
}

function cloudflareTunnelToken(value) {
  return /^eyJ[A-Za-z0-9_-]{100,}$/.test(value ?? "");
}

export function validateReleaseEnv(root, mobile, { checkMobile = true } = {}) {
  const errors = [];
  const warnings = [];
  const requireValue = (values, key, scope = "root .env") => {
    if (!values[key]?.trim()) errors.push(`${scope}: ${key} is required`);
  };

  if (root.ENVIRONMENT !== "production") errors.push("root .env: ENVIRONMENT must be production");
  if (root.COOKIE_SECURE?.toLowerCase() !== "true") errors.push("root .env: COOKIE_SECURE must be true");
  if (root.PAYMENTS_SANDBOX?.toLowerCase() !== "false") errors.push("root .env: PAYMENTS_SANDBOX must be false");
  if (!exactHttpsOrigin(root.FRONTEND_ORIGIN)) errors.push("root .env: FRONTEND_ORIGIN must be an exact HTTPS origin");
  if (!exactHttpsOrigin(root.NEXT_PUBLIC_API_URL)) errors.push("root .env: NEXT_PUBLIC_API_URL must be an exact HTTPS origin");
  if (root.NEXT_PUBLIC_SITE_URL !== "https://vocora.uz") {
    errors.push("root .env: NEXT_PUBLIC_SITE_URL must be https://vocora.uz");
  }
  if (root.FRONTEND_ORIGIN && root.FRONTEND_ORIGIN !== "https://vocora.uz") {
    errors.push("root .env: FRONTEND_ORIGIN must be https://vocora.uz");
  }
  if (root.NEXT_PUBLIC_API_URL && root.NEXT_PUBLIC_API_URL !== "https://api.vocora.uz") {
    errors.push("root .env: NEXT_PUBLIC_API_URL must be https://api.vocora.uz");
  }

  requireValue(root, "SECRET_KEY");
  const secret = root.SECRET_KEY ?? "";
  if (secret && (secret.length < 48 || /change|replace|paste|generate|<|>/i.test(secret))) {
    errors.push("root .env: SECRET_KEY must be a generated value of at least 48 characters");
  }
  if (root.EMAIL_PROVIDER !== "resend") errors.push("root .env: EMAIL_PROVIDER must be resend");
  requireValue(root, "RESEND_API_KEY");
  requireValue(root, "EMAIL_FROM");
  requireValue(root, "CLOUDFLARE_TUNNEL_TOKEN");
  if (root.CLOUDFLARE_TUNNEL_TOKEN && !cloudflareTunnelToken(root.CLOUDFLARE_TUNNEL_TOKEN)) {
    errors.push("root .env: CLOUDFLARE_TUNNEL_TOKEN must be only the eyJ... token after --token, not the Docker command or tunnel ID");
  }

  if (!googleClientId(root.GOOGLE_CLIENT_ID)) errors.push("root .env: GOOGLE_CLIENT_ID is missing or invalid");
  if (!googleClientId(root.NEXT_PUBLIC_GOOGLE_CLIENT_ID)) errors.push("root .env: NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing or invalid");
  if (root.GOOGLE_CLIENT_ID && root.NEXT_PUBLIC_GOOGLE_CLIENT_ID && root.GOOGLE_CLIENT_ID !== root.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    errors.push("root .env: API and web Google client IDs must match");
  }
  if (root.APPLE_CLIENT_ID !== "uz.vocora.mobile") {
    errors.push("root .env: APPLE_CLIENT_ID must be uz.vocora.mobile for native Sign in with Apple");
  }

  if (root.API_BIND_HOST && !["127.0.0.1", "::1"].includes(root.API_BIND_HOST)) {
    errors.push("root .env: API_BIND_HOST must stay loopback-only when Cloudflare Tunnel is used");
  }
  if (!root.POSTGRES_PASSWORD || root.POSTGRES_PASSWORD === "words") {
    warnings.push("Set a non-default POSTGRES_PASSWORD before initializing a new production database");
  }
  if (!root.DATABASE_URL || root.DATABASE_URL.includes("words:words@")) {
    warnings.push("Set DATABASE_URL with the same non-default Postgres credentials");
  }

  const paymentGroups = [
    ["PAYME_MERCHANT_ID", "PAYME_MERCHANT_KEY"],
    ["CLICK_SERVICE_ID", "CLICK_MERCHANT_ID", "CLICK_SECRET_KEY"],
    ["UZUM_TERMINAL_ID", "UZUM_API_KEY", "UZUM_WEBHOOK_SECRET"],
  ];
  for (const group of paymentGroups) {
    const present = group.filter((key) => root[key]?.trim()).length;
    if (present > 0 && present < group.length) errors.push(`root .env: payment provider is partially configured (${group.join(", ")})`);
  }
  if (!paymentGroups.some((group) => group.every((key) => root[key]?.trim()))) {
    warnings.push("No production payment provider is complete; checkout will remain disabled");
  }
  if (!root.SENTRY_DSN || !root.NEXT_PUBLIC_SENTRY_DSN) warnings.push("Sentry is not complete for both API and web");
  if (!root.GEMINI_API_KEY && !(root.BEDROCK_API_KEY && root.BEDROCK_MODEL)) warnings.push("No production AI provider is configured; AI features will be unavailable");

  if (checkMobile) {
    const mobileRequired = [
      "EXPO_PUBLIC_API_URL",
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
    ];
    for (const key of mobileRequired) requireValue(mobile, key, "apps/mobile/.env.local");
    if (mobile.EXPO_PUBLIC_API_URL && !exactHttpsOrigin(mobile.EXPO_PUBLIC_API_URL)) {
      errors.push("apps/mobile/.env.local: EXPO_PUBLIC_API_URL must be an exact HTTPS origin");
    }
    if (mobile.EXPO_PUBLIC_API_URL && mobile.EXPO_PUBLIC_API_URL !== "https://api.vocora.uz") {
      errors.push("apps/mobile/.env.local: EXPO_PUBLIC_API_URL must be https://api.vocora.uz");
    }
    if (mobile.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID && !googleClientId(mobile.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)) {
      errors.push("apps/mobile/.env.local: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is invalid");
    }
    if (mobile.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID && !googleClientId(mobile.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)) {
      errors.push("apps/mobile/.env.local: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is invalid");
    }
    if (
      mobile.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
      && mobile.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      && mobile.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID === mobile.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    ) {
      errors.push("apps/mobile/.env.local: Web and iOS Google client IDs must be different OAuth clients");
    }
    if (
      root.GOOGLE_CLIENT_ID
      && mobile.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
      && root.GOOGLE_CLIENT_ID !== mobile.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    ) {
      errors.push("Root API and mobile Web Google client IDs must match");
    }
    if (
      root.NEXT_PUBLIC_API_URL
      && mobile.EXPO_PUBLIC_API_URL
      && root.NEXT_PUBLIC_API_URL !== mobile.EXPO_PUBLIC_API_URL
    ) {
      errors.push("Web and mobile must use the same production API origin");
    }
  }

  return { errors, warnings };
}

function runCheck(label, command, args, cwd, validateOutput) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  if (result.status === 0 && (!validateOutput || validateOutput(result.stdout))) {
    console.log(`✓ ${label}`);
    return true;
  }
  console.error(`✗ ${label}`);
  const detail = (result.stderr || result.stdout || "").trim().split("\n").slice(-3).join("\n");
  if (detail) console.error(detail);
  return false;
}

function main() {
  const checkMobile = !process.argv.includes("--server-only");
  const rootPath = resolve(repoRoot, ".env");
  const mobilePath = resolve(repoRoot, "apps/mobile/.env.local");
  const root = parseEnvFile(rootPath);
  const mobile = parseEnvFile(mobilePath);
  const { errors, warnings } = validateReleaseEnv(root, mobile, { checkMobile });

  console.log("Vocora production preflight (values are never printed)");
  for (const warning of warnings) console.warn(`! ${warning}`);
  for (const error of errors) console.error(`✗ ${error}`);

  let commandsOk = true;
  commandsOk = runCheck("Docker Compose production config", "docker", ["compose", "--profile", "production", "config", "--quiet"], repoRoot) && commandsOk;
  const python = [".venv-check/bin/alembic", ".venv/bin/alembic"]
    .map((path) => resolve(repoRoot, "apps/api", path))
    .find(existsSync);
  if (python) {
    commandsOk = runCheck(
      "Alembic has exactly one head",
      python,
      ["heads"],
      resolve(repoRoot, "apps/api"),
      (output) => output.trim().split(/\r?\n/).filter(Boolean).length === 1,
    ) && commandsOk;
  }
  else {
    console.warn("! Local Alembic executable not found; deployment will validate migrations inside the API image");
  }
  if (checkMobile) {
    commandsOk = runCheck("Mobile release environment", "node", ["scripts/check-release-env.mjs"], resolve(repoRoot, "apps/mobile")) && commandsOk;
  }

  if (errors.length || !commandsOk) {
    console.error(`Preflight failed with ${errors.length + (commandsOk ? 0 : 1)} blocker(s).`);
    process.exitCode = 1;
    return;
  }
  console.log("✓ Production preflight passed");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
