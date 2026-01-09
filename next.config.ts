import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Revalidate news feeds every 5 minutes
  experimental: {
    staleTimes: {
      dynamic: 300,
    },
  },
};

export default nextConfig;
