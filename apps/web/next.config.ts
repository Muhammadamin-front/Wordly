import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
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
    return [
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

export default nextConfig;
