'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getAdminProperties, deleteProperty, restoreProperty, updateProperty, getAreas, getDevelopers } from '@/lib/api'
import type { Area, Developer, Property, PropertyStatus, PropertyType } from '@/types'
import { PropertyStatusBadge, PropertyTypeBadge } from '@/components/ui/Badge'
import { RegionBadge } from '@/components/ui/RegionBadge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { IconBuilding, IconGrid, IconList, IconFilter, IconExternalLink, IconPencil, IconTrash, IconRotateCcw } from '@/components/ui/icons'

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000'

const PER_PAGE = 15
const VIEW_KEY = 'evoorion_properties_view'

function fmtPrice(price: string | number) {
  return 'AED ' + Number(price).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const STATUS_OPTIONS = [
  { value: '',          label: 'All statuses' },
  { value: 'available', label: 'Available' },
  { value: 'sold',      label: 'Sold' },
  { value: 'rented',    label: 'Rented' },
]

const TYPE_OPTIONS = [
  { value: '',           label: 'All types' },
  { value: 'apartment',  label: 'Apartment' },
  { value: 'villa',      label: 'Villa' },
  { value: 'penthouse',  label: 'Penthouse' },
  { value: 'townhouse',  label: 'Townhouse' },
  { value: 'commercial', label: 'Commercial' },
]

const FEATURED_OPTIONS = [
  { value: '',     label: 'Featured & non-featured' },
  { value: '1',    label: 'Featured only' },
  { value: '0',    label: 'Non-featured only' },
]

const QUICK_STATUS: { value: PropertyStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'sold',      label: 'Sold' },
  { value: 'rented',    label: 'Rented' },
]

// ── Quick status changer ──────────────────────────────────────────────────────

function QuickStatus({ property, onChanged, dropUp = false }: { property: Property; onChanged: () => void; dropUp?: boolean }) {
  const [open,    setOpen]    = useState(false)
  const [saving,  setSaving]  = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  async function changeStatus(s: PropertyStatus) {
    setOpen(false)
    setSaving(true)
    try { await updateProperty(property.slug, { status: s }); onChanged() }
    catch { /* silently fail */ }
    finally { setSaving(false) }
  }

  if (!!property.deleted_at) return <PropertyStatusBadge status={property.status as PropertyStatus} />

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className="focus:outline-none disabled:opacity-50"
        title="Click to change status"
      >
        <PropertyStatusBadge status={property.status as PropertyStatus} />
        <span className="ml-1 text-slate-300 dark:text-slate-600 text-[10px]">▾</span>
      </button>
      {open && (
        <div className={`absolute z-20 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden min-w-[120px]`}>
          {QUICK_STATUS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => changeStatus(s.value)}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${s.value === property.status ? 'text-[#C9A84C]' : 'text-slate-700 dark:text-slate-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Table row ─────────────────────────────────────────────────────────────────

function TableRow({
  property,
  onDelete,
  onRestore,
  onRefresh,
}: {
  property: Property
  onDelete: (p: Property) => void
  onRestore: (p: Property) => void
  onRefresh: () => void
}) {
  const deleted = !!property.deleted_at

  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${deleted ? 'opacity-50' : ''}`}>
      <td className="px-5 py-3.5">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[220px]">{property.title}</p>
          <p className="text-xs text-slate-400 font-mono">{property.area?.name ?? property.slug}</p>
          {property.region && <div className="mt-0.5"><RegionBadge region={property.region} /></div>}
        </div>
      </td>
      <td className="hidden sm:table-cell px-4 py-3.5"><PropertyTypeBadge type={property.type as PropertyType} /></td>
      <td className="px-4 py-3.5">
        <QuickStatus property={property} onChanged={onRefresh} />
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200 font-medium">{fmtPrice(property.price)}</td>
      <td className="hidden sm:table-cell px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400">
        {[
          property.bedrooms  != null ? `${property.bedrooms}bd` : null,
          property.bathrooms != null ? `${property.bathrooms}ba` : null,
          property.area_sqft ? `${Number(property.area_sqft).toLocaleString()} sqft` : null,
        ].filter(Boolean).join(' · ') || '—'}
      </td>
      <td className="hidden sm:table-cell px-4 py-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {property.is_featured && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-xs" title="Featured">★</span>
          )}
          {property.is_active === false && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-400" title="Hidden from website">Draft</span>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1">
          {deleted ? (
            <button type="button" onClick={() => onRestore(property)} title="Restore property"
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              <IconRotateCcw size={14} />
            </button>
          ) : (
            <>
              <Link href={`/properties/${property.slug}`} title="Edit property"
                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <IconPencil size={14} />
              </Link>
              <a href={`${WEBSITE_URL}/properties/${property.slug}`} target="_blank" rel="noreferrer" title="Live preview"
                className="p-1.5 rounded-md text-slate-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors">
                <IconExternalLink size={14} />
              </a>
              <button type="button" onClick={() => onDelete(property)} title="Delete property"
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <IconTrash size={14} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Property card ─────────────────────────────────────────────────────────────

function PropertyCard({
  property,
  onDelete,
  onRestore,
  onRefresh,
}: {
  property: Property
  onDelete: (p: Property) => void
  onRestore: (p: Property) => void
  onRefresh: () => void
}) {
  const deleted = !!property.deleted_at
  const img     = property.images?.find(i => i.is_primary)?.url ?? property.images?.[0]?.url ?? null

  const details = [
    property.bedrooms  != null ? `${property.bedrooms} bed` : null,
    property.bathrooms != null ? `${property.bathrooms} bath` : null,
    property.area_sqft ? `${Number(property.area_sqft).toLocaleString()} sqft` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col ${deleted ? 'opacity-50' : ''}`}>
      <div className="relative h-44 bg-slate-100 dark:bg-slate-700 shrink-0">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconBuilding size={36} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}
        {property.is_featured && (
          <span className="absolute top-2 right-2 bg-[#C9A84C] text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider">
            FEATURED
          </span>
        )}
        {property.is_active === false && !deleted && (
          <span className="absolute top-2 left-2 bg-slate-700/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-sm">
            DRAFT
          </span>
        )}
        {deleted && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
            DELETED
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate mb-2" title={property.title}>
          {property.title}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <PropertyTypeBadge type={property.type as PropertyType} />
          <RegionBadge region={property.region} />
        </div>

        <p className="text-[#C9A84C] font-bold text-sm mb-1">{fmtPrice(property.price)}</p>

        {details && <p className="text-xs text-slate-400 dark:text-slate-500">{details}</p>}
        {property.area && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{property.area.name}</p>}

        <div className="flex items-center gap-1 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          {deleted ? (
            <button type="button" onClick={() => onRestore(property)} title="Restore property"
              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              <IconRotateCcw size={12} /> Restore
            </button>
          ) : (
            <>
              <Link href={`/properties/${property.slug}`} title="Edit property"
                className="flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1.5 px-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <IconPencil size={12} /> Edit
              </Link>
              <QuickStatus property={property} onChanged={onRefresh} dropUp />
              <div className="flex-1" />
              <a href={`${WEBSITE_URL}/properties/${property.slug}`} target="_blank" rel="noreferrer" title="Live preview"
                className="p-1.5 rounded-md text-slate-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors">
                <IconExternalLink size={13} />
              </a>
              <button type="button" onClick={() => onDelete(property)} title="Delete property"
                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <IconTrash size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [areas,      setAreas]      = useState<Area[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [status,     setStatus]     = useState('')
  const [type,       setType]       = useState('')
  const [areaId,     setAreaId]     = useState('')
  const [featured,   setFeatured]   = useState('')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [view,       setView]       = useState<'table' | 'cards'>('table')
  const [showFilters,setShowFilters]= useState(false)

  const [toDelete,  setToDelete]  = useState<Property | null>(null)
  const [toRestore, setToRestore] = useState<Property | null>(null)
  const [acting,    setActing]    = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY)
    if (stored === 'cards' || stored === 'table') setView(stored)
    Promise.all([getAreas(), getDevelopers()]).then(([a, d]) => {
      setAreas(a.data ?? [])
      setDevelopers(d.data ?? [])
    })
  }, [])

  function toggleView(v: 'table' | 'cards') {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const load = useCallback(async (p: number, s: string, st: string, ty: string, ai: string, fe: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await getAdminProperties({
        page: p, per_page: PER_PAGE,
        search: s || undefined,
        status: st || undefined,
        type:   ty || undefined,
        area_id: ai ? Number(ai) : undefined,
        featured: fe || undefined,
      })
      setProperties(res.data ?? [])
      setTotal(res.meta?.pagination?.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search, status, type, areaId, featured) }, [page, status, type, areaId, featured, load])

  function handleSearch(val: string) {
    setSearch(val); setPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(1, val, status, type, areaId, featured), 400)
  }

  function refresh() { load(page, search, status, type, areaId, featured) }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteProperty(toDelete.slug); setToDelete(null); refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  async function confirmRestore() {
    if (!toRestore) return
    setActing(true)
    try { await restoreProperty(toRestore.slug); setToRestore(null); refresh() }
    catch (err) { alert(err instanceof Error ? err.message : 'Restore failed') }
    finally { setActing(false) }
  }

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE))

  const areaOptions = [
    { value: '', label: 'All areas' },
    ...areas.map(a => ({ value: String(a.id), label: a.name })),
  ]

  const hasActiveFilters = !!(status || type || areaId || featured)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{total} properties</p>
        <Link href="/properties/new" className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm transition-colors">
          + New Property
        </Link>
      </div>

      {/* Search + view toggle row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search title or slug…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
        <button
          type="button"
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${hasActiveFilters ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
        >
          <IconFilter size={14} />
          Filters
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
        </button>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg shrink-0">
          <button type="button" onClick={() => toggleView('table')} className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} aria-label="Table view">
            <IconList size={16} />
          </button>
          <button type="button" onClick={() => toggleView('cards')} className={`p-1.5 rounded-md transition-colors ${view === 'cards' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} aria-label="Cards view">
            <IconGrid size={16} />
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <CustomSelect
            value={status}
            onChange={v => { setStatus(v); setPage(1) }}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
            className="w-40"
          />
          <CustomSelect
            value={type}
            onChange={v => { setType(v); setPage(1) }}
            options={TYPE_OPTIONS}
            placeholder="All types"
            className="w-40"
          />
          <CustomSelect
            value={areaId}
            onChange={v => { setAreaId(v); setPage(1) }}
            options={areaOptions}
            placeholder="All areas"
            searchable={areaOptions.length > 6}
            className="w-44"
          />
          <CustomSelect
            value={featured}
            onChange={v => { setFeatured(v); setPage(1) }}
            options={FEATURED_OPTIONS}
            placeholder="Featured & non-featured"
            className="w-52"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setStatus(''); setType(''); setAreaId(''); setFeatured(''); setPage(1) }}
              className="px-3 py-2 text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Table view ────────────────────────────────────────────────────────── */}
      {view === 'table' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {error ? (
            <div className="p-8 text-center text-red-500 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">★</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} className={`px-5 py-4${[1,4,5].includes(j) ? ' hidden sm:table-cell' : ''}`}><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-full" /></td>
                        ))}
                      </tr>
                    ))
                  ) : properties.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                        No properties found.{' '}
                        <Link href="/properties/new" className="text-[#C9A84C] hover:underline">Create one</Link>
                      </td>
                    </tr>
                  ) : (
                    properties.map(p => (
                      <TableRow key={p.id} property={p} onDelete={setToDelete} onRestore={setToRestore} onRefresh={refresh} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && total > PER_PAGE && (
            <div className="border-t border-slate-100 dark:border-slate-700 px-4">
              <Pagination currentPage={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onPage={p => setPage(p)} />
            </div>
          )}
        </div>
      )}

      {/* ── Cards view ────────────────────────────────────────────────────────── */}
      {view === 'cards' && (
        <>
          {error && <div className="p-8 text-center text-red-500 text-sm">{error}</div>}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                  <div className="h-44 bg-slate-100 dark:bg-slate-700 rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No properties found.{' '}
              <Link href="/properties/new" className="text-[#C9A84C] hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {properties.map(p => (
                <PropertyCard key={p.id} property={p} onDelete={setToDelete} onRestore={setToRestore} onRefresh={refresh} />
              ))}
            </div>
          )}
          {!loading && !error && total > PER_PAGE && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4">
              <Pagination currentPage={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onPage={p => setPage(p)} />
            </div>
          )}
        </>
      )}

      {toDelete && (
        <ConfirmModal title="Delete property" message={`Are you sure you want to delete "${toDelete.title}"? It can be restored later.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} loading={acting} />
      )}
      {toRestore && (
        <ConfirmModal title="Restore property" message={`Restore "${toRestore.title}" so it appears in listings again?`} onConfirm={confirmRestore} onCancel={() => setToRestore(null)} danger={false} loading={acting} />
      )}
    </div>
  )
}
