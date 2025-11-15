import type { MetadataRoute } from "next";
import {
  getCollection,
  getBrands,
  getBrandProjects,
  getNews,
} from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://19sixtyfive.com.sg";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/festivals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/artist`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sports`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/brands`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    // Fetch all collections items
    const [festivals, community, artist, sports] = await Promise.all([
      getCollection("festivals", false).catch(() => []),
      getCollection("community", false).catch(() => []),
      getCollection("artist", false).catch(() => []),
      getCollection("sports", false).catch(() => []),
    ]);

    const collectionRoutes: MetadataRoute.Sitemap = [
      ...festivals.map((item) => ({
        url: `${SITE_URL}/festivals/${item.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...community.map((item) => ({
        url: `${SITE_URL}/community/${item.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...artist.map((item) => ({
        url: `${SITE_URL}/artist/${item.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...sports.map((item) => ({
        url: `${SITE_URL}/sports/${item.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ];

    // Fetch all brands and their projects
    const brands = await getBrands().catch(() => []);
    const brandProjectsPromises = brands.map((brand) =>
      getBrandProjects(brand.id, false).catch(() => [])
    );
    const brandProjectsArrays = await Promise.all(brandProjectsPromises);

    const brandRoutes: MetadataRoute.Sitemap = [];
    brands.forEach((brand, index) => {
      const projects = brandProjectsArrays[index];
      projects.forEach((project) => {
        brandRoutes.push({
          url: `${SITE_URL}/brands/${brand.slug}/${project.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    });

    // Fetch news items
    const news = await getNews().catch(() => []);
    const newsRoutes: MetadataRoute.Sitemap = news.map((item) => ({
      url: `${SITE_URL}/news/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...baseRoutes, ...collectionRoutes, ...brandRoutes, ...newsRoutes];
  } catch {
    return baseRoutes;
  }
}
