import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Revalidate news feeds every 5 minutes
  experimental: {
    staleTimes: {
      dynamic: 300,
    },
  },
  // Allow external images from football-data.org
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
    ],
  },
};

export default nextConfig;
