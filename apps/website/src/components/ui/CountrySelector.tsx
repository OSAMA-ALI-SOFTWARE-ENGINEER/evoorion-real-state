'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useCountry, type Country } from '@/context/CountryContext'

export function CountrySelector() {
  const { country, countries, setCountry } = useCountry()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(c: Country) {
    setCountry(c)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-border/60 hover:border-gold/50 text-white/80 hover:text-white text-sm transition-colors duration-200"
        aria-label="Select country / currency"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="hidden sm:inline text-xs font-medium tracking-wide">{country.code}</span>
        <ChevronDown size={11} className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 bg-brand-section border border-gold-border rounded-sm shadow-2xl overflow-hidden min-w-[200px] max-h-80 overflow-y-auto"
          >
            {countries.map(c => {
              const active = c.code === country.code
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => select(c)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors border-b border-white/5 last:border-0 ${
                    active
                      ? 'bg-gold/10 text-gold'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg leading-none shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-medium truncate">{c.country_name}</span>
                    <span className="block text-[10px] text-muted/70 mt-0.5">{c.symbol} · {c.name}</span>
                  </div>
                  {active && <span className="text-gold text-xs shrink-0">✓</span>}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
