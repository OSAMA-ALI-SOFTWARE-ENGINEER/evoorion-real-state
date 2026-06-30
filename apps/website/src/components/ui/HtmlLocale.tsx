'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'

const LOCALE_META: Record<string, { lang: string; dir: 'ltr' | 'rtl' }> = {
  en:    { lang: 'en', dir: 'ltr' },
  de:    { lang: 'de', dir: 'ltr' },
  ar:    { lang: 'ar', dir: 'rtl' },
  'en-gb': { lang: 'en', dir: 'ltr' },
}

export function HtmlLocale() {
  const locale = useLocale()
  const { lang, dir } = LOCALE_META[locale] ?? { lang: 'en', dir: 'ltr' }

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir  = dir
  }, [lang, dir])

  return null
}

