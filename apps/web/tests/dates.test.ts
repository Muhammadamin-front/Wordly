import { describe, expect, it } from "vitest";

import { dateInputToDeadlineIso, formatApiDate, parseApiDate } from "@/lib/dates";

describe("API date helpers", () => {
  it("accepts a legacy FastAPI UTC datetime without a timezone", () => {
    expect(parseApiDate("2026-08-23T09:30:00")?.toISOString()).toBe("2026-08-23T09:30:00.000Z");
  });

  it("keeps a date-only value on the selected calendar day", () => {
    const deadline = dateInputToDeadlineIso("2026-08-23");
    expect(deadline).not.toBeNull();
    expect(new Date(deadline!).getHours()).toBe(23);
    expect(new Date(deadline!).getMinutes()).toBe(59);
  });

  it("does not render an invalid API date", () => {
    expect(formatApiDate("not-a-date", "en")).toBeNull();
  });
});
