'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useCountry, type Country } from '@/context/CountryContext'
import { ChevronDown, Loader2, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const LOCALES = [
  { code: 'en', label: 'EN', flag: '🇦🇪', name: 'English' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'ar', label: 'AR', flag: '🇸🇦', name: 'العربية' },
] as const

type LocaleCode = typeof LOCALES[number]['code']

export function LocaleSelector() {
  const locale   = useLocale()
  const pathname = usePathname()
  const router   = useRouter()
  const { country, countries, setCountry } = useCountry()

  const [open, setOpen]             = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchLocale = (code: LocaleCode) => {
    if (code === locale) return
    startTransition(() => { router.replace(pathname, { locale: code }) })
    setOpen(false)
  }

  const switchCountry = (c: Country) => {
    setCountry(c)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-label="Language and region"
        className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-full border border-white/10 hover:border-gold/30 text-muted hover:text-white transition-all duration-200 text-xs font-semibold tracking-wider disabled:opacity-60"
      >
        {isPending
          ? <Loader2 size={12} className="animate-spin text-gold" />
          : <span>{currentLocale.flag}</span>
        }
        <span>{currentLocale.label}</span>
        <span className="text-white/20 hidden sm:inline">·</span>
        <span className="hidden sm:inline">{country.flag}</span>
        <span className="hidden sm:inline text-white/50 text-[10px]">{country.symbol}</span>
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-brand-section border border-gold-border rounded-sm shadow-2xl z-50 overflow-hidden"
          >
            {/* Language */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] text-gold/50 tracking-[0.2em] uppercase font-medium">Language</p>
            </div>
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => switchLocale(l.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                  l.code === locale
                    ? 'text-gold bg-gold/5'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold tracking-wider">{l.label}</p>
                  <p className="text-[10px] text-muted/60 mt-0.5">{l.name}</p>
                </div>
                {l.code === locale && <Check size={11} className="text-gold shrink-0" />}
              </button>
            ))}

            <div className="mx-3 my-2 border-t border-white/10" />

            {/* Region */}
            <div className="px-3 pb-1">
              <p className="text-[10px] text-gold/50 tracking-[0.2em] uppercase font-medium">Region & Currency</p>
            </div>
            <div className="max-h-52 overflow-y-auto pb-2">
              {countries.map((c) => {
                const active = c.code === country.code
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => switchCountry(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors border-t border-white/5 first:border-0 ${
                      active
                        ? 'bg-gold/10 text-gold'
                        : 'text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base leading-none shrink-0">{c.flag}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate">{c.country_name}</p>
                      <p className="text-[10px] text-muted/70 mt-0.5">{c.symbol} · {c.name}</p>
                    </div>
                    {active && <Check size={11} className="text-gold shrink-0" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
