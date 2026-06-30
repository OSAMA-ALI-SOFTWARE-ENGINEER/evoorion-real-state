'use client'

import { useLocale } from 'next-intl'

// Maps next-intl locale → API region code.
// Returns undefined when no specific region is active (show all content).
const LOCALE_REGION: Record<string, string> = {
  de:      'germany',
  'en-gb': 'uk',
  ar:      'saudi',
  // 'en' (default) → undefined so UAE content shows alongside global
}

export function useRegion(): string | undefined {
  const locale = useLocale()
  return LOCALE_REGION[locale]
}
