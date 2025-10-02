import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DM_Sans, Montserrat } from "next/font/google";
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

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-dm-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-montserrat",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const nonce = headerList.get("x-nonce") ?? undefined;

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
      <body
        className={`${dmSans.className} ${dmSans.variable} ${montserrat.variable}`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
        <StructuredData
          nonce={nonce}
          data={[organizationJsonLd(), websiteJsonLd()]}
        />
      </body>
    </html>
  );
}
