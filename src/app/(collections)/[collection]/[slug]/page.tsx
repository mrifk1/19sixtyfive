import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../Collections.module.scss";

import {
  asKind,
  getCollection,
  getItemBySlug,
  getCollectionItemById,
  isMobileFromHeaders,
  orderByDisplay,
  prevNext,
  hrefOf,
  pickHero,
  pickLogo,
  pickBanner,
  pickImageSrc,
} from "@/lib/api";
import StructuredData from "@/app/components/StructuredData";
import {
  absoluteUrl,
  articleJsonLd,
  breadcrumbJsonLd,
  siteConfig,
} from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}): Promise<Metadata> {
  const { collection, slug } = await params;
  const kind = asKind(collection);
  if (!kind) return { title: "Not Found" };
  const isMobile = await isMobileFromHeaders();
  const item = await getItemBySlug(kind, slug, isMobile);
  const title = item?.title ?? "Untitled";
  const descriptionHtml = item?.description ?? item?.excerpt ?? null;
  const description = descriptionHtml
    ? descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : siteConfig.tagline;
  const canonical = absoluteUrl(`/${collection}/${slug}`);
  const hero = pickHero(item?.image_hero ?? null, isMobile);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "en-SG": canonical,
        "x-default": canonical,
      },
    },
    /* Open Graph preview keeps shared links consistent (e.g. YouTube descriptions). */
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      images: hero ? [{ url: hero, width: 1200, height: 630, alt: title }] : undefined,
    },
  } satisfies Metadata;
}

type GalleryItem = { key: number; src: string };

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>;
}) {
  const { collection, slug } = await params;
  const kind = asKind(collection);
  if (!kind) return notFound();

  // Detect mobile from request headers
  const isMobile = await isMobileFromHeaders();

  const [list, item] = await Promise.all([
    getCollection(kind, isMobile),
    getItemBySlug(kind, slug, isMobile),
  ]);
  if (!item) return notFound();

  // Fetch detail by ID to increment the view count in the backend
  // We still use the item from getItemBySlug as a fallback,
  // but try fetching the detail by ID to update the view count
  let detailItem = item;
  try {
    const fetchedDetail = await getCollectionItemById(kind, item.id, isMobile);
    if (fetchedDetail) {
      detailItem = fetchedDetail;
    }
  } catch (error) {
    // If fetching detail fails, continue using the original item
    console.error('Failed to fetch detail by ID, using original item:', error);
  }

  const ordered = orderByDisplay(list);
  const pn = prevNext(ordered, item);

  const hero = pickHero(detailItem.image_hero ?? null, isMobile);
  const logo = pickLogo(detailItem.image_logo ?? null);
  const img1 = pickImageSrc(detailItem.image_1 ?? null, isMobile ? "mobile" : "desktop");
  const img2 = pickImageSrc(detailItem.image_2 ?? null, isMobile ? "mobile" : "desktop");
  const banner = pickBanner(detailItem.image_banner ?? null, isMobile);

  const galleryKeys = Array.from(
    { length: 8 },
    (_, i) => `image_gallery_${i + 1}` as const
  );
  const gallery: GalleryItem[] = galleryKeys
    .map((k, i) => {
      const img = detailItem[k];
      return img ? { key: i, src: pickImageSrc(img, "desktop") } : null;
    })
    .filter(Boolean) as GalleryItem[];

  const rows = chunk(gallery, 4);

  const descriptionText = detailItem.description
    ? detailItem.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : detailItem.excerpt ?? siteConfig.tagline;

  const kindLabel = kind[0].toUpperCase() + kind.slice(1);

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: kindLabel, url: `/${collection}` },
      { name: detailItem.title ?? "Untitled", url: `/${collection}/${slug}` },
    ]),
    articleJsonLd({
      title: detailItem.title ?? "Untitled",
      description: descriptionText,
      url: `/${collection}/${slug}`,
      image: hero,
    }),
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      <section
        className={styles.heroSection}
        style={{ backgroundImage: `url(${hero})` }}
      >
        <div className={styles.heroNavigation}>
          {pn && (
            <>
              <Link
                className={`${styles.navBtn} nav-btn-prev`}
                aria-label="Previous"
                href={hrefOf(kind, pn.prev)}
              >
                <Image
                  src="/images/icon/arrow-left.svg"
                  alt="Previous"
                  width={40}
                  height={40}
                />
              </Link>
              <Link
                className={`${styles.navBtn} nav-btn-next`}
                aria-label="Next"
                href={hrefOf(kind, pn.next)}
              >
                <Image
                  src="/images/icon/arrow-right.svg"
                  alt="Next"
                  width={40}
                  height={40}
                />
              </Link>
            </>
          )}
        </div>

        <div className={styles.heroFooter}>
          <Image
            className="hero-logo"
            src={logo}
            alt="Logo"
            width={180}
            height={90}
            sizes="180px"
          />
          {detailItem.website_link && (
            <a
              href={detailItem.website_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit website
            </a>
          )}
        </div>
      </section>

      <section className={styles.contentSection}>
        <h1 className={styles.detailsTitle}>{detailItem.title ?? "Untitled"}</h1>
        {detailItem.description ? (
          <p dangerouslySetInnerHTML={{ __html: detailItem.description }} />
        ) : null}
        <div className={styles.images}>
          <Image
            src={img1}
            alt="Secondary 1"
            width={400}
            height={400}
            sizes="(max-width: 768px) 80vw, 400px"
          />
          <Image
            src={img2}
            alt="Secondary 2"
            width={400}
            height={400}
            sizes="(max-width: 768px) 80vw, 400px"
          />
        </div>
      </section>

      <section
        className={styles.bannerSection}
        style={{ backgroundImage: `url(${banner})` }}
      />

      {rows.length ? (
        <section className={styles.gallery} id="community-detail-section">
          {rows.map((row, rIdx) => (
            <div className={styles.galleryRow} key={`row-${rIdx}`}>
              {row.map((g) => (
                <div className={styles.imgBox} key={g.key}>
                  <Image
                    className={styles.galleryImg}
                    src={g.src}
                    alt={`Gallery ${g.key + 1}`}
                    fill
                    sizes="(max-width: 768px) 45vw, 300px"
                    priority={rIdx === 0 && g.key < 4}
                  />
                </div>
              ))}
            </div>
          ))}
        </section>
      ) : null}

      {pn ? (
        <div className={styles.articleNav}>
          <div className={`${styles.articleNavItem} ${styles.left}`}>
            <Link href={hrefOf(kind, pn.prev)}>
              {pn.prev.title ?? "Previous"}
            </Link>
          </div>
          <p>|</p>
          <div className={`${styles.articleNavItem} ${styles.right}`}>
            <Link href={hrefOf(kind, pn.next)}>{pn.next.title ?? "Next"}</Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
