import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../Brands.module.scss";

import {
  getBrandBySlug,
  getBrandProjects,
  pickBrandThumb,
  hrefProject,
} from "@/lib/api";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { brand: string };
}): Promise<Metadata> {
  const brand = await getBrandBySlug(params.brand);
  if (!brand) return { title: "Not Found" };
  const title = brand.title ?? "Untitled";
  return {
    title: `${title} | 19sixtyfive`,
    alternates: { canonical: `/brands/${params.brand}` },
  };
}

export default async function BrandDetailPage({
  params,
}: {
  params: { brand: string };
}) {
  const brand = await getBrandBySlug(params.brand);
  if (!brand) return notFound();

  const projects = await getBrandProjects(brand.id);

  return (
    <>
      <section className={styles.brandHero}>
        <h1 className={styles.brandTitle}>{brand.title ?? "Untitled"}</h1>
        {brand.excerpt ? <p>{brand.excerpt}</p> : null}
      </section>

      <section className={styles.projects}>
        {projects.map((p) => (
          <article key={p.id} className={styles.projectRow}>
            <div className={styles.thumb}>
              <Image
                src={pickBrandThumb(p.image_hover ?? null)}
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
