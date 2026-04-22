import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ttfexcskbojumnwknmlc.supabase.co",
      },
    ],
  },
};

export default nextConfig;
