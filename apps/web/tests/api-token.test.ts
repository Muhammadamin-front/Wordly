import { afterEach, describe, expect, it, vi } from "vitest";

import { setAccessToken, waitForAccessToken } from "@/lib/api";
import { flashcardsApi } from "@/lib/flashcards";

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

describe("review requests", () => {
  afterEach(() => {
    setAccessToken(null);
    vi.unstubAllGlobals();
  });

  it("sends the stable idempotency key in a request header", async () => {
    setAccessToken("access-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ reward: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await flashcardsApi.review("card-1", "good", "review-key-0001", 900);

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "Idempotency-Key": "review-key-0001",
    });
  });
});
