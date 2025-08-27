import type {
  CollectionItem,
  CollectionKind,
  DeviceImage,
  PaginatedResponse,
} from "../types";

const BASE_URL = process.env.API_BASE_URL!;
const API_KEY = process.env.API_KEY!;

export function slugify(input?: string | null): string {
  return (input ?? "")
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- fetch wrappers ----------
export async function apiGet<T>(path: string, revalidate = 3600): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json", "X-API-Key": API_KEY },
    next: { revalidate },
    cache: "force-cache",
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// ---------- collections ----------
const MAP: Record<string, CollectionKind> = {
  festival: "festival",
  community: "community",
  artist: "artist",
  "artist-spotlight": "artist", // alias
  sport: "sport",
  sports: "sport", // alias
};

export function asKind(s: string): CollectionKind | null {
  return MAP[s] ?? null;
}

export async function getCollection(kind: string): Promise<CollectionItem[]> {
  const k = asKind(kind);
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
  const byTitle = list.find((x) => slugify(x.title) === slug);
  return byTitle ?? null;
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

// ---------- images (desktop vs mobile + placeholders) ----------
export const PLACEHOLDER = {
  hero: "/images/placeholders/placeholder-hero.jpg",
  logo: "/images/placeholders/placeholder-logo.png",
  square: "/images/placeholders/placeholder-square.jpg",
  banner: "/images/placeholders/placeholder-banner.jpg",
  thumb: "/images/placeholders/placeholder-thumb.jpg",
};

export function pickImageSrc(
  img?: DeviceImage,
  prefer: "desktop" | "mobile" = "desktop"
): string {
  if (!img) return PLACEHOLDER.square;
  const primary = img[prefer];
  if (primary) return primary!;
  const alt = prefer === "desktop" ? img.mobile : img.desktop;
  if (alt) return alt!;
  if (img.thumbnail) return img.thumbnail!;
  return PLACEHOLDER.square;
}

export const pickHero = (img?: DeviceImage, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop") || PLACEHOLDER.hero;
export const pickLogo = (img?: DeviceImage) =>
  pickImageSrc(img, "desktop") || PLACEHOLDER.logo;
export const pickHover = (img?: DeviceImage) =>
  pickImageSrc(img, "desktop") || PLACEHOLDER.thumb;
export const pickBanner = (img?: DeviceImage, isMobile = false) =>
  pickImageSrc(img, isMobile ? "mobile" : "desktop") || PLACEHOLDER.banner;
