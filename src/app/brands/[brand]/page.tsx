import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../Brands.module.scss";

import {
  getBrandBySlug,
  getBrandProjects,
  pickBrandThumb,
  pickBanner,
  hrefProject,
  isMobileFromHeaders,
} from "@/lib/api";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: brandParam } = await params;
  const brand = await getBrandBySlug(brandParam);
  if (!brand) return { title: "Not Found" };
  const title = brand.title ?? "Untitled";
  return {
    title: `${title} | 19sixtyfive`,
    alternates: { canonical: `/brands/${brandParam}` },
  };
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandParam } = await params;
  const brand = await getBrandBySlug(brandParam);
  if (!brand) return notFound();

  // Detect mobile from request headers
  const isMobile = await isMobileFromHeaders();
  const projects = await getBrandProjects(brand.id, isMobile);

  const hero = pickBanner(brand.image_banner, isMobile);

  return (
    <>
      <section
        className={styles.heroSection}
        style={{ backgroundImage: `url(${hero})` }}
      >
        <div className={styles.heroFooter}>
          <h1>{brand.title ?? "Untitled"}</h1>
        </div>
      </section>

      {/* LIST PROJECTS */}
      <section className={styles.projects}>
        {brand.excerpt ? <p>{brand.excerpt}</p> : null}
        {projects.map((p) => (
          <article key={p.id} className={styles.projectRow}>
            <div className={styles.thumb}>
              <Image
                src={pickBrandThumb(p.image_event, isMobile)}
                alt={p.title ?? "Project"}
                width={360}
                height={360}
              />
            </div>
            <div className={styles.info}>
              <h2>{p.title ?? "Untitled"}</h2>
              <Link className="cta" href={hrefProject(brand, p)}>
                View more
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
