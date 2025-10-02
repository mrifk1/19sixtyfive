import type { NextConfig } from "next";

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30;

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://wp.19sixtyfive.com.sg;
  font-src 'self' data:;
  connect-src 'self' https://wp.19sixtyfive.com.sg;
  media-src 'self' https://wp.19sixtyfive.com.sg;
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wp.19sixtyfive.com.sg", pathname: "/**" },
    ],
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
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

