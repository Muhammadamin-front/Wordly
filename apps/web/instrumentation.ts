import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures unhandled server-side request errors (route handlers, server
// actions, Server Component rendering) — a no-op when Sentry wasn't init'd.
export const onRequestError = Sentry.captureRequestError;
