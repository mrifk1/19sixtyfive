import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../../Brands.module.scss";

import {
  getBrandBySlug,
  getBrandProjects,
  getProjectBySlug,
  orderProjects,
  prevNextProject,
  pickProjectHero,
  pickProjectLogo,
  pickProjectBanner,
  pickImageSrc,
  hrefProject,
} from "@/lib/api";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { brand: string; project: string };
}): Promise<Metadata> {
  const brand = await getBrandBySlug(params.brand);
  if (!brand) return { title: "Not Found" };
  const proj = await getProjectBySlug(brand.id, params.project);
  const title = proj?.title ?? "Untitled";
  return {
    title: `${title} | 19sixtyfive`,
    alternates: { canonical: `/brands/${params.brand}/${params.project}` },
    openGraph: {
      title,
      images: [{ url: pickProjectHero(proj?.image_hero ?? null) }],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { brand: string; project: string };
}) {
  const brand = await getBrandBySlug(params.brand);
  if (!brand) return notFound();

  const [projects, current] = await Promise.all([
    getBrandProjects(brand.id),
    getProjectBySlug(brand.id, params.project),
  ]);
  if (!current) return notFound();

  const ordered = orderProjects(projects);
  const pn = prevNextProject(ordered, current);

  const hero = pickProjectHero(current.image_hero ?? null);
  const logo = pickProjectLogo(current.image_logo ?? null);
  const img1 = pickImageSrc(current.image_1 ?? null, "desktop");
  const img2 = pickImageSrc(current.image_2 ?? null, "desktop");
  const banner = pickProjectBanner(current.image_banner ?? null);

  // ---- FIX: strict-safe gallery indexing ----
  const galleryKeys = [
    "image_gallery_1",
    "image_gallery_2",
    "image_gallery_3",
    "image_gallery_4",
    "image_gallery_5",
    "image_gallery_6",
    "image_gallery_7",
    "image_gallery_8",
  ] as const;
  type GalleryKey = (typeof galleryKeys)[number];

  const gallery = galleryKeys
    .map((k, i) => {
      const img = current[k as GalleryKey];
      return img ? { key: i, src: pickImageSrc(img, "desktop") } : null;
    })
    .filter(Boolean) as { key: number; src: string }[];

  return (
    <>
      <section
        className={styles.heroSection}
        style={{ backgroundImage: `url(${hero})` }}
      >
        <div className={styles.heroFooter}>
          <Image
            className="hero-logo"
            src={logo}
            alt="Logo"
            width={180}
            height={90}
          />
          {current.website_link && (
            <a
              href={current.website_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit website
            </a>
          )}
        </div>
      </section>

      <section className={styles.content}>
        <h1 className={styles.detailsTitle}>{current.title ?? "Untitled"}</h1>
        {current.description ? <p>{current.description}</p> : null}
        <div className="images">
          <Image src={img1} alt="Secondary 1" width={400} height={400} />
          <Image src={img2} alt="Secondary 2" width={400} height={400} />
        </div>
      </section>

      <section
        className={styles.banner}
        style={{ backgroundImage: `url(${banner})` }}
      />

      {gallery.length ? (
        <section className={styles.gallery}>
          {gallery.map((g) => (
            <Image
              key={g.key}
              src={g.src}
              alt={`Gallery ${g.key + 1}`}
              width={300}
              height={300}
            />
          ))}
        </section>
      ) : null}

      {pn ? (
        <div className={styles.articleNav}>
          <Link href={hrefProject(brand, pn.prev)}>
            {pn.prev.title ?? "Previous"}
          </Link>
          <p>|</p>
          <Link href={hrefProject(brand, pn.next)}>
            {pn.next.title ?? "Next"}
          </Link>
        </div>
      ) : null}
    </>
  );
}