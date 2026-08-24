import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const deploy = readFileSync(new URL("../deploy.sh", import.meta.url), "utf8");

test("production deploy seeds the idempotent corpus before public smoke", () => {
  const applyIndex = deploy.indexOf("docker compose --profile production up -d --remove-orphans");
  const seedIndex = deploy.indexOf("docker compose exec -T api python -m scripts.seed");
  const smokeIndex = deploy.indexOf("node scripts/production-smoke.mjs");

  assert.ok(applyIndex >= 0, "production containers must be applied");
  assert.ok(seedIndex > applyIndex, "corpus seed must run after the API container is applied");
  assert.ok(smokeIndex > seedIndex, "public smoke must run after the corpus is seeded");
});

test("production image build retries transient registry failures", () => {
  assert.match(deploy, /retry 3 docker compose --profile production build/);
});
