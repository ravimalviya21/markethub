import type { NextConfig } from "next";

// Server-side only: where the Express backend lives as seen from the Next server.
// In Docker this is the compose service name, not localhost.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:3002";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${BACKEND_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
