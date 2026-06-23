'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const LOCALES = [
  { code: 'en', label: 'EN', flag: '🇦🇪', name: 'English' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'ar', label: 'AR', flag: '🇸🇦', name: 'العربية' },
] as const

export function LanguageSwitcher() {
  const locale   = useLocale()
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchTo = (code: string) => {
    setOpen(false)
    // Strip current locale prefix and add new one
    let path = pathname
    for (const l of LOCALES) {
      if (path.startsWith(`/${l.code}/`)) { path = path.slice(l.code.length + 1); break }
      if (path === `/${l.code}`) { path = '/'; break }
    }
    // For 'en' (default, no prefix with localePrefix: 'as-needed')
    const newPath = code === 'en' ? path || '/' : `/${code}${path.startsWith('/') ? path : '/' + path}`
    router.push(newPath)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-full border border-white/10 hover:border-gold/30 text-muted hover:text-white transition-all duration-200 text-xs font-semibold tracking-wider"
        aria-label="Switch language"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown size={10} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-36 bg-brand-section border border-gold-border rounded-sm shadow-xl overflow-hidden z-50"
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => switchTo(l.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                  l.code === locale
                    ? 'text-gold bg-gold/5'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <div className="text-left">
                  <p className="font-semibold tracking-wider">{l.label}</p>
                  <p className="text-[10px] text-muted/60">{l.name}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
