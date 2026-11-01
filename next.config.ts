import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  // Don't let `next dev` write an AGENTS.md into the repo.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // Turbopack's persistent cache served the previous globals.css after the theme changed:
    // Vercel restores .next/cache between deploys and the Tailwind loader output came back stale.
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
  },
  // Hide the dev-only Next.js badge; it sat on top of the page in the bottom-left corner.
  devIndicators: false,
  // The chat route reads the knowledge document from disk at runtime.
  outputFileTracingIncludes: {
    "/api/chat": ["./src/content/about-me.md"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
