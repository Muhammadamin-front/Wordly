import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The provider re-asserts the theme when the route changes, so the pathname is
// controllable here.
let pathname = "/uz/grammar";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

import { ThemeProvider } from "@/components/site/theme-provider";
import { ThemeToggle } from "@/components/site/theme-toggle";

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pathname = "/uz/grammar";
    document.documentElement.dataset.theme = "light";
    document.documentElement.classList.remove("theme-switching");
    document.querySelector('meta[name="theme-color"]')?.remove();
    const themeColor = document.createElement("meta");
    themeColor.name = "theme-color";
    themeColor.content = "#f3e6cb";
    document.head.appendChild(themeColor);
  });

  it("switches themes and persists the preference", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle lang="en" />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", "#24130c");
    expect(window.localStorage.getItem("vocora-theme")).toBe("dark");
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

  it("keeps the chosen theme when the locale changes", async () => {
    // Switching language re-renders the [lang] layout. React reconciles <html>
    // and drops data-theme, which used to throw the reader back to light in the
    // middle of a session.
    const { rerender } = render(
      <ThemeProvider>
        <ThemeToggle lang="en" />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");

    // The locale switch: React clears the attribute, then the route changes.
    delete document.documentElement.dataset.theme;
    pathname = "/ru/grammar";
    rerender(
      <ThemeProvider>
        <ThemeToggle lang="en" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
    });
    expect(window.localStorage.getItem("vocora-theme")).toBe("dark");
  });

  it("reads the stored choice rather than the DOM attribute", async () => {
    window.localStorage.setItem("vocora-theme", "dark");
    // A wiped attribute must not be mistaken for "the reader chose light".
    delete document.documentElement.dataset.theme;

    render(
      <ThemeProvider>
        <ThemeToggle lang="en" />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
    });
  });
});
