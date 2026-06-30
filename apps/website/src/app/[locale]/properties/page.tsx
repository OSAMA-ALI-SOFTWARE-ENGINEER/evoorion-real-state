'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, LayoutGrid, Map, Bell } from 'lucide-react'
import {
  getProperties,
  getAreas,
  getOperationTypes,
  getFavorites,
  addFavorite,
  removeFavorite,
  getSavedSearches,
  type SavedSearch,
} from '@/lib/api'
import { SavedSearchModal } from '@/components/ui/SavedSearchModal'
import { PropertyCard } from '@/components/ui/PropertyCard'

const PropertyMapView = dynamic(
  () => import('@/components/ui/PropertyMapView').then((m) => m.PropertyMapView),
  { ssr: false, loading: () => <div className="w-full h-[60vh] min-h-[420px] rounded-sm border border-gold-border bg-brand-section/40 animate-pulse" /> },
)
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { AuthModal } from '@/components/ui/AuthModal'
import { useAuth } from '@/context/AuthContext'
import { SectionBackground } from '@/components/ui/SectionBackground'
import { CantFindCTA } from '@/components/ui/CantFindCTA'
import type { Area, OperationType, PropertySummary, PropertyType } from '@/types'
import { BUDGET_RANGES } from '@/types'

const TYPES: { label: string; value: '' | PropertyType }[] = [
  { label: 'All', value: '' },
  { label: 'Villa', value: 'villa' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Commercial', value: 'commercial' },
]

const SORT_OPTIONS = [
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Most Viewed', value: 'popular' },
]

function getSortParams(key: string): { sort_by?: string; sort_direction?: 'asc' | 'desc' } {
  if (key === 'price_asc') return { sort_by: 'price', sort_direction: 'asc' }
  if (key === 'price_desc') return { sort_by: 'price', sort_direction: 'desc' }
  if (key === 'newest') return { sort_by: 'created_at', sort_direction: 'desc' }
  if (key === 'popular') return { sort_by: 'views_count', sort_direction: 'desc' }
  return {}
}

function getPriceParams(key: string): { min_price?: number; max_price?: number } {
  const range = BUDGET_RANGES[key as keyof typeof BUDGET_RANGES]
  if (!range) return {}
  // Backend requires both min_price AND max_price to apply the whereBetween filter
  return { min_price: range.min, max_price: range.max }
}

const SELECT_CLS =
  'bg-brand border border-white/10 text-sm text-white rounded-sm px-3 py-2 outline-none focus:border-gold transition-colors cursor-pointer'

export default function PropertiesPage() {
  return <Suspense><PropertiesPageInner /></Suspense>
}

function PropertiesPageInner() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Tracks which param string was last applied — re-fires on navigation to a new URL
  const lastAppliedParams = useRef<string | null>(null)
  // Gates the property fetch until URL params are resolved (prevents flash of unfiltered results)
  const [initialized, setInitialized] = useState(false)

  // Filter state
  const [activeType, setActiveType] = useState<'' | PropertyType>('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [areaId, setAreaId] = useState(0)
  const [opTypeId, setOpTypeId] = useState(0)
  const [priceKey, setPriceKey] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [page, setPage] = useState(1)

  const [heroBg, setHeroBg] = useState<string | null>(null)

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    fetch(`${api}/settings`).then(r => r.json()).then(j => setHeroBg(j?.data?.section_bg_hero_properties ?? null)).catch(() => {})
  }, [])

  // Data state
  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [areas, setAreas] = useState<Area[]>([])
  const [opTypes, setOpTypes] = useState<OperationType[]>([])

  // View mode: grid or map
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  // Saved searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)

  // Filter panel toggle
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Compare state
  const [compareList, setCompareList] = useState<PropertySummary[]>([])

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [showAuth, setShowAuth] = useState(false)

  // Load master data for filter dropdowns
  useEffect(() => {
    Promise.all([
      getAreas().catch(() => ({ data: [] as Area[] })),
      getOperationTypes().catch(() => ({ data: [] as OperationType[] })),
    ]).then(([areasRes, opTypesRes]) => {
      setAreas(areasRes.data ?? [])
      setOpTypes(opTypesRes.data ?? [])
    })
  }, [])

  // Sync URL params → filter state whenever the URL or master data changes
  useEffect(() => {
    const key = searchParams.toString()
    const paramOp  = searchParams.get('operation')
    const paramLoc = searchParams.get('location')
    const paramQ   = searchParams.get('q')

    // No URL params — initialise immediately with cleared filters
    if (!paramOp && !paramLoc && !paramQ) {
      if (lastAppliedParams.current === key) return
      lastAppliedParams.current = key
      setOpTypeId(0); setAreaId(0); setSearch('')
      setInitialized(true)
      return
    }

    // Wait for master data before resolving slugs
    if (opTypes.length === 0 || areas.length === 0) return

    // Same params already applied — don't overwrite manual filter changes
    if (lastAppliedParams.current === key) return
    lastAppliedParams.current = key

    setSearch(paramQ ?? '')

    const opMatch = paramOp
      ? opTypes.find(o => o.name.toLowerCase().replace(/[\s-]+/g, '-') === paramOp.toLowerCase())
      : undefined
    setOpTypeId(opMatch?.id ?? 0)

    const areaMatch = paramLoc
      ? areas.find(a => a.slug === paramLoc)
      : undefined
    setAreaId(areaMatch?.id ?? 0)

    setInitialized(true)
  }, [searchParams, opTypes, areas])

  // Load favorites and saved searches when user is logged in
  useEffect(() => {
    if (!user) { setFavoriteIds(new Set()); setSavedSearches([]); return }
    getFavorites()
      .then((res) => setFavoriteIds(new Set(res.data.map((p) => p.id))))
      .catch(() => {})
    getSavedSearches()
      .then((res) => setSavedSearches(res.data ?? []))
      .catch(() => {})
  }, [user])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchProperties = useCallback(
    async (
      p: number,
      s: string,
      type: '' | PropertyType,
      aId: number,
      opId: number,
      prKey: string,
      sKey: string,
    ) => {
      setLoading(true)
      try {
        const res = await getProperties({
          type: type || undefined,
          search: s || undefined,
          area_id: aId || undefined,
          operation_type_id: opId || undefined,
          ...getPriceParams(prKey),
          ...getSortParams(sKey),
          page: p,
          per_page: 9,
        })
        setProperties(res.data)
        setTotalPages(res.meta.pagination.last_page)
      } catch {
        setProperties([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!initialized) return
    fetchProperties(page, debouncedSearch, activeType, areaId, opTypeId, priceKey, sortKey)
  }, [page, debouncedSearch, activeType, areaId, opTypeId, priceKey, sortKey, fetchProperties, initialized])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeType, areaId, opTypeId, priceKey, sortKey])

  function toggleCompare(property: PropertySummary) {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === property.id)) return prev.filter((p) => p.id !== property.id)
      if (prev.length >= 4) return prev
      return [...prev, property]
    })
  }

  async function toggleFavorite(property: PropertySummary) {
    if (!user) { setShowAuth(true); return }
    const isFav = favoriteIds.has(property.id)
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isFav) next.delete(property.id)
      else next.add(property.id)
      return next
    })
    try {
      if (isFav) await removeFavorite(property.slug)
      else await addFavorite(property.slug)
    } catch {
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFav) next.add(property.id)
        else next.delete(property.id)
        return next
      })
    }
  }

  function clearAdvancedFilters() {
    setAreaId(0); setOpTypeId(0); setPriceKey(''); setSortKey('')
  }

  const hasAdvancedFilters = !!(areaId || opTypeId || priceKey || sortKey)

  // Derive operation name from URL (master uses URL-based tracking, not an opName state var)
  const opName = searchParams.get('operation') ?? 'all'

  // Build a plain object of current filters suitable for saving
  const currentFiltersObj: Record<string, unknown> = {
    ...(opName !== 'all' ? { operation: opName } : {}),
    ...(activeType ? { type: activeType } : {}),
    ...(areaId ? { area_id: areaId } : {}),
    ...(priceKey ? { price_range: priceKey } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(sortKey ? { sort: sortKey } : {}),
  }

  function buildFilterSummary(): string {
    const parts: string[] = []
    if (opName !== 'all') parts.push(opName.charAt(0).toUpperCase() + opName.slice(1))
    if (activeType) parts.push(activeType.charAt(0).toUpperCase() + activeType.slice(1))
    if (areaId) { const a = areas.find(x => x.id === areaId); if (a) parts.push(a.name) }
    if (priceKey) parts.push(priceKey.replace(/_/g, ' '))
    if (debouncedSearch) parts.push(`"${debouncedSearch}"`)
    return parts.length ? parts.join(' · ') : 'All properties'
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-section relative overflow-hidden">
        <SectionBackground bgJson={heroBg} opacity={18} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Row 1: type pills + search + filter toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Save search */}
              <button
                type="button"
                title="Save this search"
                onClick={() => { if (!user) setShowAuth(true); else setShowSaveModal(true) }}
                className="flex items-center justify-center w-9 h-9 border border-white/10 rounded-sm text-muted hover:text-gold hover:border-gold/40 transition-colors shrink-0"
              >
                <Bell size={14} />
              </button>

              {/* View mode toggle */}
              <div className="flex rounded-sm border border-white/10 overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`flex items-center justify-center w-9 h-9 transition-colors ${
                    viewMode === 'grid' ? 'bg-gold text-brand' : 'text-muted hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  title="Map view"
                  className={`flex items-center justify-center w-9 h-9 border-l border-white/10 transition-colors ${
                    viewMode === 'map' ? 'bg-gold text-brand' : 'text-muted hover:text-white'
                  }`}
                >
                  <Map size={14} />
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search properties…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 focus:border-gold text-white text-sm placeholder-muted outline-none rounded-sm transition-colors"
                />
              </div>

              {/* Filters toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-sm border text-sm transition-all duration-200 shrink-0 ${
                  showAdvanced
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-white/10 text-muted hover:border-gold/40 hover:text-white'
                }`}
                aria-expanded={showAdvanced}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Filters</span>
                {hasAdvancedFilters && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-brand text-[9px] font-bold flex items-center justify-center">
                    {[areaId, opTypeId, priceKey, sortKey].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: advanced filters — collapsible */}
          <AnimatePresence initial={false}>
            {showAdvanced && (
              <motion.div
                key="advanced"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 items-center pt-3">
                  <select
                    aria-label="Filter by area"
                    value={areaId}
                    onChange={(e) => setAreaId(Number(e.target.value))}
                    className={`${SELECT_CLS} select-dark`}
                  >
                    <option value={0}>All Areas</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>

                  <select
                    aria-label="Filter by operation type"
                    value={opTypeId}
                    onChange={(e) => setOpTypeId(Number(e.target.value))}
                    className={`${SELECT_CLS} select-dark`}
                  >
                    <option value={0}>Buy or Rent</option>
                    {opTypes.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>

                  <select
                    aria-label="Filter by price range"
                    value={priceKey}
                    onChange={(e) => setPriceKey(e.target.value)}
                    className={`${SELECT_CLS} select-dark`}
                  >
                    <option value="">Any Price</option>
                    {(Object.entries(BUDGET_RANGES) as [string, { label: string }][]).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>

                  <select
                    aria-label="Sort properties"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className={`${SELECT_CLS} select-dark`}
                  >
                    <option value="">Default Order</option>
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  {hasAdvancedFilters && (
                    <button
                      type="button"
                      onClick={clearAdvancedFilters}
                      className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
                    >
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Grid / Map */}
      <section className={`py-16 bg-brand min-h-[60vh] ${compareList.length > 0 ? 'pb-36' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Map view */}
          {viewMode === 'map' && (
            <PropertyMapView properties={properties} areas={areas} />
          )}

          {/* Grid view */}
          {viewMode === 'grid' && (
            loading ? (
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
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" layout>
                  {properties.map((p, i) => (
                    <ScrollReveal key={p.id} delay={i * 0.05} className="h-full">
                      <PropertyCard
                        property={p}
                        isFavorited={favoriteIds.has(p.id)}
                        onToggleFavorite={toggleFavorite}
                        isComparing={!!compareList.find((c) => c.id === p.id)}
                        onToggleCompare={toggleCompare}
                      />
                    </ScrollReveal>
                  ))}
                </motion.div>
              </AnimatePresence>
            )
          )}

          {totalPages > 1 && !loading && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
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

      {/* Floating compare bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-brand-section/95 backdrop-blur-md border-t border-gold-border shadow-2xl"
          >
            <div className="max-w-[1440px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0 pb-1 sm:pb-0">
                {compareList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm px-3 py-2 shrink-0 max-w-[160px]"
                  >
                    <span className="text-white text-xs truncate">{p.title}</span>
                    <button
                      type="button"
                      onClick={() => toggleCompare(p)}
                      className="text-muted hover:text-white transition-colors shrink-0"
                      aria-label="Remove"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {compareList.length < 4 && (
                  <span className="text-muted/40 text-xs shrink-0 whitespace-nowrap">
                    {compareList.length === 1 ? 'Add 1 more to compare' : `${4 - compareList.length} more slots`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-muted text-xs">{compareList.length} / 4</span>
                <button
                  type="button"
                  disabled={compareList.length < 2}
                  onClick={() => router.push(`/compare?slugs=${compareList.map((p) => p.slug).join(',')}`)}
                  className="px-5 py-2.5 bg-gold hover:bg-gold-light text-brand text-sm font-semibold rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Compare Now
                </button>
                <button
                  type="button"
                  onClick={() => setCompareList([])}
                  className="text-muted hover:text-white text-xs transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSaveModal && (
        <SavedSearchModal
          onClose={() => setShowSaveModal(false)}
          currentFilters={currentFiltersObj}
          filterSummary={buildFilterSummary()}
          savedSearches={savedSearches}
          onSaved={(s) => setSavedSearches((prev) => [s, ...prev])}
          onDeleted={(id) => setSavedSearches((prev) => prev.filter((s) => s.id !== id))}
        />
      )}
      <CantFindCTA />
    </>
  )
}
