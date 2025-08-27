import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../Collections.module.scss";

import {
  asKind,
  getCollection,
  getItemBySlug,
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
  params: { collection: string; slug: string };
}): Promise<Metadata> {
  const kind = asKind(params.collection);
  if (!kind) return { title: "Not Found" };
  const item = await getItemBySlug(kind, params.slug);
  const title = item?.title ?? "Untitled";
  return {
    title: `${title} | 19sixtyfive`,
    alternates: { canonical: `/${params.collection}/${params.slug}` },
    openGraph: { title, images: [{ url: pickHero(item?.image_hero ?? null) }] },
  };
}

export default async function DetailPage({
  params,
}: {
  params: { collection: string; slug: string };
}) {
  const kind = asKind(params.collection);
  if (!kind) return notFound();

  const [list, item] = await Promise.all([
    getCollection(kind),
    getItemBySlug(kind, params.slug),
  ]);
  if (!item) return notFound();

  const ordered = orderByDisplay(list);
  const pn = prevNext(ordered, item);

  const hero = pickHero(item.image_hero ?? null);
  const logo = pickLogo(item.image_logo ?? null);
  const img1 = pickImageSrc(item.image_1 ?? null, "desktop");
  const img2 = pickImageSrc(item.image_2 ?? null, "desktop");
  const banner = pickBanner(item.image_banner ?? null);

  const gallery = Array.from(
    { length: 8 },
    (_, i) => `image_gallery_${i + 1}` as const
  )
    .map((k) => item[k] ?? null)
    .filter(Boolean)
    .map((img, i) => ({ key: i, src: pickImageSrc(img, "desktop") }));

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
                  src="/images/logo-icons/Left Toggle Arrow.svg"
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
                  src="/images/logo-icons/Right Toggle Arrow.svg"
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
        {item.description ? <p>{item.description}</p> : null}
        <div className={styles.images}>
          <Image src={img1} alt="Secondary 1" width={400} height={400} />
          <Image src={img2} alt="Secondary 2" width={400} height={400} />
        </div>
      </section>

      <section
        className={styles.bannerSection}
        style={{ backgroundImage: `url(${banner})` }}
      />

      {gallery.length ? (
        <section className={styles.gallery}>
          <div className={styles.galleryRow}>
            {gallery.map((g) => (
              <Image
                key={g.key}
                className={styles.galleryImg}
                src={g.src}
                alt={`Gallery ${g.key + 1}`}
                width={300}
                height={300}
                sizes="(max-width:768px) 150px, 300px"
              />
            ))}
          </div>
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