import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const wizard = resolve("scripts/setup-production.sh");

function bash(script, env = {}) {
  return spawnSync("bash", ["-c", script], {
    cwd: resolve("."),
    encoding: "utf8",
    env: { ...process.env, WIZARD_VALIDATE_ONLY: "1", WIZARD_PATH: wizard, ...env },
  });
}

test("Resend validation rejects missing or malformed prompt values", () => {
  for (const expression of [
    'valid_resend_key ""',
    'valid_resend_key "not-a-key"',
    'valid_email_from "noreply@example.com"',
    'valid_email_from ""',
  ]) {
    const result = bash('source "$WIZARD_PATH"; ' + expression);
    assert.notEqual(result.status, 0, expression);
  }
});

test("valid Resend values are persisted together", () => {
  const directory = mkdtempSync(join(tmpdir(), "vocora-wizard-"));
  const envPath = join(directory, ".env");
  const result = bash(
    'source "$WIZARD_PATH"; ENV_FILE="$TEST_ENV"; persist_resend_config "re_test_production_key" "Vocora <noreply@vocora.uz>"',
    { TEST_ENV: envPath },
  );
  assert.equal(result.status, 0, result.stderr);
  const output = readFileSync(envPath, "utf8");
  assert.match(output, /^EMAIL_PROVIDER=resend$/m);
  assert.match(output, /^RESEND_API_KEY=re_test_production_key$/m);
  assert.match(output, /^EMAIL_FROM=Vocora <noreply@vocora\.uz>$/m);
  assert.match(output, /^EMAIL_REPLY_TO=support@vocora\.uz$/m);
});

test("a quoted EMAIL_FROM loaded from dotenv is accepted and normalized", () => {
  const directory = mkdtempSync(join(tmpdir(), "vocora-wizard-"));
  const envPath = join(directory, ".env");
  const result = bash(
    'source "$WIZARD_PATH"; ENV_FILE="$TEST_ENV"; persist_resend_config "re_test_production_key" \'"Vocora <noreply@vocora.uz>"\'',
    { TEST_ENV: envPath },
  );
  assert.equal(result.status, 0, result.stderr);
  const output = readFileSync(envPath, "utf8");
  assert.match(output, /^EMAIL_FROM=Vocora <noreply@vocora\.uz>$/m);
});

test("Cloudflare Docker command is reduced to the tunnel token", () => {
  const directory = mkdtempSync(join(tmpdir(), "vocora-wizard-"));
  const envPath = join(directory, ".env");
  const token = `eyJ${"a".repeat(120)}`;
  const result = bash(
    'source "$WIZARD_PATH"; ENV_FILE="$TEST_ENV"; persist_cloudflare_tunnel_token "$TEST_COMMAND"',
    {
      TEST_ENV: envPath,
      TEST_COMMAND: `docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token ${token}`,
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(readFileSync(envPath, "utf8"), new RegExp(`^CLOUDFLARE_TUNNEL_TOKEN=${token}$`, "m"));
});

test("invalid Cloudflare tunnel values are rejected", () => {
  for (const value of ["", "tunnel-id", "cloudflare-api-token", "docker run --token short"]) {
    const result = bash('source "$WIZARD_PATH"; valid_cloudflare_tunnel_token "$TEST_VALUE"', {
      TEST_VALUE: value,
    });
    assert.notEqual(result.status, 0, value);
  }
});
