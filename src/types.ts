export type CollectionKind = "festival" | "community" | "artist" | "sport";

export type DeviceImage = {
  desktop?: string | null;
  mobile?: string | null;
  thumbnail?: string | null;
} | null;

export interface CollectionItem {
  id: string;
  title: string | null;
  description: string | null;
  website_link?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  status?: string | null;
  featured?: string | number | null;
  display_order?: string | number | null;

  image_hover?: DeviceImage;
  image_hero?: DeviceImage;
  image_logo?: DeviceImage;
  image_1?: DeviceImage;
  image_2?: DeviceImage;
  image_banner?: DeviceImage;

  image_gallery_1?: DeviceImage;
  image_gallery_2?: DeviceImage;
  image_gallery_3?: DeviceImage;
  image_gallery_4?: DeviceImage;
  image_gallery_5?: DeviceImage;
  image_gallery_6?: DeviceImage;
  image_gallery_7?: DeviceImage;
  image_gallery_8?: DeviceImage;

  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}