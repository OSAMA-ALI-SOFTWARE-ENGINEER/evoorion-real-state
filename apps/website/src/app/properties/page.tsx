'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getProperties } from '@/lib/api'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { PropertySummary, PropertyType } from '@/types'

const TYPES: { label: string; value: '' | PropertyType }[] = [
  { label: 'All', value: '' },
  { label: 'Villa', value: 'villa' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Commercial', value: 'commercial' },
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<'' | PropertyType>('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getProperties({
        type: activeType || undefined,
        search: debouncedSearch || undefined,
        page,
        per_page: 9,
      })
      setProperties(res.data)
      setTotalPages(res.meta.pagination.last_page)
    } catch {
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [activeType, debouncedSearch, page])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [activeType, debouncedSearch])

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Portfolio</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-4">
            Our Properties
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Handpicked luxury residences across Dubai&apos;s most prestigious communities.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-30 bg-brand/95 backdrop-blur-md border-b border-gold-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Type pills */}
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveType(t.value)}
                  className={`px-4 py-2 text-xs tracking-widest uppercase rounded-sm transition-all duration-200 ${
                    activeType === t.value
                      ? 'bg-gold text-brand font-semibold'
                      : 'border border-white/10 text-muted hover:border-gold/40 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search properties…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 focus:border-gold text-white text-sm placeholder-muted outline-none rounded-sm transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-brand min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24">
              <SlidersHorizontal size={40} className="text-gold/30 mx-auto mb-4" />
              <p className="text-muted text-lg mb-2">No properties found</p>
              <p className="text-muted/60 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                layout
              >
                {properties.map((p, i) => (
                  <ScrollReveal key={p.id} delay={i * 0.05}>
                    <PropertyCard property={p} />
                  </ScrollReveal>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-sm rounded-sm transition-all duration-200 ${
                    page === p
                      ? 'bg-gold text-brand font-bold'
                      : 'border border-white/10 text-muted hover:border-gold/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
