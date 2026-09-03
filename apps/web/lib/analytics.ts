type Primitive = string | number | boolean | null | undefined;

export type AnalyticsEventName =
  | "page_viewed"
  | "ielts_resource_opened"
  | "ielts_skill_opened"
  | "pricing_viewed"
  | "premium_plan_selected"
  | "checkout_started"
  | "sandbox_premium_started"
  | "signup_started"
  | "signup_completed"
  | "login_completed"
  | "onboarding_answers_saved"
  | "onboarding_completed"
  | "onboarding_beginner_selected"
  | "lesson_started"
  | "lesson_completed"
  | "flashcard_reviewed"
  | "writing_submitted"
  | "upgrade_clicked"
  | "subscription_started"
  | "subscription_cancelled"
  | "api_request_failed";

export type AnalyticsProperties = Record<string, Primitive>;

const SENSITIVE_PROPERTY = /password|token|cookie|authorization|secret|email|phone|name|text|prompt|content/i;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, Primitive>>;
  }
}

export function trackEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;

  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => !SENSITIVE_PROPERTY.test(key) && value !== undefined)
  );

  const payload = {
    event: name,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...safeProperties,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);

  if (process.env.NODE_ENV !== "production") {
    // Keeps local QA transparent while avoiding a vendor dependency before launch.
    console.info("[vocora analytics]", payload);
  }
}

/** Shared API telemetry entrypoint. Paths and status codes only; no bodies or credentials. */
export function trackApiFailure(path: string, status?: number) {
  trackEvent("api_request_failed", {
    endpoint: path.split("?")[0],
    status: status ?? null,
  });
}
