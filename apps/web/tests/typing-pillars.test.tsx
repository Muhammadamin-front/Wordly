import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TypingPillars } from "@/components/site/typing-pillars";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  vi.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

describe("TypingPillars", () => {
  it("types each learning pillar once and stops on the final phrase", () => {
    vi.useFakeTimers();
    const { container } = render(<TypingPillars items={["Words", "Grammar"]} />);
    const line = container.querySelector(".typing-line");

    act(() => vi.runAllTimers());

    expect(line).toHaveTextContent("Vocora // Grammar");
    expect(container.querySelector(".typing-cursor")).toHaveAttribute("data-active", "false");
  });

  it("shows a static complete alternative when reduced motion is requested", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<TypingPillars items={["Words", "Grammar"]} />);

    expect(container.querySelector(".typing-line")).toHaveTextContent(
      "Vocora // Words · Grammar"
    );
    expect(container.querySelector(".typing-cursor")).toHaveAttribute("data-active", "false");
  });
});
