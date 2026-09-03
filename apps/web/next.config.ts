import path from "node:path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  experimental: {
    // The only layout is app/[lang]/layout.tsx (a top-level dynamic
    // segment), so there's no shared root layout to compose a 404 from —
    // this is the documented case global-not-found.tsx exists for.
    globalNotFound: true,
  },
  // Monorepo root, so standalone tracing resolves workspace-hoisted deps and
  // the multi-lockfile inference warning goes away. next build runs from
  // apps/web (npm workspace scripts and the Dockerfile both do), so cwd is
  // the project directory.
  outputFileTracingRoot: path.join(process.cwd(), "../../"),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1600, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 512],
    qualities: [75],
    // Serper word thumbnails live on Google's stable thumbnail CDN.
    remotePatterns: [{ protocol: "https", hostname: "**.gstatic.com" }],
  },
  async rewrites() {
    // Docker Compose always passes INTERNAL_API_URL (http://api:8000, the
    // service name on the compose network). Running `next dev` on the host
    // there is no such hostname, so the fallback points at the published port
    // — otherwise every /api/v1 call fails the rewrite and returns 500.
    //
    // 127.0.0.1 rather than localhost: compose publishes the port on IPv4
    // only, while Node resolves localhost to ::1 first and the proxy fails
    // with ECONNREFUSED.
    const apiOrigin =
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    // Report-only to begin with: a policy that silently breaks Google sign-in
    // or Sentry is worse than no policy, so this collects violations first and
    // is promoted to the enforcing header once the reports come back clean.
    // Sources are the ones this app actually loads — Google Identity, Apple
    // and Telegram sign-in, the API origin, and Sentry ingest.
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "";
    const sentryOrigin = (() => {
      try {
        return process.env.NEXT_PUBLIC_SENTRY_DSN
          ? new URL(process.env.NEXT_PUBLIC_SENTRY_DSN).origin
          : "";
      } catch {
        return "";
      }
    })();
    const csp = [
      "default-src 'self'",
      // Next injects inline bootstrap scripts and the theme script runs before
      // hydration, so 'unsafe-inline' is required until this moves to nonces.
      "script-src 'self' 'unsafe-inline' https://accounts.google.com https://appleid.cdn-apple.com https://oauth.telegram.org https://telegram.org",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src 'self' ${apiOrigin} ${sentryOrigin} https://accounts.google.com`.trim(),
      "frame-src https://accounts.google.com https://appleid.apple.com https://oauth.telegram.org",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy-Report-Only", value: csp }],
      },
      {
        // Google Identity Services popup communication needs this fallback
        // when the browser is not using FedCM.
        source: "/:lang/auth/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

// Source-map upload only runs once SENTRY_ORG/SENTRY_PROJECT are set (a later
// step — create the project, then set these plus SENTRY_AUTH_TOKEN in CI).
// Without them this wrapper is a no-op passthrough of nextConfig.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
