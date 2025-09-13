"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./News.module.scss";
import type { NewsItem } from "@/types";

type Filter = { slug: string; name: string; count: number };

type Props = {
  items: NewsItem[];
  filters: Filter[];
  slides: string[];
};

const PER_PAGE = 5;

export default function NewsClient({ items, filters, slides }: Props) {
  const [active, setActive] = useState<string>("all");
  const [visible, setVisible] = useState(PER_PAGE);

  // Reset visible when filter changes
  useEffect(() => setVisible(PER_PAGE), [active]);

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter(
      (n) => (n.category_slug ?? "").toLowerCase() === active
    );
  }, [items, active]);

  const canLoadMore = visible < filtered.length;

  // Filter out empty slide URLs
  const validSlides = slides.filter(src => src);

  // ----- Simple carousel -----
  const [slide, setSlide] = useState(0);
  const timer = useRef<number | null>(null);
  
  const startTimer = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setSlide((s) => (s + 1) % validSlides.length);
    }, 5000);
  }, [validSlides.length]);
  
  const stopTimer = () => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };
  
  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer]);
  
  const goToSlide = (index: number) => {
    setSlide(index);
    stopTimer();
    setTimeout(startTimer, 1000); // Restart timer after manual navigation
  };

  return (
    <>
      {/* FILTERS */}
      <section className={styles.newsFilter} data-resource="news-filters">
        <ul className={styles.newsFilterList}>
          {filters.map((f) => (
            <li key={f.slug}>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActive(f.slug);
                }}
                className={active === f.slug ? styles.active : ""}
                aria-current={active === f.slug ? "true" : undefined}
              >
                {f.name}
                <span className={styles.filterCount}>({f.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CONTENT */}
      <section className={styles.newsContent} data-resource="news">
        {/* CAROUSEL */}
        <div className={styles.newsCarousel}>
          <div
            className={styles.carouselContainer}
            style={{
              width: `${validSlides.length * 100}%`,
              transform: `translateX(-${100 * slide}%)`,
            }}
          >
            {validSlides.map((src, i) => (
              <div 
                key={i} 
                className={styles.carouselSlide}
                style={{ width: "100%" }}
              >
                <Image
                  src={src}
                  alt={`Slide ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 100vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <div className={styles.carouselDots}>
            {validSlides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === slide ? styles.active : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className={styles.newsItemsContainer}>
          {filtered.slice(0, visible).map((n) => {
            return (
              <a
                key={n.id}
                className={styles.newsItem}
                href={n.website_link || "#"}
                target={n.website_link ? "_blank" : undefined}
                rel={n.website_link ? "noopener noreferrer" : undefined}
              >
                <div className={styles.newsContentWrapper}>
                  <div className={styles.newsText}>
                    <h1>{n.media_name || n.artist || "Press"}</h1>
                  </div>
                  <div className={styles.newsText}>
                    <h1>{n.artist || "Press"}</h1>
                  </div>
                </div>
                <div className={styles.newsTitle}>
                  <h1>{n.title || "Untitled"}</h1>
                </div>
                <div className={styles.newsArrow} aria-hidden="true" />
              </a>
            );
          })}
        </div>

        {/* LOAD MORE */}
        {canLoadMore && (
          <button
            className={styles.loadMore}
            onClick={() => setVisible((v) => v + PER_PAGE)}
          >
            Load more
          </button>
        )}
      </section>
    </>
  );
}
