import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Only run ESLint on development builds, not production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during production build
    ignoreBuildErrors: true,
  },
  output: "standalone",
};

export default nextConfig;
