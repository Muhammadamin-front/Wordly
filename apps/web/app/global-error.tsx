"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Nimadir xato ketdi</h1>
            <p style={{ opacity: 0.7, marginBottom: "1rem" }}>Sahifani qayta yuklab ko&apos;ring.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid currentColor", background: "transparent", cursor: "pointer" }}
            >
              Qayta yuklash
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
