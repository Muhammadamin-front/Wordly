import { render, screen, waitFor, within } from "@testing-library/react";
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

  it("keeps keyboard focus inside the mobile navigation and restores it on close", async () => {
    const user = userEvent.setup();
    render(<SiteHeader lang="en" nav={en.nav} />);

    const menuButton = screen.getByRole("button", { name: en.nav.menu });
    await user.click(menuButton);

    const dialog = screen.getByRole("dialog", { name: en.nav.menu });
    expect(dialog).toHaveAttribute("aria-modal", "true");

    const closeButton = within(dialog).getByRole("button", { name: en.nav.close });
    await waitFor(() => expect(closeButton).toHaveFocus());

    within(dialog).getByRole("link", { name: "Vocora home" }).focus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole("button", { name: en.nav.logout })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: en.nav.menu })).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });
});
