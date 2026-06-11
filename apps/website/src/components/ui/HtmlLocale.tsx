'use client'

import { useEffect } from 'react'
import { useCountry } from '@/context/CountryContext'

export function HtmlLocale() {
  const { lang, dir } = useCountry()

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir  = dir
  }, [lang, dir])

  return null
}
