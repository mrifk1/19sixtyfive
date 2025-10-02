import type { Metadata } from "next";
import styles from "./News.module.scss";
import { getNews, buildNewsFilters } from "@/lib/api";
import NewsClient from "./NewsClient";
import StructuredData from "@/app/components/StructuredData";
import {
  breadcrumbJsonLd,
  collectionPageMetadata,
  itemListJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";  

export const metadata: Metadata = collectionPageMetadata({
  title: "News | 19sixtyfive",
  description:
    "Latest coverage and press about 19sixtyfive’s artists, festivals, and cultural collaborations in Singapore.",
  path: "/news",
  image: "/og?title=News",
});

async function getNewsSafe(timeoutMs = 8000) {
  try {
    const result = await Promise.race([
      getNews(), 
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("news-timeout")), timeoutMs)
      ),
    ]);
    return result as Awaited<ReturnType<typeof getNews>>;
  } catch {
    return []; 
  }
}

export default async function NewsPage() {
  const items = await getNewsSafe(8000); 
  const filters = buildNewsFilters(items);

  const slides = [
    "/images/news/01-All.png",
    "/images/news/02-All The Buzz.png",
    "/images/news/03-Artist News.png",
    "/images/news/04-Festivals.png",
  ];

  const structuredData = [
    webPageJsonLd({
      name: "News",
      path: "/news",
      description:
        "Latest coverage and press about 19sixtyfive’s artists, festivals, and cultural collaborations in Singapore.",
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "News", url: "/news" },
    ]),
    itemListJsonLd(
      "Latest News",
      items.slice(0, 10).map((item) => ({
        name: item.title,
        url: item.website_link || `/news#${item.slug ?? item.id}`,
      }))
    ),
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      {/* HERO */}
      <section className={styles.heroTitle}>
        <h1>
          News front: <br />
          Not just press but with punch.
        </h1>
      </section>

      {/* Angled hero image */}
      <section className={`${styles.heroImg}`} />

      {/* SUBTITLE */}
      <section className={`${styles.heroSubtitle}`}>
        <h1>News Front</h1>
        <p>
          From low-key buzz to headline heat, we know how to get the right
          people talking — and keep them talking.
        </p>
      </section>

      {/* FRAME + CONTENT */}
      <main className={`${styles.frame} ${styles.frameBlack}`}>
        <NewsClient items={items} filters={filters} slides={slides} />
      </main>
    </>
  );
}
