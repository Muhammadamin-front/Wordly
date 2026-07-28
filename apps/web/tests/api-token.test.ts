import { afterEach, describe, expect, it, vi } from "vitest";

import { setAccessToken, waitForAccessToken } from "@/lib/api";

describe("waitForAccessToken", () => {
  afterEach(() => {
    setAccessToken(null);
    vi.useRealTimers();
  });

  it("resolves when silent refresh restores the token", async () => {
    setAccessToken(null);
    const pending = waitForAccessToken(1000);

    setAccessToken("fresh-access-token");

    await expect(pending).resolves.toBe("fresh-access-token");
  });

  it("returns null after the timeout for signed-out visitors", async () => {
    vi.useFakeTimers();
    setAccessToken(null);
    const pending = waitForAccessToken(1000);

    await vi.advanceTimersByTimeAsync(1000);

    await expect(pending).resolves.toBeNull();
  });
});
