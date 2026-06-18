'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, MapPin, Building2, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

type AreaSuggestion = { name: string; slug: string; count: number }
type PropertySuggestion = { title: string; slug: string; type: string; price: string }
type Results = { areas: AreaSuggestion[]; properties: PropertySuggestion[] }

type Operation = 'buy' | 'rent' | 'off-plan'

const TABS: { label: string; value: Operation }[] = [
  { label: 'Buy', value: 'buy' },
  { label: 'Rent', value: 'rent' },
  { label: 'Off-Plan', value: 'off-plan' },
]

export function GlobalSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden lg:flex items-center gap-2.5 py-2 px-4 rounded-full border border-white/20 hover:border-gold/50 bg-white/5 hover:bg-white/10 transition-all duration-200 text-muted hover:text-white/80 text-sm"
      aria-label="Open search"
    >
      <Search size={14} className="text-gold shrink-0" />
      <span className="tracking-wide">Area, development&hellip;</span>
    </button>
  )
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery]           = useState('')
  const [operation, setOperation]   = useState<Operation>('buy')
  const [results, setResults]       = useState<Results>({ areas: [], properties: [] })
  const [loading, setLoading]       = useState(false)
  const [selectedArea, setSelectedArea] = useState<AreaSuggestion | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ areas: [], properties: [] })
      setSelectedArea(null)
    }
  }, [open])

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Debounced fetch
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) {
      setResults({ areas: [], properties: [] })
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(q)}&limit=8`)
        const data = await res.json()
        setResults(data.data ?? { areas: [], properties: [] })
      } catch {
        setResults({ areas: [], properties: [] })
      } finally {
        setLoading(false)
      }
    }, 250)
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setSelectedArea(null)
    fetchSuggestions(val)
  }

  const handleAreaClick = (area: AreaSuggestion) => {
    setSelectedArea(area)
    setQuery(area.name)
    setResults({ areas: [], properties: [] })
  }

  const handlePropertyClick = (slug: string) => {
    onClose()
    router.push(`/properties/${slug}`)
  }

  const handleViewResults = () => {
    onClose()
    const params = new URLSearchParams()
    if (operation !== 'buy') params.set('operation', operation)
    if (selectedArea) params.set('location', selectedArea.slug)
    else if (query.trim()) params.set('q', query.trim())
    router.push(`/properties${params.size ? '?' + params.toString() : ''}`)
  }

  const hasResults = results.areas.length > 0 || results.properties.length > 0
  const totalCount = (selectedArea?.count ?? 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-overlay backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
            className="fixed top-0 left-0 right-0 z-[61] bg-brand border-b border-gold-border shadow-2xl"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-4">
              {/* Operation tabs */}
              <div className="flex items-center gap-1 mb-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setOperation(tab.value)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                      operation === tab.value
                        ? 'bg-gold text-brand'
                        : 'text-muted hover:text-white border border-white/10 hover:border-gold/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto p-2 text-muted hover:text-white transition-colors rounded-full hover:bg-white/5"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search input row */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder="Search area, development or property..."
                    className="w-full bg-brand-section border border-white/10 rounded-sm pl-11 pr-4 py-3.5 text-white placeholder:text-muted/60 text-sm focus:outline-none focus:border-gold/40 transition-colors"
                    autoComplete="off"
                  />
                  {loading && (
                    <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 animate-spin" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleViewResults}
                  className="shrink-0 flex items-center gap-2 px-5 py-3.5 bg-gold hover:bg-gold-light text-brand text-sm font-semibold tracking-wider uppercase rounded-sm transition-colors duration-200"
                >
                  <Search size={14} />
                  {totalCount > 0 ? `${totalCount} Results` : 'Search'}
                </button>
              </div>

              {/* Autocomplete results */}
              <AnimatePresence>
                {hasResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mt-2 bg-brand-section border border-white/10 rounded-sm shadow-xl overflow-hidden"
                  >
                    {results.areas.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-muted/50">
                          Areas
                        </p>
                        {results.areas.map((area) => (
                          <button
                            key={area.slug}
                            type="button"
                            onClick={() => handleAreaClick(area)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                          >
                            <div className="w-7 h-7 rounded-sm bg-gold/10 flex items-center justify-center shrink-0">
                              <MapPin size={12} className="text-gold" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">{area.name}</p>
                            </div>
                            {area.count > 0 && (
                              <span className="text-xs text-muted/60 shrink-0">{area.count} properties</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {results.properties.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-muted/50">
                          Properties
                        </p>
                        {results.properties.map((property) => (
                          <button
                            key={property.slug}
                            type="button"
                            onClick={() => handlePropertyClick(property.slug)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                          >
                            <div className="w-7 h-7 rounded-sm bg-brand flex items-center justify-center shrink-0">
                              <Building2 size={12} className="text-muted" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">{property.title}</p>
                              <p className="text-muted/60 text-xs capitalize">{property.type}</p>
                            </div>
                            <span className="text-xs text-gold shrink-0">{property.price}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
