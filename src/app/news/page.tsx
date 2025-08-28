import type { Metadata } from "next";
import styles from "./News.module.scss";
import { getNews, buildNewsFilters } from "@/lib/api";
import NewsClient from "./NewsClient";

export const dynamic = "force-dynamic";  

export const metadata: Metadata = {
  title: "News | 19sixtyfive",
  alternates: { canonical: "/news" },
};

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
    "/images/news/carousel-1.png",
    "/images/news/carousel-2.png",
    "/images/news/carousel-3.png",
  ];

  return (
    <>
      {/* HERO */}
      <section className={styles.heroTitle}>
        <h1>
          News front: <br />
          Not just press but with punch.
        </h1>
      </section>

      {/* Angled hero image */}
      <section className={`${styles.heroImg} ${styles.heroNews}`} />

      {/* SUBTITLE */}
      <section className={`${styles.heroSubtitle} ${styles.newsSubtitle}`}>
        <h1>News Front</h1>
        <p>
          From low-key buzz to headline heat, we know how to get the right
          people talking — and keep them talking.
        </p>
      </section>

      {/* FRAME + CONTENT */}
      <main className={`${styles.frame} ${styles.frameNews} ${styles.frameBlack}`}>
        <NewsClient items={items} filters={filters} slides={slides} />
      </main>
    </>
  );
}
