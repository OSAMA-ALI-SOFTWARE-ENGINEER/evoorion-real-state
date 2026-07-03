import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://evoorionrealestate.com'
const API  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const STATIC_PATHS = [
  '', '/properties', '/investments', '/about', '/locations', '/services',
  '/contact', '/blog', '/off-plan', '/sell', '/agents', '/property-management', '/careers',
]

async function fetchSlugs(path: string): Promise<{ slug: string; updated_at?: string }[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    return (json?.data ?? []) as { slug: string; updated_at?: string }[]
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, posts] = await Promise.all([
    fetchSlugs('/properties?per_page=100'),
    fetchSlugs('/blog?per_page=100'),
  ])

  const locales = ['en', 'de', 'ar']
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const p of STATIC_PATHS) {
      entries.push({ url: `${BASE}/${locale}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 })
    }
    for (const prop of properties) {
      entries.push({
        url: `${BASE}/${locale}/properties/${prop.slug}`,
        lastModified: prop.updated_at ? new Date(prop.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
    for (const post of posts) {
      entries.push({ url: `${BASE}/${locale}/blog/${post.slug}`, changeFrequency: 'monthly', priority: 0.5 })
    }
  }

  return entries
}
