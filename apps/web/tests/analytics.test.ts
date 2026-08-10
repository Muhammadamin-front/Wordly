import { afterEach, describe, expect, it, vi } from "vitest";

import { trackEvent } from "@/lib/analytics";

describe("analytics privacy boundary", () => {
  afterEach(() => {
    window.dataLayer = [];
    vi.restoreAllMocks();
  });

  it("keeps sensitive properties out of client analytics events", () => {
    window.dataLayer = [];
    trackEvent("signup_completed", {
      locale: "uz",
      email: "learner@example.uz",
      access_token: "should-not-ship",
      plan_code: "premium_monthly",
    });

    const event = window.dataLayer?.at(-1);
    expect(event).toMatchObject({
      event: "signup_completed",
      locale: "uz",
      plan_code: "premium_monthly",
    });
    expect(event).not.toHaveProperty("email");
    expect(event).not.toHaveProperty("access_token");
  });
});
