import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { FriendsView } from "@/components/social/friends-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    ready: true,
    user: { id: "me", profile: { display_name: "Learner" } },
  }),
}));

const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
  push.mockClear();
});

describe("FriendsView Word Chain invitations", () => {
  it("shows an incoming invite and starts joining after the learner accepts it", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/friends")) {
        return Promise.resolve(json([{ user_id: "friend-1", display_name: "Aziz", level: 3, current_streak: 5 }]));
      }
      if (url.endsWith("/friends/pending")) return Promise.resolve(json([]));
      if (url.endsWith("/friends/leaderboard")) return Promise.resolve(json([]));
      if (url.endsWith("/me/friend-code")) return Promise.resolve(json({ message: "ME123" }));
      if (url.endsWith("/word-chain/invitations")) {
        return Promise.resolve(json([{
          invitation_id: "invite-1",
          sender_id: "friend-1",
          sender_name: "Aziz",
          room_code: "CHAIN1",
          expires_at: "2026-09-01T12:30:00",
          created_at: "2026-09-01T12:00:00",
        }]));
      }
      if (url.endsWith("/word-chain/invitations/invite-1/accept") && init?.method === "POST") {
        return Promise.resolve(json({ room_code: "CHAIN1" }));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<FriendsView lang="en" social={en.social} />);

    expect(await screen.findByText(en.social.wordChainInvites)).toBeVisible();
    // The heading renders during the loading state too (friends-view.tsx
    // shows the section while wordChainInvitesLoading is true), so the row
    // itself has to be awaited separately rather than queried synchronously
    // off the back of the heading.
    expect(await screen.findByText(en.social.wordChainInviteFrom)).toBeVisible();
    expect(
      await screen.findByRole("link", { name: "Invite to Word Chain: Aziz" })
    ).toHaveAttribute("href", "/en/multiplayer/word-chain?invite=friend-1");

    await userEvent.click(screen.getByRole("button", { name: en.social.wordChainInviteJoin }));
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/en/multiplayer/word-chain?join=CHAIN1")
    );
    // Assert the accept call actually happened, rather than a total request
    // count — that number moves with any unrelated fetch in this view.
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input).endsWith("/word-chain/invitations/invite-1/accept") &&
          (init as RequestInit | undefined)?.method === "POST"
      )
    ).toBe(true);
  });
});
