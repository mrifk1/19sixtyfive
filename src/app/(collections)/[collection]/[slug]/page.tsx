import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../Collections.module.scss";

import {
  asKind,
  getCollection,
  getItemBySlug,
  isMobileFromHeaders,
  orderByDisplay,
  prevNext,
  hrefOf,
  pickHero,
  pickLogo,
  pickBanner,
  pickImageSrc,
} from "@/lib/api";

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
  return {
    title: `${title} | 19sixtyfive`,
    alternates: { canonical: `/${collection}/${slug}` },
    openGraph: { title, images: [{ url: pickHero(item?.image_hero ?? null, isMobile) }] },
  };
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

  const ordered = orderByDisplay(list);
  const pn = prevNext(ordered, item);

  const hero = pickHero(item.image_hero ?? null, isMobile);
  const logo = pickLogo(item.image_logo ?? null);
  const img1 = pickImageSrc(item.image_1 ?? null, isMobile ? "mobile" : "desktop");
  const img2 = pickImageSrc(item.image_2 ?? null, isMobile ? "mobile" : "desktop");
  const banner = pickBanner(item.image_banner ?? null, isMobile);

  const galleryKeys = Array.from(
    { length: 8 },
    (_, i) => `image_gallery_${i + 1}` as const
  );
  const gallery: GalleryItem[] = galleryKeys
    .map((k, i) => {
      const img = item[k];
      return img ? { key: i, src: pickImageSrc(img, "desktop") } : null;
    })
    .filter(Boolean) as GalleryItem[];

  const rows = chunk(gallery, 4);

  return (
    <>
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
          />
          {item.website_link && (
            <a
              href={item.website_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit website
            </a>
          )}
        </div>
      </section>

      <section className={styles.contentSection}>
        <h1 className={styles.detailsTitle}>{item.title ?? "Untitled"}</h1>
        {item.description ? (
          <p dangerouslySetInnerHTML={{ __html: item.description }} />
        ) : null}
        <div className={styles.images}>
          <Image src={img1} alt="Secondary 1" width={400} height={400} />
          <Image src={img2} alt="Secondary 2" width={400} height={400} />
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
                    sizes="(max-width: 768px) 150px, 300px"
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
