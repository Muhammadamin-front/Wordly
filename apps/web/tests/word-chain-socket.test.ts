import { afterEach, describe, expect, it, vi } from "vitest";

describe("Word Chain socket origin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("uses the configured public API origin for the browser WebSocket", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.vocora.uz/");
    const WebSocketMock = vi.fn();
    vi.stubGlobal("WebSocket", WebSocketMock);

    const { openWordChainSocket } = await import("@/lib/word-chain");
    openWordChainSocket();

    expect(WebSocketMock).toHaveBeenCalledWith("wss://api.vocora.uz/api/v1/ws/word-chain");
  });
});
