import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { GamesHub } from "@/components/games/games-hub";
import { GAME_TYPES } from "@/lib/games";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({ ready: true, user: { id: "learner-1" } }),
}));

vi.mock("@/components/billing/use-premium-status", () => ({
  usePremiumStatus: () => true,
}));

vi.mock("@/components/gamification/daily-quests", () => ({
  DailyQuestsPanel: () => <div>Daily quests</div>,
}));

describe("GamesHub Word Chain entry", () => {
  it("places the live Word Chain game before the solo practice grid", () => {
    render(<GamesHub lang="en" games={en.games} gam={en.gam} wordChain={en.wordChain} />);

    const wordChainLink = screen.getByRole("link", {
      name: `${en.wordChain.title} — ${en.wordChain.playOnline}`,
    });

    expect(wordChainLink).toHaveAttribute("href", "/en/multiplayer/word-chain");
    expect(screen.getByRole("heading", { name: en.games.soloPracticeTitle })).toBeVisible();
    expect(wordChainLink.compareDocumentPosition(screen.getByText(en.games.word_match.name))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("gives each solo game a stable visual identity hook", () => {
    render(<GamesHub lang="en" games={en.games} gam={en.gam} wordChain={en.wordChain} />);

    expect(
      GAME_TYPES.map((type) =>
        screen.getByRole("link", { name: en.games[type].name }).getAttribute("data-game")
      )
    ).toEqual(GAME_TYPES);
  });
});
