import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL ?? '';
const isProd = SITE_URL === 'https://moimi.inuappcenter.kr';

export default function robots(): MetadataRoute.Robots {
  if (!isProd) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: {
      userAgent: '*',
      allow: ['/$', '/sitemap.xml', '/google*.html', '/naver*.html'],
      disallow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
