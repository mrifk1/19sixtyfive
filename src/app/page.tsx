import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./Home.module.scss";
import StructuredData from "./components/StructuredData";
import VideoPlayer from "./components/VideoPlayer";
import {
  breadcrumbJsonLd,
  collectionPageMetadata,
  siteConfig,
  webPageJsonLd,
} from "@/lib/seo";

const PAGE_TITLE = "Singapore Experiential Agency | 19sixtyfive";
const PAGE_DESCRIPTION =
  "Immersive festivals, culture-first collaborations, and brand experiences crafted in Singapore for the region.";

export const metadata: Metadata = collectionPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
  image: "/og?title=19sixtyfive",
});

export const revalidate = 1800;

export default function HomePage() {
  const structuredData = [
    webPageJsonLd({
      name: PAGE_TITLE,
      path: "/",
      description: PAGE_DESCRIPTION,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: siteConfig.name, url: "/" },
    ]),
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      {/* HERO */}
      <section className={styles.hero}>
        <Image
          src="/images/logo/logo.svg"
          alt="19sixtyfive"
          width={160}
          height={160}
          priority
          sizes="160px"
        />
        <h1 className={styles.heroTitle}>
          We&apos;re 19sixtyfive.
          <br />
          We think different. Do different.
        </h1>
        <p className={styles.heroText}>
          We fuse arts, music, culture, and brands to shape experiences that are
          anything but ordinary. Every project is different, every moment is
          immersive — and yes, we happen to be rather good at it. If you&apos;re
          looking for cookie-cutter, keep walking. We&apos;re too busy making magic
          happen our own way.
        </p>
      </section>


      <VideoPlayer />

      {/* BANNER — FESTIVALS */}
      <section className={`${styles.banner} ${styles.first}`}>
        <Link
          href="/festival"
          className={styles.bannerLink}
          aria-label="Go to Festivals"
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <h2>
            Common ground:
            <br />
            festivals, flipped our way.
          </h2>
          <Link href="/festival" className={styles.bannerCta}>
            View more
          </Link>
        </div>
      </section>

      {/* FRAME — FIRST */}
      <section className={`${styles.frame} ${styles.first}`}>
        <article className={styles.frameContent}>
          <figure className={`${styles.frameItem} ${styles.left}`}>
            <div className={styles.frameImg}>
              <Image
                src="/images/home/frame-first-left.png"
                alt="Community"
                width={448}
                height={448}
                sizes="(max-width: 768px) 80vw, 448px"
              />
            </div>
            <figcaption>
              <Link href="/community">
                The community:
                <br />
                same series, fresh takes.
              </Link>
            </figcaption>
          </figure>

          <figure className={`${styles.frameItem} ${styles.right}`}>
            <div className={styles.frameImg}>
              <Image
                src="/images/home/frame-first-right.png"
                alt="Artist Spotlight"
                width={320}
                height={320}
                sizes="(max-width: 768px) 60vw, 320px"
              />
            </div>
            <figcaption>
              <Link href="/artist">
                Artist spotlight:
                <br />
                for the love of live.
              </Link>
            </figcaption>
          </figure>
        </article>
      </section>

      {/* BANNER — BRANDS */}
      <section className={`${styles.banner} ${styles.second}`}>
        <Link
          href="/brands"
          className={styles.bannerLink}
          aria-label="Go to Brands Collab"
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <h2>
            Wanting in:
            <br />
            because we get it
          </h2>
          <Link href="/brands" className={styles.bannerCta}>
            View more
          </Link>
        </div>
      </section>

      {/* FRAME — SECOND */}
      <section className={`${styles.frame} ${styles.second}`}>
        <article className={styles.frameContent}>
          <figure className={`${styles.frameItem} ${styles.left}`}>
            <div className={styles.frameImg}>
              <Image
                src="/images/home/frame-second-left.png"
                alt="Sports"
                width={448}
                height={448}
                sizes="(max-width: 768px) 80vw, 448px"
              />
            </div>
            <figcaption>
              <Link href="/sports">
                Play nice:
                <br />
                where sport gets style.
              </Link>
            </figcaption>
          </figure>

          <figure className={`${styles.frameItem} ${styles.right}`}>
            <div className={styles.frameImg}>
              <Image
                src="/images/home/frame-second-right.png"
                alt="News"
                width={320}
                height={320}
                sizes="(max-width: 768px) 60vw, 320px"
              />
            </div>
            <figcaption>
              <Link href="/news">
                News front:
                <br />
                not just press but with punch.
              </Link>
            </figcaption>
          </figure>
        </article>
      </section>

      {/* BRANDS (icon swap) */}
      <section className={styles.brands}>
        <figure className={styles.brandItem}>
          <Link href="/fam#24owls" className={styles.brandLink}>
            <Image
              className={styles.base}
              src="/images/home/brands-first.png"
              alt="24OWLS logo"
              width={352}
                height={352}
                sizes="(max-width: 768px) 70vw, 352px"
            />
            <Image
              className={styles.hover}
              src="/images/home/brands-first-hover.png"
              alt=""
              aria-hidden="true"
              width={352}
                height={352}
                sizes="(max-width: 768px) 70vw, 352px"
            />
          </Link>
        </figure>

        <figure className={styles.brandItem}>
          <Link href="/fam#sixtyfive" className={styles.brandLink}>
            <Image
              className={styles.base}
              src="/images/home/brands-second.png"
              alt="65 logo"
              width={352}
                height={352}
                sizes="(max-width: 768px) 70vw, 352px"
            />
            <Image
              className={styles.hover}
              src="/images/home/brands-second-hover.png"
              alt=""
              aria-hidden="true"
              width={352}
                height={352}
                sizes="(max-width: 768px) 70vw, 352px"
            />
          </Link>
        </figure>

        <figure className={styles.brandItem}>
          <Link href="/fam#tangent-moves" className={styles.brandLink}>
            <Image
              className={styles.base}
              src="/images/home/brands-third.png"
              alt="Tangent Moves logo"
              width={352}
                height={352}
                sizes="(max-width: 768px) 70vw, 352px"
            />
            <Image
              className={styles.hover}
              src="/images/home/brands-third-hover.png"
              alt=""
              aria-hidden="true"
              width={352}
                height={352}
                sizes="(max-width: 768px) 70vw, 352px"
            />
          </Link>
        </figure>
      </section>
    </>
  );
}
