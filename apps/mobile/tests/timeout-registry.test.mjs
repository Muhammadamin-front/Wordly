import assert from "node:assert/strict";
import test from "node:test";

import { createTimeoutRegistry } from "../src/utils/timeout-registry.ts";

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

test("clearAll prevents delayed work after a screen unmounts", async () => {
  const registry = createTimeoutRegistry();
  let called = false;
  registry.schedule(() => { called = true; }, 10);
  assert.equal(registry.size(), 1);

  registry.clearAll();
  await wait(25);

  assert.equal(called, false);
  assert.equal(registry.size(), 0);
});

test("completed timers remove themselves from the registry", async () => {
  const registry = createTimeoutRegistry();
  let calls = 0;
  registry.schedule(() => { calls += 1; }, 5);
  await wait(20);
  assert.equal(calls, 1);
  assert.equal(registry.size(), 0);
});
