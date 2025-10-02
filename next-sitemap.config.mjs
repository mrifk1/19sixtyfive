import 'dotenv/config';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  process.env.SITE_URL?.replace(/\/$/, '') ||
  'https://19sixtyfive.com.sg';

const createAbsolute = (path = '/') =>
  `${siteUrl}${path === '/' ? '' : path.startsWith('/') ? path : `/${path}`}`;

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 3000,
  changefreq: 'weekly',
  priority: 0.7,
  autoLastmod: true,
  exclude: ['/api/health', '/metrics', '/og', '/api/*'],
  transform: async (cfg, path) => {
    const loc = createAbsolute(path);
    return {
      loc,
      changefreq: cfg.changefreq,
      priority: cfg.priority,
      lastmod: cfg.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        { hreflang: 'en-SG', href: loc },
        { hreflang: 'x-default', href: loc },
      ],
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [createAbsolute('/sitemap.xml')],
  },
};

export default config;
