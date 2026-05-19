import { MetadataRoute } from 'next';
import { locales } from '@/i18n/request';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mozey.uz';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Add landing page for each locale
  for (const locale of locales) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}`])
        ),
      },
    });
  }

  // Root URL
  entries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1.0,
  });

  return entries;
}
