import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { AuthProvider } from "@/components/auth/auth-provider";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { PLACEMENT_QUESTIONS } from "@/lib/placement-test";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}));

const USER = {
  id: "user-1",
  email: "learner@example.uz",
  email_verified: false,
  role: "learner",
  profile: {
    display_name: "Learner",
    avatar_url: null,
    ui_locale: "en",
    timezone: "Asia/Tashkent",
    bio: null,
    cefr_level: "A1",
    learning_goal: "general",
    daily_minutes: 10,
    learning_interests: [],
    onboarding_completed: false,
    starter_deck_id: null,
  },
};

const PAIR = {
  access_token: "access-token",
  token_type: "bearer",
  expires_in: 900,
  user: USER,
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
  replace.mockClear();
});

describe("OnboardingView", () => {
  it("saves three-step preferences and opens the five-word lesson", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/refresh")) return Promise.resolve(json(200, PAIR));
      if (url.includes("/users/me/onboarding")) {
        const body = JSON.parse(String(init?.body));
        expect(body).toEqual({
          cefr_level: "B1",
          learning_goal: "career",
          daily_minutes: 15,
          learning_interests: ["work"],
        });
        return Promise.resolve(
          json(200, {
            user: {
              ...USER,
              profile: {
                ...USER.profile,
                ...body,
                onboarding_completed: true,
                starter_deck_id: "starter-deck-1",
              },
            },
            starter_deck_id: "starter-deck-1",
            starter_cards: 5,
          })
        );
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <OnboardingView lang="en" copy={en.onboarding} />
      </AuthProvider>
    );

    await screen.findByRole("heading", { name: en.onboarding.goalTitle });
    await userEvent.click(
      screen.getByRole("button", { name: new RegExp(en.onboarding.goalCareer) })
    );
    await userEvent.click(screen.getByRole("button", { name: en.onboarding.continue }));

    await screen.findByRole("heading", { name: en.onboarding.levelTitle });
    await userEvent.click(screen.getByRole("button", { name: /B1/ }));
    await userEvent.click(screen.getByRole("button", { name: en.onboarding.continue }));

    await screen.findByRole("heading", { name: en.onboarding.timeTitle });
    await userEvent.click(screen.getByRole("button", { name: /^15/ }));
    await userEvent.click(screen.getByRole("button", { name: en.onboarding.startLesson }));

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/en/review?deck=starter-deck-1&onboarding=1"
      )
    );
  });

  it("recommends and applies a level from the diagnostic test", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input).includes("/auth/refresh")) return Promise.resolve(json(200, PAIR));
        throw new Error(`unexpected fetch: ${String(input)}`);
      })
    );

    render(
      <AuthProvider>
        <OnboardingView lang="en" copy={en.onboarding} />
      </AuthProvider>
    );

    await screen.findByRole("heading", { name: en.onboarding.goalTitle });
    await userEvent.click(screen.getByRole("button", { name: en.onboarding.continue }));
    await screen.findByRole("heading", { name: en.onboarding.levelTitle });
    await userEvent.click(
      screen.getByRole("button", { name: en.onboarding.placementBegin })
    );
    await userEvent.click(
      screen.getByRole("button", { name: en.onboarding.placementBegin })
    );

    for (const question of PLACEMENT_QUESTIONS) {
      await screen.findByRole("heading", { name: question.prompt });
      await userEvent.click(
        screen.getByRole("button", {
          name: `${String.fromCharCode(65 + question.correctIndex)} ${question.options[question.correctIndex]}`,
        })
      );
    }

    expect(
      await screen.findByText(en.onboarding.placementResultBody.replace("{level}", "C2"))
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", {
        name: en.onboarding.placementUseLevel.replace("{level}", "C2"),
      })
    );

    expect(
      screen.getByText(en.onboarding.placementApplied.replace("{level}", "C2"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.onboarding.roadmapEyebrow)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: en.onboarding.roadmapTitle.replace("{level}", "C2"),
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /C2/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
