'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getAdminProperties, deleteProperty, restoreProperty } from '@/lib/api'
import type { Property, PropertyStatus, PropertyType } from '@/types'
import { PropertyStatusBadge, PropertyTypeBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

const PER_PAGE = 15

function fmtPrice(price: string | number) {
  return 'AED ' + Number(price).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function TableRow({
  property,
  onDelete,
  onRestore,
}: {
  property: Property
  onDelete: (p: Property) => void
  onRestore: (p: Property) => void
}) {
  const deleted = !!property.deleted_at

  return (
    <tr className={`hover:bg-slate-50 transition-colors ${deleted ? 'opacity-50' : ''}`}>
      <td className="px-5 py-3.5">
        <div>
          <p className="font-medium text-slate-800 truncate max-w-[220px]">{property.title}</p>
          <p className="text-xs text-slate-400 font-mono">{property.slug}</p>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <PropertyTypeBadge type={property.type as PropertyType} />
      </td>
      <td className="px-4 py-3.5">
        <PropertyStatusBadge status={property.status as PropertyStatus} />
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">
        {fmtPrice(property.price)}
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-500">
        {[
          property.bedrooms != null ? `${property.bedrooms} bed` : null,
          property.bathrooms != null ? `${property.bathrooms} bath` : null,
          property.area_sqft ? `${Number(property.area_sqft).toLocaleString()} sqft` : null,
        ].filter(Boolean).join(' · ') || '—'}
      </td>
      <td className="px-4 py-3.5 text-center">
        {property.is_featured && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-xs">★</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          {deleted ? (
            <button
              type="button"
              onClick={() => onRestore(property)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Restore
            </button>
          ) : (
            <>
              <Link
                href={`/properties/${property.slug}`}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </Link>
              <span className="text-slate-200">|</span>
              <button
                type="button"
                onClick={() => onDelete(property)}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [status,     setStatus]     = useState('')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  const [toDelete,  setToDelete]  = useState<Property | null>(null)
  const [toRestore, setToRestore] = useState<Property | null>(null)
  const [acting,    setActing]    = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (p: number, s: string, st: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await getAdminProperties({ page: p, per_page: PER_PAGE, search: s || undefined, status: st || undefined })
      setProperties(res.data ?? [])
      setTotal(res.meta?.pagination.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, search, status)
  }, [page, status, load]) // search handled via debounce

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(1, val, status), 400)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try {
      await deleteProperty(toDelete.slug)
      setToDelete(null)
      load(page, search, status)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setActing(false)
    }
  }

  async function confirmRestore() {
    if (!toRestore) return
    setActing(true)
    try {
      await restoreProperty(toRestore.slug)
      setToRestore(null)
      load(page, search, status)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Restore failed')
    } finally {
      setActing(false)
    }
  }

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="max-w-7xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{total} properties</p>
        <Link
          href="/properties/new"
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm transition-colors"
        >
          + New Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search title or slug…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white"
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] bg-white text-slate-700 pr-8"
        >
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">★</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3.5 bg-slate-100 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      No properties found.{' '}
                      <Link href="/properties/new" className="text-[#C9A84C] hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  properties.map(p => (
                    <TableRow key={p.id} property={p} onDelete={setToDelete} onRestore={setToRestore} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && total > PER_PAGE && (
          <div className="border-t border-slate-100 px-4">
            <Pagination
              currentPage={page}
              lastPage={lastPage}
              total={total}
              perPage={PER_PAGE}
              onPage={p => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {toDelete && (
        <ConfirmModal
          title="Delete property"
          message={`Are you sure you want to delete "${toDelete.title}"? It can be restored later.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
      {toRestore && (
        <ConfirmModal
          title="Restore property"
          message={`Restore "${toRestore.title}" so it appears in listings again?`}
          onConfirm={confirmRestore}
          onCancel={() => setToRestore(null)}
          danger={false}
          loading={acting}
        />
      )}
    </div>
  )
}
