import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { SiteHeader } from "@/components/site/header";
import { useAuth } from "@/components/auth/auth-provider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/components/gamification/stats-widget", () => ({ StatsWidget: () => null }));
vi.mock("@/components/site/theme-toggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/site/locale-switcher", () => ({ LocaleSwitcher: () => null }));

function mockUser(role: string) {
  vi.mocked(useAuth).mockReturnValue({
    ready: true,
    user: { role, profile: { display_name: "Dilnoza" } },
    logout: vi.fn(() => Promise.resolve()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

describe("SiteHeader admin entry point", () => {
  it("hides the admin panel link for a plain learner", async () => {
    mockUser("learner");
    render(<SiteHeader lang="en" nav={en.nav} />);

    await userEvent.click(screen.getByRole("button", { name: en.nav.account }));
    expect(screen.queryByRole("menuitem", { name: en.nav.admin })).not.toBeInTheDocument();
  });

  it("shows the admin panel link, pointing at /en/admin, for a staff role", async () => {
    mockUser("super_admin");
    render(<SiteHeader lang="en" nav={en.nav} />);

    await userEvent.click(screen.getByRole("button", { name: en.nav.account }));
    const link = screen.getByRole("menuitem", { name: en.nav.admin });
    expect(link).toHaveAttribute("href", "/en/admin");
  });
});
