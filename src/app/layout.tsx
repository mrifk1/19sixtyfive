import type { Metadata, Viewport } from "next";
import "../styles/globals.scss"; // global scss
import Footer from "./components/footer";
import Header from "./components/header";
import StructuredData from "./components/StructuredData";
import {
  defaultMetadata,
  organizationJsonLd,
  siteConfig,
  websiteJsonLd,
} from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = defaultMetadata({
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  keywords: [
    "Singapore experiential agency",
    "brand activations",
    "music festivals Singapore",
    "creative agency Singapore",
  ],
  icons: {
    icon: "/images/logo/logo-white.svg",
    shortcut: "/images/logo/logo-white.svg",
    apple: "/images/logo/logo-white.svg",
  },
  category: "Creative Services",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.locale} data-region={siteConfig.countryCode}>
      <head>
        <link
          rel="preconnect"
          href="https://wp.19sixtyfive.com.sg"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://wp.19sixtyfive.com.sg" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <StructuredData data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
