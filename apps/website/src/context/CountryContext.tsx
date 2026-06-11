'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getTranslations, type Lang, type TranslationKey } from '@/lib/translations'

// ── Types ────────────────────────────────────────────────────────────────────

export interface CurrencyRecord {
  id:            number
  code:          string
  name:          string
  symbol:        string
  exchange_rate: number
  is_active:     boolean
  is_default:    boolean
  sort_order:    number
}

interface CountryMeta {
  flag:         string
  country_name: string
  language:     Lang
  dir:          'ltr' | 'rtl'
}

export interface Country extends CurrencyRecord, CountryMeta {}

// ── Static metadata keyed by currency code ───────────────────────────────────

const COUNTRY_META: Record<string, CountryMeta> = {
  AED: { flag: '🇦🇪', country_name: 'UAE',          language: 'en', dir: 'ltr' },
  USD: { flag: '🇺🇸', country_name: 'USA',          language: 'en', dir: 'ltr' },
  EUR: { flag: '🇪🇺', country_name: 'Europe',       language: 'en', dir: 'ltr' },
  GBP: { flag: '🇬🇧', country_name: 'UK',           language: 'en', dir: 'ltr' },
  SAR: { flag: '🇸🇦', country_name: 'Saudi Arabia', language: 'ar', dir: 'rtl' },
  INR: { flag: '🇮🇳', country_name: 'India',        language: 'en', dir: 'ltr' },
  RUB: { flag: '🇷🇺', country_name: 'Russia',       language: 'en', dir: 'ltr' },
  CNY: { flag: '🇨🇳', country_name: 'China',        language: 'en', dir: 'ltr' },
  CHF: { flag: '🇨🇭', country_name: 'Switzerland',  language: 'en', dir: 'ltr' },
  CAD: { flag: '🇨🇦', country_name: 'Canada',       language: 'en', dir: 'ltr' },
  AUD: { flag: '🇦🇺', country_name: 'Australia',    language: 'en', dir: 'ltr' },
  QAR: { flag: '🇶🇦', country_name: 'Qatar',        language: 'ar', dir: 'rtl' },
  KWD: { flag: '🇰🇼', country_name: 'Kuwait',       language: 'ar', dir: 'rtl' },
}

const AED_FALLBACK: Country = {
  id: 1, code: 'AED', name: 'UAE Dirham', symbol: 'AED',
  exchange_rate: 1, is_active: true, is_default: true, sort_order: 1,
  ...COUNTRY_META.AED,
}

const LS_KEY = 'ev_country'

// ── Context ──────────────────────────────────────────────────────────────────

interface CountryContextValue {
  country:     Country
  countries:   Country[]
  setCountry:  (c: Country) => void
  formatPrice: (aedAmount: number | string) => string
  t:           (key: TranslationKey) => string
  lang:        Lang
  dir:         'ltr' | 'rtl'
}

const CountryContext = createContext<CountryContextValue>({
  country:    AED_FALLBACK,
  countries:  [AED_FALLBACK],
  setCountry: () => {},
  formatPrice: (a) => `AED ${Number(a).toLocaleString()}`,
  t:          (k) => k,
  lang:       'en',
  dir:        'ltr',
})

// ── Provider ─────────────────────────────────────────────────────────────────

export function CountryProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([AED_FALLBACK])
  const [country,   setCountryState] = useState<Country>(AED_FALLBACK)

  // Load currencies from API, merge with static metadata
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    fetch(`${api}/currencies`)
      .then(r => r.json())
      .then((json: { data: CurrencyRecord[] }) => {
        const active = (json.data ?? [])
          .filter(c => c.is_active)
          .map(c => ({ ...c, ...(COUNTRY_META[c.code] ?? COUNTRY_META.AED) }))
          .sort((a, b) => a.sort_order - b.sort_order)
        if (active.length) setCountries(active)

        // Restore saved preference
        try {
          const saved = localStorage.getItem(LS_KEY)
          if (saved) {
            const parsed = JSON.parse(saved) as { code: string }
            const match = active.find(c => c.code === parsed.code)
            if (match) { setCountryState(match); return }
          }
        } catch { /* ignore */ }

        // Default to whichever currency is_default
        const def = active.find(c => c.is_default) ?? active[0]
        if (def) setCountryState(def)
      })
      .catch(() => {})
  }, [])

  const setCountry = useCallback((c: Country) => {
    setCountryState(c)
    try { localStorage.setItem(LS_KEY, JSON.stringify({ code: c.code })) } catch { /* ignore */ }
  }, [])

  const formatPrice = useCallback((aedAmount: number | string): string => {
    const aed = parseFloat(String(aedAmount))
    if (isNaN(aed)) return '—'
    const converted = aed * country.exchange_rate
    const sym = country.symbol
    const isNonAbbrev = ['AED', 'SAR', 'QAR', 'KWD', 'CHF', 'CAD', 'CA$', 'A$'].includes(sym)
    // Format with M/K abbreviations
    let formatted: string
    if (converted >= 1_000_000)      formatted = `${(converted / 1_000_000).toFixed(2)}M`
    else if (converted >= 100_000)   formatted = `${(converted / 1_000).toFixed(0)}K`
    else if (converted >= 1_000)     formatted = `${(converted / 1_000).toFixed(1)}K`
    else                             formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 0 })
    return isNonAbbrev ? `${sym} ${formatted}` : `${sym}${formatted}`
  }, [country])

  const lang = country.language
  const dir  = country.dir
  const t    = useCallback((key: TranslationKey) => getTranslations(lang)[key] ?? key, [lang])

  return (
    <CountryContext.Provider value={{ country, countries, setCountry, formatPrice, t, lang, dir }}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  return useContext(CountryContext)
}
