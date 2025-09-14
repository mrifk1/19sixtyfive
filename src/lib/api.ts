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

export function isMobileDevice(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// Server-side helper to detect mobile from Next.js headers
export async function isMobileFromHeaders(): Promise<boolean> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    return isMobileDevice(userAgent);
  } catch {
    return false;
  }
}

/* ==============================
 * Fetch wrapper (ISR + Tag-based)
 * ============================== */
type GetOpts = { revalidate?: number; tags?: string[]; isMobile?: boolean };

export async function apiGet<T>(path: string, opts: GetOpts = {}): Promise<T> {
  const { revalidate = 3600, tags = [], isMobile = false } = opts; // default 1h
  const isDev = process.env.NODE_ENV !== "production";
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  
  // Add device parameter to query string
  const separator = url.includes('?') ? '&' : '?';
  const deviceParam = isMobile ? `${separator}device=mobile` : `${separator}device=desktop`;
  const finalUrl = `${url}${deviceParam}`;

  const res = await fetch(finalUrl, {
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

export async function getCollection(kind: string, isMobile: boolean = false): Promise<CollectionItem[]> {
  const k = asKind(kind);
  if (!k) return [];
  try {
    const data = await apiGet<PaginatedResponse<CollectionItem>>(`/${k}`, {
      revalidate: 3600,
      tags: ["collections", `collections:${k}`],
      isMobile,
    });
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function getItemBySlug(
  kind: string,
  slug: string,
  isMobile: boolean = false
): Promise<CollectionItem | null> {
  const list = await getCollection(kind, isMobile);
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
 * Image helpers (desktop vs mobile)
 * ============================== */

export function pickImageSrc(
  img?: DeviceImage | null,
  prefer: "desktop" | "mobile" = "desktop"
): string {
  if (!img) return "";
  const primary = img[prefer];
  if (primary) return primary;
  const alt = prefer === "desktop" ? img.mobile : img.desktop;
  if (alt) return alt;
  return img.thumbnail ?? "";
}

export const pickHero = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop");
export const pickLogo = (img?: DeviceImage | null) =>
  pickImageSrc(img, "desktop");
export const pickHover = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop");
export const pickBanner = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop");

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
  brandId: string,
  isMobile: boolean = false
): Promise<BrandProject[]> {
  try {
    // FE filter if BE doesn't support ?brand_id= yet
    const res = await apiGet<{ items: BrandProject[] }>(BRAND_DETAIL_BASE, {
      revalidate: 3600,
      tags: ["brand-projects", `brand:${brandId}`],
      isMobile,
    });
    const items = Array.isArray(res.items) ? res.items : [];
    return items.filter((p) => String(p.brand_id) === String(brandId));
  } catch {
    return [];
  }
}

export async function getProjectBySlug(
  brandId: string,
  slug: string,
  isMobile: boolean = false
): Promise<BrandProject | null> {
  const items = await getBrandProjects(brandId, isMobile);
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
export const pickBrandThumb = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop");
export const pickProjectHero = (img?: DeviceImage | null, isMobile = false) => 
  pickHero(img, isMobile);
export const pickProjectLogo = (img?: DeviceImage | null) => pickLogo(img);
export const pickProjectBanner = (img?: DeviceImage | null, isMobile = false) => 
  pickBanner(img, isMobile);

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

/* ==============================
 * Detail by ID (untuk increment view count)
 * ============================== */

/**
 * Fetch collection item detail by ID
 * Ini akan hit endpoint detail yang increment view count di backend
 */
export async function getCollectionItemById(
  kind: CollectionKind,
  id: string,
  isMobile: boolean = false
): Promise<CollectionItem | null> {
  try {
    const data = await apiGet<CollectionItem>(`/${kind}/${id}`, {
      revalidate: 0, // Always fresh untuk increment view count
      tags: ["collection-detail", `${kind}:${id}`],
      isMobile,
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${kind} detail for ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch brand project detail by ID  
 * Ini akan hit endpoint detail yang increment view count di backend
 */
export async function getBrandProjectById(
  projectId: string,
  isMobile: boolean = false
): Promise<BrandProject | null> {
  try {
    const data = await apiGet<BrandProject>(`${BRAND_DETAIL_BASE}/${projectId}`, {
      revalidate: 0, // Always fresh untuk increment view count
      tags: ["brand-project-detail", `project:${projectId}`],
      isMobile,
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch brand project detail for ID ${projectId}:`, error);
    return null;
  }
}
