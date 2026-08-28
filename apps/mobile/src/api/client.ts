import { Platform } from "react-native";
import type { components } from "./schema";

const localApiUrl = Platform.select({ android: "http://10.0.2.2:8000", default: "http://127.0.0.1:8000" });
export const API_URL = (process.env.EXPO_PUBLIC_API_URL?.trim() ?? localApiUrl).replace(/\/$/, "");
export type TokenPair = components["schemas"]["TokenPair"];
export type User = components["schemas"]["UserOut"];
export type Onboarding = components["schemas"]["OnboardingOut"];
export type ShelfOverview = components["schemas"]["app__api__v1__library__OverviewOut"];
export type Category = components["schemas"]["CategoryOut"];
export type WordPage = components["schemas"]["WordPage"];
export type Word = components["schemas"]["WordOut"];
export type Deck = components["schemas"]["DeckOut"];
export type Queue = components["schemas"]["QueueOut"];
export type CardOut = components["schemas"]["CardOut"];
export type CardPage = components["schemas"]["CardPage"];
export type Stats = components["schemas"]["StatsOut"];
export type MasteryMap = components["schemas"]["MasteryMapOut"];
export type DailyQuests = components["schemas"]["DailyQuestsOut"];
export type Achievement = components["schemas"]["AchievementOut"];
export type Statistics = components["schemas"]["StatisticsOut"];
export type MistakeNotebook = components["schemas"]["MistakeNotebookOut"];
export type Leaderboard = components["schemas"]["LeaderboardOut"];
export type LeaderboardEntry = components["schemas"]["LeaderboardEntry"];
export type Friend = components["schemas"]["FriendOut"];
export type PendingFriend = components["schemas"]["PendingOut"];
export type PublicProfile = components["schemas"]["PublicProfileOut"];
export type IeltsOverview = components["schemas"]["app__schemas__ielts__OverviewOut"];
export type IeltsMockSession = components["schemas"]["MockSessionOut"];
export type IeltsMockSessionListItem = components["schemas"]["MockSessionListItem"];
export type IeltsWritingTask = components["schemas"]["WritingTask"];
export type IeltsWritingScore = components["schemas"]["WritingScoreOut"];
export type IeltsGeneratedTest = components["schemas"]["GeneratedTestOut"];
export type IeltsGrade = components["schemas"]["GradeOut"];
export type IeltsBankItem = components["schemas"]["BankItemOut"];
export type ExpressionMeta = components["schemas"]["ExpressionMeta"];
export type ExpressionListItem = components["schemas"]["ExpressionListItem"];
export type ExpressionPage = components["schemas"]["ExpressionPage"];
export type ExpressionDetail = components["schemas"]["ExpressionOut"];
export type WordLookupEntry = components["schemas"]["WordLookupEntry"];
export type WordLookupResponse = components["schemas"]["WordLookupResponse"];
export type GameSession = components["schemas"]["GameSessionOut"];
export type GameQuestion = components["schemas"]["GameQuestionOut"];
export type GameAnswerResult = components["schemas"]["GameAnswerResult"];
export type GrammarQuestion = components["schemas"]["GrammarQuestionOut"];
export type GrammarResult = components["schemas"]["ReadingResult"];
export type StudentClass = components["schemas"]["StudentClassOut"];
export type StudentAssignment = components["schemas"]["StudentAssignmentOut"];
export type TeacherClass = components["schemas"]["ClassOut"];
export type ClassAnalytics = components["schemas"]["ClassAnalyticsOut"];
export type Assignment = components["schemas"]["AssignmentOut"];
export type BillingStatus = components["schemas"]["BillingStatusOut"];
export type BillingPlan = components["schemas"]["PlanOut"];
export type Subscription = components["schemas"]["SubscriptionOut"];
export type Referral = components["schemas"]["ReferralOut"];
export type Checkout = components["schemas"]["CheckoutOut"];
export type CoachCharacter = components["schemas"]["CharacterOut"];
export type CoachDashboard = components["schemas"]["DashboardOut"];
export type CoachSession = components["schemas"]["SessionOut"];
export type CoachTurn = components["schemas"]["TurnResponse"];
export type CoachScore = components["schemas"]["ScoreResponse"];
export type PushTokenRegister = {
  provider: "expo";
  token: string;
  platform: "ios" | "android";
  app_version?: string;
};
type LoginRequest = components["schemas"]["LoginRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
type GoogleLoginRequest = components["schemas"]["GoogleLoginRequest"];
type AppleLoginRequest = components["schemas"]["AppleLoginRequest"];
type ForgotPasswordRequest = components["schemas"]["ForgotPasswordRequest"];
type RefreshRequest = components["schemas"]["RefreshRequest"];
type AccountDeletionRequest = components["schemas"]["AccountDeletionRequest"];

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

type RequestOptions = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; token?: string | null; headers?: Record<string, string>; timeoutMs?: number };
type AuthBridge = { refreshAccessToken: () => Promise<string | null> };
let authBridge: AuthBridge | null = null;

export function installAuthBridge(bridge: AuthBridge | null) {
  authBridge = bridge;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const perform = async (token = options.token) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
    try {
      return await fetch(`${API_URL}/api/v1${path}`, {
        method: options.method ?? "GET",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(0, "Unable to reach Vocora. Check your connection and try again.");
    } finally {
      clearTimeout(timeout);
    }
  };

  let response = await perform();
  if (response.status === 401 && options.token && authBridge) {
    const freshToken = await authBridge.refreshAccessToken();
    if (freshToken) response = await perform(freshToken);
  }
  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    let body: { detail?: unknown } = {};
    try {
      body = raw ? JSON.parse(raw) as { detail?: unknown } : {};
    } catch {
      body = {};
    }
    const cloudflareCode = raw.match(/^error code:\s*(\d+)/i)?.[1];
    const contentType = response.headers.get("content-type") ?? "";
    const detail = typeof body.detail === "string"
      ? body.detail
      : Array.isArray(body.detail) && typeof body.detail[0]?.msg === "string"
        ? body.detail[0].msg
        : cloudflareCode
          ? `Cloudflare error ${cloudflareCode}`
          : contentType.includes("text/plain") && raw.trim().length > 0 && raw.trim().length <= 160
            ? raw.trim()
        : "Something went wrong. Please try again.";
    throw new ApiError(response.status, detail);
  }
  return response.json() as Promise<T>;
}

export const authApi = {
  login: (body: LoginRequest) => request<TokenPair>("/auth/login", { method: "POST", body, headers: { "X-Client": "mobile" } }),
  register: (body: RegisterRequest) => request<TokenPair>("/auth/register", { method: "POST", body, headers: { "X-Client": "mobile" } }),
  google: (id_token: GoogleLoginRequest["id_token"], ui_locale: NonNullable<GoogleLoginRequest["ui_locale"]>) => request<TokenPair>("/auth/google", { method: "POST", body: { id_token, ui_locale }, headers: { "X-Client": "mobile" } }),
  apple: (id_token: AppleLoginRequest["id_token"], display_name?: AppleLoginRequest["display_name"]) => request<TokenPair>("/auth/apple", { method: "POST", body: { id_token, display_name }, headers: { "X-Client": "mobile" } }),
  forgotPassword: (email: ForgotPasswordRequest["email"]) => request<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }),
  refresh: (refresh_token: NonNullable<RefreshRequest["refresh_token"]>) => request<TokenPair>("/auth/refresh", { method: "POST", body: { refresh_token }, headers: { "X-Client": "mobile" } }),
  logout: (refresh_token: NonNullable<RefreshRequest["refresh_token"]>) => request<{ message: string }>("/auth/logout", { method: "POST", body: { refresh_token }, headers: { "X-Client": "mobile" } }),
  me: (token: string) => request<User>("/auth/me", { token }),
  deleteAccount: (token: string) => request<{ message: string }>("/users/me/delete", { method: "POST", token, body: { confirmation: "DELETE" } satisfies AccountDeletionRequest }),
};

export const pushTokenApi = {
  register: (body: PushTokenRegister, token: string) => request<{ message: string }>("/users/me/push-tokens", { method: "POST", token, body }),
  unregister: (pushToken: string, token: string) => request<{ message: string }>("/users/me/push-tokens", { method: "DELETE", token, body: { provider: "expo", token: pushToken } }),
};
