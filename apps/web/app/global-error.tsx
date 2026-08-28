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
            {/* Keep the last-resort boundary independent from image loading and
                optimization. The previous 2.6 MB poster slowed the one screen
                that must appear immediately on weak connections. */}
            <div
              aria-hidden="true"
              style={{
                width: "7rem",
                height: "7rem",
                display: "grid",
                placeItems: "center",
                borderRadius: "1rem",
                border: "2px solid currentColor",
                margin: "0 auto 1.25rem",
                background: "#b94e28",
                color: "#fff8ea",
                fontSize: "3.5rem",
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              V
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Texnik ishlar olib borilmoqda
            </h1>
            <p style={{ opacity: 0.7, marginBottom: "1rem" }}>
              Bir necha daqiqadan so&apos;ng qayta urinib ko&apos;ring.
            </p>
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
