import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    // Keep default PII collection off — the app already avoids logging emails,
    // tokens, and other identifying fields (see lib/analytics.ts).
    dataCollection: {
      userInfo: false,
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
