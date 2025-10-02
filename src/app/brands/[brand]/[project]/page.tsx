import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../../Brands.module.scss";
import {
  getBrandBySlug,
  getBrandProjects,
  getProjectBySlug,
  getBrandProjectById,
  orderProjects,
  prevNextProject,
  pickProjectHero,
  pickProjectLogo,
  pickProjectBanner,
  pickImageSrc,
  hrefProject,
  isMobileFromHeaders,
} from "@/lib/api";
import { notFound } from "next/navigation";
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
  params: Promise<{ brand: string; project: string }>;
}): Promise<Metadata> {
  const { brand: brandParam, project: projectParam } = await params;
  const brand = await getBrandBySlug(brandParam);
  if (!brand) return { title: "Not Found" };
  
  // Detect mobile for metadata as well
  const isMobile = await isMobileFromHeaders();
  const proj = await getProjectBySlug(brand.id, projectParam, isMobile);
  const title = proj?.title ?? "Untitled";
  const descriptionHtml = proj?.description ?? null;
  const description = descriptionHtml
    ? descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : `${title} — a ${siteConfig.name} collaboration`;
  const canonical = absoluteUrl(`/brands/${brandParam}/${projectParam}`);
  const hero = pickProjectHero(proj?.image_hero ?? null, isMobile);
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
      images: hero
        ? [
            {
              url: hero,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
  } satisfies Metadata;
}

type GalleryItem = { key: number; src: string };

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ brand: string; project: string }>;
}) {
  const { brand: brandParam, project: projectParam } = await params;
  const brand = await getBrandBySlug(brandParam);
  if (!brand) return notFound();

  // Detect mobile from request headers  
  const isMobile = await isMobileFromHeaders();

  const [list, proj] = await Promise.all([
    getBrandProjects(brand.id, isMobile),
    getProjectBySlug(brand.id, projectParam, isMobile),
  ]);
  if (!proj) return notFound();

  // Fetch detail by ID to increment the view count in the backend
  // We still use the project from getProjectBySlug as a fallback,
  // but try fetching the detail by ID to update the view count
  let detailProj = proj;
  try {
    const fetchedDetail = await getBrandProjectById(proj.id, isMobile);
    if (fetchedDetail) {
      detailProj = fetchedDetail;
    }
  } catch (error) {
    // If fetching detail fails, continue using the original project
    console.error('Failed to fetch project detail by ID, using original proj:', error);
  }

  const ordered = orderProjects(list);
  const pn = prevNextProject(ordered, proj);

  const hero = pickProjectHero(detailProj.image_hero ?? null, isMobile);
  const logo = pickProjectLogo(detailProj.image_logo ?? null);
  const img1 = pickImageSrc(detailProj.image_1 ?? null, isMobile ? "mobile" : "desktop");
  const img2 = pickImageSrc(detailProj.image_2 ?? null, isMobile ? "mobile" : "desktop");
  const banner = pickProjectBanner(detailProj.image_banner ?? null, isMobile);

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

  const gallery: GalleryItem[] = galleryKeys
    .map((k, i) => {
      const img = detailProj[k];
      return img ? { key: i, src: pickImageSrc(img, isMobile ? "mobile" : "desktop") } : null;
    })
    .filter(Boolean) as GalleryItem[];

  const rows = chunk(gallery, 4);

  const descriptionText = detailProj.description
    ? detailProj.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : siteConfig.tagline;

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Brands", url: "/brands" },
      { name: brand.title ?? "Brand", url: `/brands/${brandParam}` },
      { name: detailProj.title ?? "Project", url: `/brands/${brandParam}/${projectParam}` },
    ]),
    articleJsonLd({
      title: detailProj.title ?? "Untitled",
      description: descriptionText,
      url: `/brands/${brandParam}/${projectParam}`,
      image: hero,
    }),
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      {/* ===== Hero (match file kedua) ===== */}
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
                href={hrefProject(brand, pn.prev)}
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
                href={hrefProject(brand, pn.next)}
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
          {detailProj.website_link && (
            <a
              href={detailProj.website_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit website
            </a>
          )}
        </div>
      </section>

      {/* ===== Content ===== */}
      <section className={styles.contentSection}>
        <h1 className={styles.detailsTitle}>{detailProj.title ?? "Untitled"}</h1>
        {detailProj.description ? (
          <p dangerouslySetInnerHTML={{ __html: detailProj.description }} />
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

      {/* ===== Banner ===== */}
      <section
        className={styles.bannerSection}
        style={{ backgroundImage: `url(${banner})` }}
      />

      {/* ===== Gallery (4 per row, same sizing rule) ===== */}
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

      {/* ===== Article Nav (same pattern) ===== */}
      {pn ? (
        <div className={styles.articleNav}>
          <div className={`${styles.articleNavItem} ${styles.left}`}>
            <Link href={hrefProject(brand, pn.prev)}>
              {pn.prev.title ?? "Previous"}
            </Link>
          </div>
          <p>|</p>
          <div className={`${styles.articleNavItem} ${styles.right}`}>
            <Link href={hrefProject(brand, pn.next)}>
              {pn.next.title ?? "Next"}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
