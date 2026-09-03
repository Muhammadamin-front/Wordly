import { trackApiFailure } from "@/lib/analytics";

// "api" only resolves inside the compose network; outside it, server-side
// fetches must reach the published port. Matches next.config.ts.
const serverApiUrl =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
// Browser HTTP requests can use Next's same-origin rewrite when no public API
// origin is configured. WebSockets cannot be proxied by that rewrite though,
// so production clients must retain the public API origin baked into the
// bundle (for example https://api.vocora.uz).
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
export const API_URL = typeof window === "undefined" ? serverApiUrl : publicApiUrl;

export interface Profile {
  display_name: string;
  avatar_url: string | null;
  ui_locale: string;
  timezone: string;
  bio: string | null;
  cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  learning_goal: "general" | "travel" | "career" | "ielts";
  daily_minutes: 5 | 10 | 15 | 20;
  learning_interests: string[];
  onboarding_completed: boolean;
  starter_deck_id: string | null;
  target_band_score: number | null;
  exam_date: string | null;
}

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  role: string;
  profile: Profile;
}

export interface TokenPair {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
  }
}

export class ApiTimeoutError extends Error {
  constructor(public timeoutMs: number) {
    super(`API request timed out after ${timeoutMs}ms`);
    this.name = "ApiTimeoutError";
  }
}

export const DEFAULT_API_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = DEFAULT_API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new ApiTimeoutError(timeoutMs);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// Access token lives in memory only; the refresh token is an httpOnly cookie
// scoped to the API's auth path, so a page reload silently re-authenticates
// via /auth/refresh.
let accessToken: string | null = null;
let sessionRefresh: Promise<TokenPair | null> | null = null;
const accessTokenWaiters = new Set<(token: string | null) => void>();

export function setAccessToken(token: string | null) {
  accessToken = token;
  for (const resolve of accessTokenWaiters) resolve(token);
  accessTokenWaiters.clear();
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** Wait briefly for AuthProvider's silent refresh to finish.
 *
 * Audio buttons can be clicked while the page is visible but before the
 * refresh request has restored the in-memory access token. Without this wait,
 * that small race turns an otherwise healthy TTS request into a 401.
 */
export function waitForAccessToken(timeoutMs = 3000): Promise<string | null> {
  if (accessToken) return Promise.resolve(accessToken);
  return new Promise((resolve) => {
    const finish = (token: string | null) => {
      clearTimeout(timeout);
      accessTokenWaiters.delete(finish);
      resolve(token);
    };
    accessTokenWaiters.add(finish);
    const timeout = setTimeout(() => finish(accessToken), timeoutMs);
  });
}

/** The one place `/auth/refresh` is ever called. `AuthProvider`'s own
 *  silent-refresh-on-mount and `apiFetch`'s 401-triggered retry used to hit
 *  this endpoint independently — two unrelated in-flight requests racing to
 *  redeem the same single-use, rotating refresh-token cookie. The backend
 *  treats a reused (already-rotated) refresh token as theft and revokes
 *  every session for that user (`rotate_refresh_token` in
 *  apps/api/app/services/auth.py), so whichever of the two calls lost that
 *  race didn't just fail quietly — it could log the user out of every tab
 *  and device. Routing both call sites through this single deduped promise
 *  means at most one refresh is ever in flight application-wide. */
export function refreshSession(): Promise<TokenPair | null> {
  if (sessionRefresh) return sessionRefresh;
  sessionRefresh = fetchWithTimeout(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    credentials: "include",
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const pair = (await response.json()) as TokenPair;
      setAccessToken(pair.access_token);
      return pair;
    })
    .catch(() => null)
    .finally(() => {
      sessionRefresh = null;
    });
  return sessionRefresh;
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    auth?: boolean;
    headers?: Record<string, string>;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (options.auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const request = () =>
    fetchWithTimeout(`${API_URL}/api/v1${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: "include",
    }, options.timeoutMs);

  let response: Response | null = null;
  let networkError: unknown = null;
  try {
    response = await request();
    if (response.status === 401 && options.auth) {
      const pair = await refreshSession();
      if (pair) {
        headers.Authorization = `Bearer ${pair.access_token}`;
        // If the retry itself throws (network/timeout), this assignment never
        // completes — reset first so `response` doesn't keep the stale 401
        // and get reported as "unauthorized" instead of the real failure.
        response = null;
        response = await request();
      }
    }
  } catch (error) {
    networkError = error;
  }

  if (!response) {
    trackApiFailure(path);
    throw networkError;
  }

  if (!response.ok) {
    // Expected validation/auth responses are handled by the product UI; only
    // availability failures should become operational error signals.
    if (response.status >= 500) trackApiFailure(path, response.status);
    let detail = response.statusText;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      // non-JSON error body — keep statusText
    }
    throw new ApiError(response.status, detail);
  }
  return (await response.json()) as T;
}

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    display_name: string;
    ui_locale: string;
    referral_code?: string;
  }) => apiFetch<TokenPair>("/auth/register", { method: "POST", body }),

  login: (body: { email: string; password: string }) =>
    apiFetch<TokenPair>("/auth/login", { method: "POST", body }),

  google: (idToken: string) =>
    apiFetch<TokenPair>("/auth/google", { method: "POST", body: { id_token: idToken } }),

  apple: (idToken: string, displayName?: string) =>
    apiFetch<TokenPair>("/auth/apple", {
      method: "POST",
      body: { id_token: idToken, display_name: displayName },
    }),

  github: (code: string, redirectUri: string) =>
    apiFetch<TokenPair>("/auth/github", {
      method: "POST",
      body: { code, redirect_uri: redirectUri },
    }),

  telegram: (fields: Record<string, string>) =>
    apiFetch<TokenPair>("/auth/telegram", { method: "POST", body: fields }),

  refresh: refreshSession,

  logout: () => apiFetch<{ message: string }>("/auth/logout", { method: "POST", body: {} }),

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>("/auth/verify-email", { method: "POST", body: { token } }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, new_password: newPassword },
    }),

  me: () => apiFetch<User>("/auth/me", { auth: true }),

  deleteAccount: () =>
    apiFetch<{ message: string }>("/users/me/delete", {
      method: "POST",
      body: { confirmation: "DELETE" },
      auth: true,
    }),
};

/** Downloads everything the account has generated as one JSON file. */
export async function exportAccountData(): Promise<void> {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}/api/v1/users/me/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!response.ok) throw new Error("export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "vocora-export.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export interface OnboardingInput {
  cefr_level: Profile["cefr_level"];
  learning_goal: Profile["learning_goal"];
  daily_minutes: Profile["daily_minutes"];
  learning_interests: string[];
}

export interface OnboardingResult {
  user: User;
  starter_deck_id: string;
  starter_cards: number;
}

export const onboardingApi = {
  complete: (body: OnboardingInput) =>
    apiFetch<OnboardingResult>("/users/me/onboarding", {
      method: "PUT",
      body,
      auth: true,
    }),
};

export const profileApi = {
  update: (body: { target_band_score?: number; exam_date?: string | null }) =>
    apiFetch<User>("/users/me", { method: "PATCH", body, auth: true }),
};
