import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // whitelist domain gambar eksternal
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wp.19sixtyfive.com.sg",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
