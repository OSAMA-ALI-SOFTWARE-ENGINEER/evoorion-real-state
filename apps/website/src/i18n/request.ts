import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

async function fetchTranslationsFromApi(locale: string): Promise<Record<string, unknown> | null> {
  if (!API_URL) return null
  try {
    const res = await fetch(`${API_URL}/settings/public`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const json = await res.json()
    const raw = json?.data?.[`translations_${locale}`]
    if (!raw) return null
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'en' | 'de' | 'ar')) {
    locale = routing.defaultLocale
  }

  const staticMessages = (await import(`../../messages/${locale}.json`)).default
  const apiMessages = await fetchTranslationsFromApi(locale)

  const messages = apiMessages ? deepMerge(staticMessages, apiMessages) : staticMessages

  return { locale, messages }
})

function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base }
  for (const key of Object.keys(override)) {
    const b = base[key]
    const o = override[key]
    if (b && o && typeof b === 'object' && typeof o === 'object' && !Array.isArray(b)) {
      result[key] = deepMerge(b as Record<string, unknown>, o as Record<string, unknown>)
    } else if (o !== null && o !== undefined && o !== '') {
      result[key] = o
    }
  }
  return result
}

