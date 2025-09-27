import Link from "next/link";
import styles from "./Home.module.scss";
import VideoPlayer from "./components/VideoPlayer";
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <Image
          src="/images/logo/logo.svg"
          alt="19sixtyfive"
          width={160}
          height={160}
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
              />
            </div>
            <figcaption>
              <Link href="/artist-spotlight">
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
          href="/brands-collab"
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
          <Link href="/brands-collab" className={styles.bannerCta}>
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
          <Link href="/our-fam#24owls" className={styles.brandLink}>
            <Image
              className={styles.base}
              src="/images/home/brands-first.png"
              alt="24OWLS logo"
              width={352}
              height={352}
            />
            <Image
              className={styles.hover}
              src="/images/home/brands-first-hover.png"
              alt=""
              aria-hidden="true"
              width={352}
              height={352}
            />
          </Link>
        </figure>

        <figure className={styles.brandItem}>
          <Link href="/our-fam#sixtyfive" className={styles.brandLink}>
            <Image
              className={styles.base}
              src="/images/home/brands-second.png"
              alt="65 logo"
              width={352}
              height={352}
            />
            <Image
              className={styles.hover}
              src="/images/home/brands-second-hover.png"
              alt=""
              aria-hidden="true"
              width={352}
              height={352}
            />
          </Link>
        </figure>

        <figure className={styles.brandItem}>
          <Link href="/our-fam#tangent-moves" className={styles.brandLink}>
            <Image
              className={styles.base}
              src="/images/home/brands-third.png"
              alt="Tangent Moves logo"
              width={352}
              height={352}
            />
            <Image
              className={styles.hover}
              src="/images/home/brands-third-hover.png"
              alt=""
              aria-hidden="true"
              width={352}
              height={352}
            />
          </Link>
        </figure>
      </section>
    </>
  );
}
