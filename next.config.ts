import type { NextConfig } from "next";

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30;

const allowedImageHosts = process.env.ALLOWED_IMAGE_HOSTS 
  ? process.env.ALLOWED_IMAGE_HOSTS.split(",")
  : ["localhost"];

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: allowedImageHosts.flatMap((hostname): Array<{ protocol: "http" | "https"; hostname: string }> => {
      const trimmed = hostname.trim();
      if (trimmed === "localhost") {
        return [
          { protocol: "http", hostname: "localhost" },
          { protocol: "http", hostname: "127.0.0.1" },
        ];
      }
      return [{ protocol: "https", hostname: trimmed }];
    }),
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${YEAR_IN_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/_next/image/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${MONTH_IN_SECONDS}, stale-while-revalidate=${YEAR_IN_SECONDS}`,
          },
        ],
      },
      {
        source: "/(.*)\.(png|jpe?g|gif|svg|webp|avif|mp4|webm|ico|txt|xml|json)$",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${MONTH_IN_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/fonts/(.*)\.(woff2?|ttf|otf)$",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${YEAR_IN_SECONDS}, immutable`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

