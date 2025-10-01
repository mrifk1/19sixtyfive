import styles from "./Fam.module.scss";
import Image from "next/image";
import Link from "next/link";

export default function FamPage() {
  return (
    <>
      {/* HERO TITLE (single h1 for semantics) */}
      <section className={styles.heroTitleSection}>
        <h1 className={styles.heroTitle}>
          Our Fam: <br />
          We don&apos;t run solo.
        </h1>
      </section>

      {/* HERO IMAGE (matches .hero__img.hero-fam) */}
      <section className={styles.heroImage} />

      {/* ABOUT (matches .hero__subtitle) */}
      <section className={styles.aboutSection}>
        <h2 className={styles.aboutTitle}>About Us</h2>
        <p className={styles.aboutText}>
          Behind the curtain is a tight crew — building spaces, backing bold
          ideas, and keeping the energy sharp. These are our kind of people:
          full of mischief, full of heart, and always ready to make something
          happen.
        </p>
      </section>

      {/* 24OWLS (matches .brand-showcase--24owls) */}
      <section className={`${styles.banner} ${styles.bannerFirst}`} id="24owls">
        <Link
          href="https://24owls.sg/"
          className={styles.bannerLink}
          target="_blank"
          aria-label="Visit 24OWLS Website"
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerInfo}>
            <Image
              src="/images/fam/logo-first.svg"
              alt="24owls logo"
              width={200}
              height={80}
              priority
            />
            <h3 className={styles.bannerHeading}>
              We don&apos;t just flip projects — we flip expectations.
            </h3>
          </div>
          <Link
            href="https://24owls.sg/"
            target="_blank"
            className={styles.bannerCta}
          >
            Visit website
          </Link>
        </div>
      </section>

      {/* CONTENT 1 (matches .content-section) */}
      <section className={styles.contentSection}>
        <p className={styles.contentText}>
          We turned Pasir Panjang Power Station into a &apos;meanwhile&apos;
          venue for creators chasing new ways to show up and show off. Now,
          we&apos;re shaping 52-56 Kampong Java into the city&apos;s next arts
          hangout. These spaces host our tours, fuel our experiments, and give
          ideas room to run.
        </p>
        <div className={styles.contentImages}>
          <Image
            src="/images/fam/first-content-first.png"
            alt="singer singing on stage"
            width={400}
            height={400}
          />
          <Image
            src="/images/fam/first-content-second.png"
            alt="band rocking on a stage"
            width={400}
            height={400}
          />
        </div>
      </section>

      {/* 65 (matches .brand-showcase--65) */}
      <section
        className={`${styles.banner} ${styles.bannerSecond}`}
        id="sixtyfive"
      >
        <Link
          href="https://sixtyfive.sg/"
          className={styles.bannerLink}
          target="_blank"
          aria-label="Visit 65 Website"
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerInfo}>
            <Image
              src="/images/fam/logo-second.png"
              alt="65 logo"
              width={200}
              height={80}
            />
            <h3 className={styles.bannerHeading}>
              No cookie-cutter rosters here.
            </h3>
          </div>
          <Link
            href="https://sixtyfive.sg/"
            target="_blank"
            className={styles.bannerCta}
          >
            Visit website
          </Link>
        </div>
      </section>

      {/* CONTENT 2 */}
      <section className={styles.contentSection}>
        <p className={styles.contentText}>
          From classical to hip hop, jazz to ambient — composers, arrangers,
          performers — we rep artists with range. Commission a piece, book a
          set, or let us sort the whole programme. We&apos;ve got the line-up
          and the instinct to match.
        </p>
        <div className={styles.contentImages}>
          <Image
            src="/images/fam/second-content-first.png"
            alt="Alicia Pan"
            width={400}
            height={400}
          />
          <Image
            src="/images/fam/second-content-second.png"
            alt="a Woman Playing Piano Smiling"
            width={400}
            height={400}
          />
        </div>
      </section>

      {/* TANGENT MOVES (matches .brand-showcase--tangent) */}
      <section
        className={`${styles.banner} ${styles.bannerThird}`}
        id="tangent-moves"
      >
        {/* <Link
          href="https://tangentmoves.sg/"
          className={styles.bannerLink}
          target="_blank"
          aria-label="Visit Tangent Moves"
        /> */}
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerInfo}>
            <Image
              src="/images/fam/logo-third.svg"
              alt="Tangent Moves Logo"
              width={200}
              height={80}
            />
            <h3 className={styles.bannerHeading}>
              Pushing art forward, sideways, and sometimes, upside down.
            </h3>
          </div>
          {/* <Link
            href="https://tangentmoves.sg/"
            className={styles.bannerCta}
            target="_blank"
          >
            Visit website
          </Link> */}
        </div>
      </section>

      {/* CONTENT 3 */}
      <section className={styles.contentSection}>
        <p className={styles.contentText}>
          This is our initiative to keep art in motion. Classical music lights
          the spark, but the work takes many shapes: collaborations, thoughtful
          performances and programmes that make art more open, more present, and
          more alive. Because art should show up — and stay with you.
        </p>
        <div className={styles.contentImages}>
          <Image
            src="/images/fam/third-content-first.png"
            alt="The Wondrous Path"
            width={400}
            height={400}
          />
          <Image
            src="/images/fam/third-content-second.png"
            alt="Flock Lorong Boys"
            width={400}
            height={400}
          />
        </div>
      </section>
    </>
  );
}
