import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://19sixtyfive.com.sg";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    // Block all in development/staging
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  // Production rules
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
