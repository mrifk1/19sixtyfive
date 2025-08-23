import type { Metadata } from "next";
import "../styles/globals.scss"; // global scss
import Footer from "./components/footer";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "19SixtyFive",
  description: "Next.js + SCSS Setup",
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
