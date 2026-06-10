'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAreas, deleteArea, updateAreaStatus } from '@/lib/api'
import type { Area } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  IconGrid, IconList, IconMap, IconMapPin, IconSearch,
  IconPencil, IconTrash, IconToggleLeft, IconToggleRight,
} from '@/components/ui/icons'

const VIEW_KEY = 'evoorion_areas_view'

function pctRange(v: number | string | null | undefined) {
  if (v == null || v === '') return '—'
  return `${String(v).replace(/%\s*$/, '')}%`
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusToggle({ area, onChange }: { area: Area; onChange: (a: Area) => void }) {
  const [loading, setLoading] = useState(false)
  const active = (area.status ?? 'active') === 'active'

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      const next = active ? 'inactive' : 'active'
      const res = await updateAreaStatus(area.id, next)
      onChange(res.data)
    } catch { /* silently ignore */ }
    finally { setLoading(false) }
  }

  return (
    <button type="button" onClick={toggle} disabled={loading}
      title={active ? 'Mark inactive' : 'Mark active'}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-all ${
        active
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
      } ${loading ? 'opacity-60 cursor-wait' : ''}`}
    >
      {active ? <IconToggleRight size={13} /> : <IconToggleLeft size={13} />}
      {active ? 'Active' : 'Inactive'}
    </button>
  )
}

// ── Area card ─────────────────────────────────────────────────────────────────

function AreaCard({ area, onDelete, onStatusChange }: { area: Area; onDelete: () => void; onStatusChange: (a: Area) => void }) {
  const hasGeo = area.latitude && area.longitude
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
      <div className="relative h-36 bg-slate-100 dark:bg-slate-700 shrink-0">
        {area.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={area.hero_image_url} alt={area.name} className="w-full h-full object-cover" />
        ) : hasGeo ? (
          <iframe
            title={area.name}
            className="w-full h-full border-0 pointer-events-none"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${area.longitude! - 0.04},${area.latitude! - 0.04},${area.longitude! + 0.04},${area.latitude! + 0.04}&layer=mapnik&marker=${area.latitude},${area.longitude}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconMap size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 left-2">
          <StatusToggle area={area} onChange={onStatusChange} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{area.name}</p>
          {hasGeo && <IconMapPin size={13} className="text-emerald-500 shrink-0 mt-0.5" title="Has coordinates" />}
        </div>
        <p className="text-xs text-slate-400 font-mono mb-3">{area.slug}</p>

        {(area.long_term_roi || area.short_term_roi || area.appreciation) && (
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {area.long_term_roi != null && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                <p className="text-[10px] text-blue-400 mb-0.5">LT ROI</p>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">{pctRange(area.long_term_roi)}</p>
              </div>
            )}
            {area.short_term_roi != null && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                <p className="text-[10px] text-purple-400 mb-0.5">ST ROI</p>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">{pctRange(area.short_term_roi)}</p>
              </div>
            )}
            {area.appreciation != null && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                <p className="text-[10px] text-emerald-400 mb-0.5">Apprec.</p>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{pctRange(area.appreciation)}</p>
              </div>
            )}
          </div>
        )}

        {/* Location preview */}
        {hasGeo && !area.hero_image_url && (
          <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700 h-24 mb-3">
            <iframe
              title={`${area.name} map`}
              className="w-full h-full border-0 pointer-events-none"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${area.longitude! - 0.02},${area.latitude! - 0.02},${area.longitude! + 0.02},${area.latitude! + 0.02}&layer=mapnik&marker=${area.latitude},${area.longitude}`}
            />
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          <Link href={`/areas/${area.id}/edit`} title="Edit area"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <IconPencil size={12} /> Edit
          </Link>
          <button type="button" onClick={onDelete} title="Delete area"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <IconTrash size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AreasPage() {
  const [areas,    setAreas]    = useState<Area[]>([])
  const [loading,  setLoading]  = useState(true)
  const [toDelete, setToDelete] = useState<Area | null>(null)
  const [acting,   setActing]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState<'all' | 'active' | 'inactive' | 'with_roi' | 'with_geo'>('all')
  const [view,     setView]     = useState<'table' | 'cards'>('table')

  function load() {
    setLoading(true)
    getAreas().then(res => setAreas(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => {
    load()
    const stored = localStorage.getItem(VIEW_KEY)
    if (stored === 'cards' || stored === 'table') setView(stored as 'table' | 'cards')
  }, [])

  function toggleView(v: 'table' | 'cards') { setView(v); localStorage.setItem(VIEW_KEY, v) }

  function handleStatusChange(updated: Area) {
    setAreas(prev => prev.map(a => a.id === updated.id ? { ...a, status: updated.status } : a))
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteArea(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  const filtered = areas.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.slug.includes(search.toLowerCase())) return false
    if (filter === 'active'   && (a.status ?? 'active') !== 'active') return false
    if (filter === 'inactive' && (a.status ?? 'active') !== 'inactive') return false
    if (filter === 'with_roi' && a.long_term_roi == null && a.short_term_roi == null) return false
    if (filter === 'with_geo' && (!a.latitude || !a.longitude)) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search areas…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'active', 'inactive', 'with_roi', 'with_geo'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              {{ all: 'All', active: 'Active', inactive: 'Inactive', with_roi: 'Has ROI', with_geo: 'Has Map' }[f]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <button type="button" onClick={() => toggleView('table')} className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Table view">
            <IconList size={15} />
          </button>
          <button type="button" onClick={() => toggleView('cards')} className={`p-1.5 rounded-md transition-colors ${view === 'cards' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Cards view">
            <IconGrid size={15} />
          </button>
        </div>

        <Link href="/areas/new" className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0">
          + New Area
        </Link>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">LT ROI</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ST ROI</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Apprec.</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Off-Plan</th>
                <th className="hidden sm:table-cell px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Map</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className={`px-5 py-3.5${[2,3,6].includes(j) ? ' hidden sm:table-cell' : [4,5].includes(j) ? ' hidden lg:table-cell' : ''}`}><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">{search ? 'No areas match your search.' : 'No areas yet.'}</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      {a.hero_image_url && (
                        <div className="w-8 h-8 rounded-md overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.hero_image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p>{a.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{a.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusToggle area={a} onChange={handleStatusChange} />
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">{pctRange(a.long_term_roi)}</td>
                  <td className="hidden sm:table-cell px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">{pctRange(a.short_term_roi)}</td>
                  <td className="hidden lg:table-cell px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">{pctRange(a.appreciation)}</td>
                  <td className="hidden lg:table-cell px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">{pctRange(a.off_plan_discount)}</td>
                  <td className="hidden sm:table-cell px-4 py-3.5 text-center">
                    {a.latitude && a.longitude ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title={`${a.latitude}, ${a.longitude}`} />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600" />
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link href={`/areas/${a.id}/edit`} title="Edit area" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <IconPencil size={14} />
                      </Link>
                      <button type="button" onClick={() => setToDelete(a)} title="Delete area" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards view */}
      {view === 'cards' && (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-36 bg-slate-100 dark:bg-slate-700 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">{search ? 'No areas match your search.' : 'No areas yet.'}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(a => (
              <AreaCard key={a.id} area={a} onDelete={() => setToDelete(a)} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete area"
          message={`Delete "${toDelete.name}"? Properties linked to it may be affected.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
