import type { NextConfig } from "next";

// The backend (wad-judging-be) has no CORS setup — it expects same-origin
// requests. Proxying "/api/*" here means the browser always talks to this
// app's own origin, and the backend's http-only session cookie just works.
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ?? "https://wadjudge.netlify.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
