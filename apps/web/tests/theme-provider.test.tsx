import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ThemeProvider } from "@/components/site/theme-provider";
import { ThemeToggle } from "@/components/site/theme-toggle";

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "light";
    document.documentElement.classList.remove("theme-switching");
  });

  it("switches themes and persists the preference", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle lang="en" />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("wordly-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("adopts the theme restored before hydration", async () => {
    document.documentElement.dataset.theme = "dark";

    render(
      <ThemeProvider>
        <ThemeToggle lang="uz" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Yorug' rejimga o'tish" })).toBeInTheDocument();
    });
  });
});
