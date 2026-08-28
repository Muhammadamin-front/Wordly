import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { SiteHeader } from "@/components/site/header";

const logout = vi.fn(() => Promise.resolve());
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard",
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    ready: true,
    user: { profile: { display_name: "Dilnoza" } },
    logout,
  }),
}));

vi.mock("@/components/gamification/stats-widget", () => ({
  StatsWidget: () => null,
}));

vi.mock("@/components/site/theme-toggle", () => ({
  ThemeToggle: () => null,
}));

vi.mock("@/components/site/locale-switcher", () => ({
  LocaleSwitcher: () => null,
}));

describe("SiteHeader account menu", () => {
  beforeEach(() => {
    logout.mockClear();
    replace.mockClear();
  });

  it("logs out before opening the account-switch login flow", async () => {
    render(<SiteHeader lang="en" nav={en.nav} />);

    await userEvent.click(screen.getByRole("button", { name: en.nav.account }));
    await userEvent.click(screen.getByRole("menuitem", { name: en.nav.switchAccount }));

    await waitFor(() => expect(logout).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/en/auth/login?switch=1");
  });

  it("keeps plain logout separate from switching accounts", async () => {
    render(<SiteHeader lang="en" nav={en.nav} />);

    await userEvent.click(screen.getByRole("button", { name: en.nav.account }));
    await userEvent.click(screen.getByRole("menuitem", { name: en.nav.logout }));

    await waitFor(() => expect(logout).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/en");
  });
});
