import assert from "node:assert/strict";
import test from "node:test";

import { validateApiParity } from "./production-smoke.mjs";

const current = { status: "ok", version: "1.0.0", environment: "production" };

test("matching healthy production APIs pass", () => {
  assert.deepEqual(validateApiParity(current, { ...current }), []);
});

test("a stale public API release fails", () => {
  const errors = validateApiParity(current, { ...current, version: "0.1.0" });
  assert.ok(errors.some((error) => error.includes("does not match")));
});

test("an unhealthy or wrong-environment public API fails", () => {
  const errors = validateApiParity(current, { status: "degraded", version: "1.0.0", environment: "development" });
  assert.ok(errors.some((error) => error.includes("not healthy")));
  assert.ok(errors.some((error) => error.includes("environment")));
});
