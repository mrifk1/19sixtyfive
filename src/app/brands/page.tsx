import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./Brands.module.scss";

import { getBrands, hrefBrand, pickBrandThumb } from "@/lib/api";
import type { BrandItem } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Brands | 19sixtyfive",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  const items = await getBrands();

  return (
    <>
      <section className={styles.heroTitle}>
        <h1>
          Wanting in:
          <br />
          because we get it
        </h1>
      </section>

      <section className={`${styles.heroImg} ${styles.heroBrands}`} />

      <section className={styles.heroSubtitle}>
        <h1>Brands Collaboration</h1>
        <p>
          Brands work with us when they’re done whispering — and ready to cut
          through, stand out, and stir things up.
        </p>
      </section>

      <section
        className={`${styles.frame} ${styles.frameBrands} ${styles.frameWhite}`}
      >
        <article className={styles.frameContent}>
          {items.map((b: BrandItem) => (
            <figure key={b.id} className={styles.frameItem}>
              <div className={styles.frameImg}>
                <Image
                  src={pickBrandThumb(b.image_hover ?? null, false)}
                  alt={b.title ?? "Brand"}
                  width={350}
                  height={350}
                />
              </div>
              <figcaption>
                <Link href={hrefBrand(b)}>{b.title ?? "Untitled"}</Link>
              </figcaption>
            </figure>
          ))}
        </article>
      </section>
    </>
  );
}
