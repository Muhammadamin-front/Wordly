const serverApiUrl =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://api:8000";
export const API_URL = typeof window === "undefined" ? serverApiUrl : "";

export interface Profile {
  display_name: string;
  avatar_url: string | null;
  ui_locale: string;
  timezone: string;
  bio: string | null;
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
  refresh_token: string;
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

// Access token lives in memory only; the refresh token is an httpOnly cookie
// scoped to the API's auth path, so a page reload silently re-authenticates
// via /auth/refresh.
let accessToken: string | null = null;
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

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response | null = null;
  let networkError: unknown = null;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: "include",
    });
  } catch (error) {
    networkError = error;
  }

  if (!response) throw networkError;

  if (!response.ok) {
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

  refresh: () => apiFetch<TokenPair>("/auth/refresh", { method: "POST", body: {} }),

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
};
