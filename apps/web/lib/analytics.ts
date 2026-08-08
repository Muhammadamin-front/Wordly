"use client";

type Primitive = string | number | boolean | null | undefined;

export type AnalyticsEventName =
  | "page_viewed"
  | "ielts_resource_opened"
  | "ielts_skill_opened"
  | "pricing_viewed"
  | "premium_plan_selected"
  | "checkout_started"
  | "sandbox_premium_started";

export type AnalyticsProperties = Record<string, Primitive>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, Primitive>>;
  }
}

export function trackEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    event: name,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);

  if (process.env.NODE_ENV !== "production") {
    // Keeps local QA transparent while avoiding a vendor dependency before launch.
    console.info("[vocora analytics]", payload);
  }
}
