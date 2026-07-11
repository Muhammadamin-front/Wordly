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
    // Serper word thumbnails live on Google's stable thumbnail CDN.
    remotePatterns: [{ protocol: "https", hostname: "**.gstatic.com" }],
  },
};

export default nextConfig;
