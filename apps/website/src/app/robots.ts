import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://evoorionrealestate.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/favorites', '/compare', '/auth/'] }],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
