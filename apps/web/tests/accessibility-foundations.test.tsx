import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkipLink } from "@/components/site/skip-link";
import { Button } from "@/components/ui/button";

describe("web accessibility foundations", () => {
  it("provides a focusable skip-navigation target", async () => {
    render(
      <>
        <SkipLink label="Skip to main content" />
        <main id="main-content" tabIndex={-1}>
          <h1>Grammar</h1>
        </main>
      </>
    );

    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
      "href",
      "#main-content"
    );
    expect(document.querySelector("main")).toHaveAttribute("id", "main-content");
    expect(document.querySelector("main")).toHaveAttribute("tabindex", "-1");

    fireEvent.click(screen.getByRole("link", { name: "Skip to main content" }));
    expect(document.activeElement).toBe(document.querySelector("main"));
  });

  it("announces loading state on shared action buttons", () => {
    render(<Button loading>Save progress</Button>);

    expect(screen.getByRole("button", { name: "Save progress" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save progress" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });
});
