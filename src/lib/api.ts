// src/lib/api.ts
import type {
  CollectionItem,
  CollectionKind,
  DeviceImage,
  PaginatedResponse,
  BrandItem,
  BrandProject,
  NewsItem,
} from "@/types";

/**
 * Env
 * - API_BASE_URL=https://wp.19sixtyfive.com.sg/wp-json/custom/v1
 * - API_KEY=xxxxx
 */
const BASE_URL = process.env.API_BASE_URL!;
const API_KEY = process.env.API_KEY!;

/* ==============================
 * Utils
 * ============================== */
export function slugify(input?: string | null): string {
  return (input ?? "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ==============================
 * Fetch wrapper (ISR + Tag-based)
 * ============================== */
type GetOpts = { revalidate?: number; tags?: string[] };

export async function apiGet<T>(path: string, opts: GetOpts = {}): Promise<T> {
  const { revalidate = 3600, tags = [] } = opts; // default 1h
  const isDev = process.env.NODE_ENV !== "production";
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", "X-API-Key": API_KEY },
    // Dev: always fresh; Prod: ISR + Tags
    next: isDev ? { revalidate: 0 } : { revalidate, tags },
    cache: isDev ? "no-store" : "force-cache",
  });

  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/* ==============================
 * Collections (festival/community/artist/sport)
 * ============================== */
const KIND_MAP: Record<string, CollectionKind> = {
  festival: "festival",
  community: "community",
  artist: "artist",
  "artist-spotlight": "artist", // alias
  sport: "sport",
  sports: "sport", // alias
};

export function asKind(s: string): CollectionKind | null {
  return KIND_MAP[s] ?? null;
}

export async function getCollection(kind: string): Promise<CollectionItem[]> {
  const k = asKind(kind);
  if (!k) return [];
  try {
    const data = await apiGet<PaginatedResponse<CollectionItem>>(`/${k}`, {
      revalidate: 3600,
      tags: ["collections", `collections:${k}`],
    });
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function getItemBySlug(
  kind: string,
  slug: string
): Promise<CollectionItem | null> {
  const list = await getCollection(kind);
  const bySlug =
    list.find((x) => (x.slug ?? "") === slug || x.id === slug) ??
    list.find((x) => slugify(x.title) === slug);
  return bySlug ?? null;
}

export function orderByDisplay(items: CollectionItem[]): CollectionItem[] {
  return [...items].sort((a, b) => {
    const av = Number(a.display_order ?? Number.MAX_SAFE_INTEGER);
    const bv = Number(b.display_order ?? Number.MAX_SAFE_INTEGER);
    if (av !== bv) return av - bv;
    return (a.title ?? "").localeCompare(b.title ?? "");
  });
}

export function prevNext(items: CollectionItem[], current: CollectionItem) {
  if (!items.length) return null;
  const key = (x: CollectionItem) => x.slug ?? x.id;
  const idx = items.findIndex((x) => key(x) === key(current));
  if (idx < 0) return null;
  return {
    prev: items[(idx - 1 + items.length) % items.length],
    next: items[(idx + 1) % items.length],
  };
}

export function hrefOf(kind: string, it: CollectionItem) {
  const s = it.slug || slugify(it.title) || it.id;
  return `/${kind}/${encodeURIComponent(String(s))}`;
}

/* ==============================
 * Image helpers (desktop vs mobile + placeholders)
 * ============================== */
/** All placeholders are directed to one file to avoid 404 errors. */
const FALLBACK = "/images/placeholders/placeholder.png";
export const PLACEHOLDER = {
  hero: FALLBACK,
  logo: FALLBACK,
  square: FALLBACK,
  banner: FALLBACK,
  thumb: FALLBACK,
};

export function pickImageSrc(
  img?: DeviceImage | null,
  prefer: "desktop" | "mobile" = "desktop"
): string {
  if (!img) return PLACEHOLDER.square;
  const primary = img[prefer];
  if (primary) return primary;
  const alt = prefer === "desktop" ? img.mobile : img.desktop;
  if (alt) return alt;
  return img.thumbnail ?? PLACEHOLDER.square;
}

export const pickHero = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop") || PLACEHOLDER.hero;
export const pickLogo = (img?: DeviceImage | null) =>
  pickImageSrc(img, "desktop") || PLACEHOLDER.logo;
export const pickHover = (img?: DeviceImage | null) =>
  pickImageSrc(img, "desktop") || PLACEHOLDER.thumb;
export const pickBanner = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop") || PLACEHOLDER.banner;

/* ==============================
 * Brands (+ projects)
 * ============================== */
const BRAND_BASE = "/brand";
const BRAND_DETAIL_BASE = "/brand-detail";

export function hrefBrand(b: BrandItem) {
  const s = b.slug || slugify(b.title) || b.id;
  return `/brands/${encodeURIComponent(String(s))}`;
}

export function hrefProject(b: BrandItem, p: BrandProject) {
  const bs = b.slug || slugify(b.title) || b.id;
  const ps = p.slug || slugify(p.title) || p.id;
  return `/brands/${encodeURIComponent(String(bs))}/${encodeURIComponent(
    String(ps)
  )}`;
}

export async function getBrands(): Promise<BrandItem[]> {
  try {
    const res = await apiGet<{ items: BrandItem[] }>(BRAND_BASE, {
      revalidate: 3600,
      tags: ["brands"],
    });
    return Array.isArray(res.items) ? res.items : [];
  } catch {
    return [];
  }
}

export async function getBrandBySlug(slug: string): Promise<BrandItem | null> {
  const list = await getBrands();
  const direct =
    list.find((b) => (b.slug ?? "") === slug || b.id === slug) ??
    list.find((b) => slugify(b.title) === slug);
  return direct ?? null;
}

export async function getBrandProjects(
  brandId: string
): Promise<BrandProject[]> {
  try {
    // FE filter if BE doesn't support ?brand_id= yet
    const res = await apiGet<{ items: BrandProject[] }>(BRAND_DETAIL_BASE, {
      revalidate: 3600,
      tags: ["brand-projects", `brand:${brandId}`],
    });
    const items = Array.isArray(res.items) ? res.items : [];
    return items.filter((p) => String(p.brand_id) === String(brandId));
  } catch {
    return [];
  }
}

export async function getProjectBySlug(
  brandId: string,
  slug: string
): Promise<BrandProject | null> {
  const items = await getBrandProjects(brandId);
  const direct =
    items.find((p) => (p.slug ?? "") === slug || p.id === slug) ??
    items.find((p) => slugify(p.title) === slug);
  return direct ?? null;
}

export function orderProjects(items: BrandProject[]) {
  return [...items].sort(
    (a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0)
  );
}

export function prevNextProject(list: BrandProject[], current: BrandProject) {
  const idx = list.findIndex((x) => x.id === current.id);
  if (idx < 0) return null;
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  return { prev, next };
}

// Brand image pickers
export const pickBrandThumb = (img?: DeviceImage | null) =>
  pickImageSrc(img, "desktop");
export const pickProjectHero = (img?: DeviceImage | null) => pickHero(img);
export const pickProjectLogo = (img?: DeviceImage | null) => pickLogo(img);
export const pickProjectBanner = (img?: DeviceImage | null) => pickBanner(img);

/* ==============================
 * News (list only, no detail)
 * ============================== */
export async function getNews(): Promise<NewsItem[]> {
  try {
    const res = await apiGet<{ items: NewsItem[] }>("/news", {
      revalidate: 3600,
      tags: ["news"],
    });
    return Array.isArray(res.items) ? res.items : [];
  } catch {
    return [];
  }
}

export function buildNewsFilters(items: NewsItem[]) {
  // Group by category_slug (fallback "all")
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const it of items) {
    const slug = (it.category_slug ?? "all").toLowerCase();
    const name = it.category_name ?? (slug === "all" ? "All" : slug);
    if (!map.has(slug)) map.set(slug, { slug, name, count: 0 });
    map.get(slug)!.count++;
  }
  // Ensure "all" exists with full count
  const total = items.length;
  map.set("all", { slug: "all", name: "All", count: total });
  return Array.from(map.values()).sort((a, b) =>
    a.slug === "all" ? -1 : b.slug === "all" ? 1 : a.name.localeCompare(b.name)
  );
}
