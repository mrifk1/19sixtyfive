"use client";

import { useMemo, useState, useEffect } from "react";
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

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-"); // non-alnum -> dash
}

function basename(p: string) {
  const q = p.split("?")[0].split("#")[0];
  return q.substring(q.lastIndexOf("/") + 1);
}

export default function NewsClient({ items, filters, slides }: Props) {
  const [active, setActive] = useState<string>("all");
  const [visible, setVisible] = useState(PER_PAGE);
  const [slide, setSlide] = useState(0);

  useEffect(() => setVisible(PER_PAGE), [active]);

  const filtered = useMemo(() => {
    if (active === "all") return items;
    return items.filter(
      (n) => (n.category_slug ?? "").toLowerCase() === active
    );
  }, [items, active]);

  const canLoadMore = visible < filtered.length;

  // 1) Preprocess slide filenames for matching
  const slideKeys = useMemo(
    () =>
      slides.filter(Boolean).map((src) => ({
        src,
        key: normalize(basename(src)), 
      })),
    [slides]
  );

  // 2) Build ordered slides aligned to filters order
  const orderedSlides = useMemo(() => {
    if (!slideKeys.length) return [] as string[];

    return filters.map((f) => {
      const slugKey = normalize(f.slug); // "artist-news"
      const nameKey = normalize(f.name); // "artist-news"
      let idx = slideKeys.findIndex((s) => s.key.includes(slugKey));
      if (idx === -1) idx = slideKeys.findIndex((s) => s.key.includes(nameKey));
      if (idx === -1) idx = 0; // fallback
      return slideKeys[idx].src;
    });
  }, [filters, slideKeys]);

  // 3) Map slug -> index for instant jumps
  const indexBySlug = useMemo(() => {
    const map: Record<string, number> = {};
    filters.forEach((f, i) => {
      map[(f.slug || "").toLowerCase()] = i;
    });
    return map;
  }, [filters]);

  // 4) Keep slide in range if filters change
  useEffect(() => {
    if (slide >= orderedSlides.length) setSlide(0);
  }, [orderedSlides, slide]);

  const onSelectFilter = (slug: string) => {
    setActive(slug);
    const idx = indexBySlug[slug.toLowerCase()];
    setSlide(Number.isInteger(idx) ? idx : 0);
  };

  return (
    <>
      {/* FILTERS */}
      <section className={styles.newsFilter} data-resource="news-filters">
        <ul className={styles.newsFilterList}>
          {filters.map((f, i) => (
            <li key={f.slug}>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectFilter(f.slug);
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
              width: `${Math.max(orderedSlides.length, 1) * 100}%`,
              transform: `translateX(-${100 * slide}%)`,
            }}
          >
            {orderedSlides.map((src, i) => (
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
            {orderedSlides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === slide ? styles.active : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className={styles.newsItemsContainer}>
          {filtered.slice(0, visible).map((n) => (
            <a
              key={n.id}
              className={styles.newsItem}
              href={n.website_link || "#"}
              target={n.website_link ? "_blank" : undefined}
              rel={n.website_link ? "noopener noreferrer" : undefined}
            >
              <div className={styles.newsContentWrapper}>
                <div className={styles.newsText}>
                  <h1>{n.media_name}</h1>
                </div>
                <div className={styles.newsText}>
                  <h1>{n.artist}</h1>
                </div>
              </div>
              <div className={styles.newsTitle}>
                <h1>{n.title}</h1>
              </div>
              <div className={styles.newsArrow} aria-hidden="true" />
            </a>
          ))}
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
