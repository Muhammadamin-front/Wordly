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

test("a rollback target is only recorded after the public smoke passes", () => {
  const smokeIndex = deploy.indexOf("node scripts/production-smoke.mjs");
  const recordIndex = deploy.indexOf('git rev-parse HEAD > "$deployed_file"');

  assert.ok(recordIndex > smokeIndex, "a commit that failed smoke must not become the rollback target");
});

test("the container swap waits for health instead of returning immediately", () => {
  assert.match(deploy, /up -d --remove-orphans --wait --wait-timeout \d+/);
});

test("rollback refuses when no previous deploy was recorded", () => {
  assert.match(deploy, /No previous deploy recorded/);
  assert.match(deploy, /git checkout --quiet --detach "\$previous"/);
});

test("a normal deploy returns to the branch after a detached rollback", () => {
  const checkoutIndex = deploy.indexOf("git checkout --quiet main");
  const mergeIndex = deploy.indexOf("git merge --ff-only");
  assert.ok(checkoutIndex >= 0 && checkoutIndex < mergeIndex);
});
