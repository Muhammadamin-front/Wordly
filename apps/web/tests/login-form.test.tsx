import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LoginForm } from "@/components/auth/login-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => "/en/auth/login",
}));

function mockFetch(handler: (url: string) => Response | Promise<Response>) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => Promise.resolve(handler(String(input))))
  );
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const USER = {
  id: "u1",
  email: "dilnoza@example.uz",
  email_verified: true,
  role: "learner",
  profile: {
    display_name: "Dilnoza",
    avatar_url: null,
    ui_locale: "en",
    timezone: "Asia/Tashkent",
    bio: null,
    cefr_level: "B1",
    learning_goal: "general",
    daily_minutes: 10,
    learning_interests: ["daily-life"],
    onboarding_completed: true,
    starter_deck_id: "deck-1",
  },
};

const PAIR = {
  access_token: "acc",
  token_type: "bearer",
  expires_in: 900,
  user: USER,
};

describe("LoginForm", () => {
  beforeEach(() => {
    // Silent refresh on AuthProvider mount fails => signed-out state.
    mockFetch((url) => {
      if (url.includes("/auth/refresh")) return json(401, { detail: "No refresh token" });
      throw new Error(`unexpected fetch: ${url}`);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    push.mockClear();
  });

  it("renders email/password fields and links", async () => {
    render(
      <AuthProvider>
        <LoginForm lang="en" auth={en.auth} />
      </AuthProvider>
    );
    expect(screen.getByLabelText(en.auth.email)).toBeInTheDocument();
    expect(screen.getByLabelText(en.auth.password)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.auth.loginButton })).toBeInTheDocument();
    expect(screen.getByText(en.auth.forgotLink)).toHaveAttribute(
      "href",
      "/en/auth/forgot-password"
    );
  });

  it("explains that another provider account can be selected after switching", () => {
    render(
      <AuthProvider>
        <LoginForm lang="en" auth={en.auth} switchingAccount />
      </AuthProvider>
    );

    expect(screen.getByRole("status")).toHaveTextContent(en.auth.switchAccountNotice);
  });

  it("shows a localized error on 401", async () => {
    mockFetch((url) => {
      if (url.includes("/auth/refresh")) return json(401, { detail: "No refresh token" });
      if (url.includes("/auth/login"))
        return json(401, { detail: "Incorrect email or password" });
      throw new Error(`unexpected fetch: ${url}`);
    });

    render(
      <AuthProvider>
        <LoginForm lang="en" auth={en.auth} />
      </AuthProvider>
    );
    await userEvent.type(screen.getByLabelText(en.auth.email), "x@example.uz");
    await userEvent.type(screen.getByLabelText(en.auth.password), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: en.auth.loginButton }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      en.auth.errorInvalidCredentials
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("sends a signed-in learner to today's plan", async () => {
    mockFetch((url) => {
      if (url.includes("/auth/refresh")) return json(401, { detail: "No refresh token" });
      if (url.includes("/auth/login")) return json(200, PAIR);
      throw new Error(`unexpected fetch: ${url}`);
    });

    render(
      <AuthProvider>
        <LoginForm lang="en" auth={en.auth} />
      </AuthProvider>
    );
    await userEvent.type(screen.getByLabelText(en.auth.email), USER.email);
    await userEvent.type(screen.getByLabelText(en.auth.password), "correct-password");
    await userEvent.click(screen.getByRole("button", { name: en.auth.loginButton }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/today"));
  });

  it("continues an incomplete account into onboarding", async () => {
    const incompletePair = {
      ...PAIR,
      user: {
        ...USER,
        profile: {
          ...USER.profile,
          onboarding_completed: false,
          starter_deck_id: null,
        },
      },
    };
    mockFetch((url) => {
      if (url.includes("/auth/refresh")) return json(401, { detail: "No refresh token" });
      if (url.includes("/auth/login")) return json(200, incompletePair);
      throw new Error(`unexpected fetch: ${url}`);
    });

    render(
      <AuthProvider>
        <LoginForm lang="en" auth={en.auth} />
      </AuthProvider>
    );
    await userEvent.type(screen.getByLabelText(en.auth.email), USER.email);
    await userEvent.type(screen.getByLabelText(en.auth.password), "correct-password");
    await userEvent.click(screen.getByRole("button", { name: en.auth.loginButton }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/onboarding"));
  });
});
