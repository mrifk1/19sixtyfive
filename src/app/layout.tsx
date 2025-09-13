import type { Metadata, Viewport } from "next";
import "../styles/globals.scss"; // global scss
import Footer from "./components/footer";
import Header from "./components/header";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "19sixtyfive",
  description: "Experiences flipped our way.",
  metadataBase: new URL("https://19sixtyfive.com.sg"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
