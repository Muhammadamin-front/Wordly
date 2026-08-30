import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReadingPracticeView } from "@/components/ielts/reading-practice-view";

describe("Reading workspace panel layout", () => {
  it("keeps passage and questions visible with a percentage-based split", () => {
    render(<ReadingPracticeView lang="uz" />);

    fireEvent.click(screen.getAllByRole("button", { name: /open practice/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /practice mode/i }));
    fireEvent.click(screen.getByRole("button", { name: /start test/i }));

    const divider = screen.getByRole("button", { name: "Resize panels" });
    expect(divider.parentElement).toHaveStyle({ "--reading-passage-width": "52%" });
    expect(screen.getByText(/^Questions \d+-\d+$/)).toBeInTheDocument();
  });
});
