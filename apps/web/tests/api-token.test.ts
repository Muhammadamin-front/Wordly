import { afterEach, describe, expect, it, vi } from "vitest";

import { apiFetch, refreshSession, setAccessToken, waitForAccessToken } from "@/lib/api";
import { flashcardsApi } from "@/lib/flashcards";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

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

  it("refreshes once and retries an authenticated request after a 401", async () => {
    setAccessToken("expired-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "Expired" }), { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "fresh-token", user: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch<{ ok: boolean }>("/protected", { auth: true })).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((fetchMock.mock.calls[2][1] as RequestInit).headers).toMatchObject({
      Authorization: "Bearer fresh-token",
    });
  });

  it("surfaces the real failure when the post-refresh retry itself throws, instead of the stale 401", async () => {
    setAccessToken("expired-token");
    const retryError = new Error("network down");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "Expired" }), { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: "fresh-token", user: {} }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockRejectedValueOnce(retryError);
    vi.stubGlobal("fetch", fetchMock);

    // The token WAS successfully refreshed; only the retried request failed
    // (network blip / timeout). That real failure must win over the stale
    // first-attempt 401 Response still sitting around from before the retry.
    await expect(apiFetch("/protected", { auth: true })).rejects.toBe(retryError);
  });

  // AuthProvider's silent-refresh-on-mount and apiFetch's own 401-retry used
  // to each call POST /auth/refresh independently. The backend's refresh
  // token is single-use and rotates on every redeem — reusing an
  // already-rotated one is treated as theft and revokes every session for
  // that user (apps/api/app/services/auth.py's rotate_refresh_token). Two
  // unrelated in-flight refreshes racing for the same cookie meant the loser
  // could silently sign out a genuinely logged-in visitor. refreshSession()
  // is now the only path to that endpoint, shared by both callers.
  it("dedupes a concurrent AuthProvider refresh against an unrelated 401 retry into one network call", async () => {
    setAccessToken("stale-token");
    let refreshRequests = 0;
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/auth/refresh")) {
        refreshRequests += 1;
        return Promise.resolve(
          json(200, { access_token: "fresh-token", token_type: "bearer", expires_in: 900, user: { id: "u1" } })
        );
      }
      return Promise.resolve(json(401, { detail: "Expired" }));
    });
    vi.stubGlobal("fetch", fetchMock);

    // Simulates AuthProvider's mount-time refresh() firing at the same
    // moment some other authenticated request 401s and triggers apiFetch's
    // own internal retry — both wanting a fresh session simultaneously.
    const [session] = await Promise.all([
      refreshSession(),
      apiFetch("/protected", { auth: true }).catch(() => null),
    ]);

    expect(refreshRequests).toBe(1);
    expect(session?.access_token).toBe("fresh-token");
  });
});
