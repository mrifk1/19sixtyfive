import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wp.19sixtyfive.com.sg", pathname: "/**" },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
