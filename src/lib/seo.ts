import type { Metadata } from "next";

export const siteConfig = {
  name: "19sixtyfive",
  tagline: "Experiences flipped our way.",
  domain: "19sixtyfive.com.sg",
  url: "https://19sixtyfive.com.sg",
  locale: "en-SG",
  localeOg: "en_SG",
  countryCode: "SG",
  latitude: 1.2704823,
  longitude: 103.798622,
  address: {
    streetAddress: "27 Pasir Panjang Rd",
    addressLocality: "Singapore",
    postalCode: "117537",
    addressCountry: "SG",
  },

  contactEmail: "contact@19sixtyfive.com.sg",
  socials: {
    // instagram: "https://www.instagram.com",
    // facebook: "https://www.facebook.com",
    youtube: "http://www.youtube.com/@19sixtyfivePteLtd",
  },
  defaultOgImage: "/images/logo/logo-white.svg",
};

export const absoluteUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
};

export const defaultMetadata = (overrides: Metadata = {}): Metadata => ({
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "en-SG": siteConfig.url,
      "x-default": siteConfig.url,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.localeOg,
    siteName: siteConfig.name,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.tagline,
    images: [
      {
        url: absoluteUrl(siteConfig.defaultOgImage),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} hero image`,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "geo.region": siteConfig.countryCode,
    "geo.placename": siteConfig.address.addressLocality,
    "geo.position": `${siteConfig.latitude};${siteConfig.longitude}`,
    ICBM: `${siteConfig.latitude}, ${siteConfig.longitude}`,
  },
  ...overrides,
});

type BreadcrumbItem = { name: string; url: string };

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: absoluteUrl("/images/logo/logo.svg"),
  description: siteConfig.tagline,
  sameAs: Object.values(siteConfig.socials).filter(Boolean),
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: siteConfig.contactEmail,
      areaServed: siteConfig.countryCode,
      availableLanguage: "en",
    },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.addressLocality,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.addressCountry,
  },
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: siteConfig.locale,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  })),
});

export const articleJsonLd = ({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
}: {
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  image: image ? [absoluteUrl(image)] : undefined,
  url: absoluteUrl(url),
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/logo/logo.svg"),
    },
  },
  datePublished: datePublished ?? undefined,
  dateModified: dateModified ?? datePublished ?? undefined,
  inLanguage: siteConfig.locale,
  mainEntityOfPage: absoluteUrl(url),
});

export const collectionPageMetadata = (
  params: {
    title: string;
    description?: string;
    path: string;
    image?: string;
  },
  overrides: Metadata = {}
): Metadata => {
  const canonical = absoluteUrl(params.path);
  return {
    title: params.title,
    description: params.description ?? siteConfig.tagline,
    alternates: {
      canonical,
      languages: {
        "en-SG": canonical,
        "x-default": canonical,
      },
    },
    /* Open Graph metadata for rich link previews (e.g. YouTube descriptions). */
    openGraph: {
      type: "website",
      locale: siteConfig.localeOg,
      siteName: siteConfig.name,
      url: canonical,
      title: params.title,
      description: params.description ?? siteConfig.tagline,
      images: params.image
        ? [
            {
              url: absoluteUrl(params.image),
              width: 1200,
              height: 630,
              alt: params.title,
            },
          ]
        : undefined,
    },
    ...overrides,
  } satisfies Metadata;
};

export const webPageJsonLd = ({
  name,
  path,
  description,
}: {
  name: string;
  path: string;
  description?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  url: absoluteUrl(path),
  description,
  inLanguage: siteConfig.locale,
  isPartOf: siteConfig.url,
});

export const itemListJsonLd = (
  name: string,
  items: Array<{ name: string; url: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    name: item.name,
    position: index + 1,
    url: absoluteUrl(item.url),
  })),
});
