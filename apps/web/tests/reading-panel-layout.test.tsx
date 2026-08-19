import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { ReadingPracticeView } from "@/components/ielts/reading-practice-view";

function startTest() {
  render(<ReadingPracticeView t={en.readingPractice} />);
  fireEvent.click(screen.getAllByRole("button", { name: /open practice/i })[0]);
  fireEvent.click(screen.getByRole("button", { name: /practice mode/i }));
  fireEvent.click(screen.getByRole("button", { name: /start test/i }));
  return screen.getByRole("button", { name: "Resize panels" }).parentElement!;
}

describe("Reading workspace panel layout", () => {
  it("keeps passage and questions visible with a percentage-based split", () => {
    const split = startTest();

    expect(split).toHaveStyle({ "--reading-passage-width": "52%" });
    expect(screen.getByText(/^Questions \d+-\d+$/)).toBeInTheDocument();
  });

  it("opens the phone question sheet on a share of the workspace", () => {
    expect(startTest()).toHaveStyle({ "--reading-sheet-height": "46%" });
  });

  it("collapses and restores the sheet from its handle", () => {
    const split = startTest();
    const handle = screen.getByRole("button", { name: "Hide questions" });
    expect(handle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(handle);
    expect(split).toHaveStyle({ "--reading-sheet-height": "0%" });
    const collapsed = screen.getByRole("button", { name: "Show questions" });
    expect(collapsed).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(collapsed);
    expect(split).toHaveStyle({ "--reading-sheet-height": "46%" });
  });

  it("reopens a collapsed sheet when the navigator jumps to a question", () => {
    const split = startTest();
    fireEvent.click(screen.getByRole("button", { name: "Hide questions" }));
    expect(split).toHaveStyle({ "--reading-sheet-height": "0%" });

    const navigator = screen.getByRole("navigation", { name: /question navigation/i });
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(navigator).toBeInTheDocument();
    expect(split).toHaveStyle({ "--reading-sheet-height": "46%" });
  });
});
