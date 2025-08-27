// src/lib/api.ts
import type {
  CollectionItem,
  CollectionKind,
  DeviceImage,
  PaginatedResponse,
  BrandItem,
  BrandProject,
} from "../types";

/* ===================== ENV ===================== */
const BASE_URL = process.env.API_BASE_URL!;
const API_KEY = process.env.API_KEY!;

/* ===================== Utils ===================== */
export function slugify(input?: string | null): string {
  return (input ?? "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ===================== Fetch wrapper ===================== */
export async function apiGet<T>(path: string, revalidate = 3600): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json", "X-API-Key": API_KEY },
    next: { revalidate },
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* ===================== Collections (4 modules) ===================== */
const MAP: Record<string, CollectionKind> = {
  festival: "festival",
  community: "community",
  artist: "artist",
  "artist-spotlight": "artist", // alias in URL
  sport: "sport",
  sports: "sport", // alias in URL
};

export function asKind(segment: string): CollectionKind | null {
  return MAP[segment] ?? null;
}

export async function getCollection(kind: string): Promise<CollectionItem[]> {
  const k = asKind(kind);
  if (!k) return []; // guard unknown
  try {
    const data = await apiGet<PaginatedResponse<CollectionItem>>(`/${k}`, 3600);
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
  const direct = list.find((x) => (x.slug ?? "") === slug || x.id === slug);
  if (direct) return direct;
  return list.find((x) => slugify(x.title) === slug) ?? null;
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

/* ===================== Images & placeholders ===================== */
export const PLACEHOLDER = {
  hero: "/images/placeholders/placeholder-hero.jpg",
  logo: "/images/placeholders/placeholder-logo.png",
  square: "/images/placeholders/placeholder-square.jpg",
  banner: "/images/placeholders/placeholder-banner.jpg",
  thumb: "/images/placeholders/placeholder-thumb.jpg",
};

// Aliases to keep pages consistent with other modules
export const pickBrandThumb = (img?: DeviceImage | null) =>
  pickImageSrc(img, "desktop", PLACEHOLDER.thumb);

export const pickProjectHero = (img?: DeviceImage | null, isMobile = false) =>
  pickHero(img, isMobile);

export const pickProjectLogo = (img?: DeviceImage | null) => pickLogo(img);

export const pickProjectBanner = (img?: DeviceImage | null, isMobile = false) =>
  pickBanner(img, isMobile);

// return the first available URL from DeviceImage (no placeholder here)
function pickFromDevice(
  img?: DeviceImage | null,
  prefer: "desktop" | "mobile" = "desktop"
): string | null {
  if (!img) return null;
  const primary = img[prefer];
  if (primary) return primary;
  const alt = prefer === "desktop" ? img.mobile : img.desktop;
  if (alt) return alt;
  if (img.thumbnail) return img.thumbnail;
  return null;
}

/**
 * Generic picker with specific placeholder fallback (default = square).
 * Accepts null/undefined.
 */
export function pickImageSrc(
  img?: DeviceImage | null,
  prefer: "desktop" | "mobile" = "desktop",
  placeholder: string = PLACEHOLDER.square
): string {
  return pickFromDevice(img, prefer) ?? placeholder;
}

export const pickHero = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop", PLACEHOLDER.hero);

export const pickLogo = (img?: DeviceImage | null) =>
  pickImageSrc(img, "desktop", PLACEHOLDER.logo);

export const pickHover = (img?: DeviceImage | null) =>
  pickImageSrc(img, "desktop", PLACEHOLDER.thumb);

export const pickBanner = (img?: DeviceImage | null, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop", PLACEHOLDER.banner);

/* ===================== Brands ===================== */
const BRAND_BASE = `/brand`;
const BRAND_DETAIL_BASE = `/brand-detail`;

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
  const res = await apiGet<{ items: BrandItem[] }>(BRAND_BASE, 3600);
  return Array.isArray(res.items) ? res.items : [];
}

export async function getBrandBySlug(slug: string): Promise<BrandItem | null> {
  const list = await getBrands();
  const direct = list.find((b) => (b.slug ?? "") === slug || b.id === slug);
  if (direct) return direct;
  return list.find((b) => slugify(b.title) === slug) ?? null;
}

export async function getBrandProjects(
  brandId: string
): Promise<BrandProject[]> {
  // FE filter jika BE belum support query param
  const res = await apiGet<{ items: BrandProject[] }>(BRAND_DETAIL_BASE, 3600);
  const items = Array.isArray(res.items) ? res.items : [];
  return items.filter((p) => String(p.brand_id) === String(brandId));
}

export async function getProjectBySlug(
  brandId: string,
  slug: string
): Promise<BrandProject | null> {
  const items = await getBrandProjects(brandId);
  const direct = items.find((p) => (p.slug ?? "") === slug || p.id === slug);
  if (direct) return direct;
  return items.find((p) => slugify(p.title) === slug) ?? null;
}

export function orderProjects(items: BrandProject[]) {
  return [...items].sort(
    (a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0)
  );
}
export function prevNextProject(list: BrandProject[], current: BrandProject) {
  const idx = list.findIndex((x) => x.id === current.id);
  if (idx < 0) return null as null;
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  return { prev, next };
}
