'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getLeads, deleteLead, exportLeadsCSV, getRegions } from '@/lib/api'
import type { Lead, LeadStatus, LeadSource, Region } from '@/types'
import { LeadStatusBadge } from '@/components/ui/Badge'
import { RegionBadge } from '@/components/ui/RegionBadge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { useAuth } from '@/context/AuthContext'
import {
  IconUsers, IconGlobe, IconPhone, IconMail, IconFacebook, IconInstagram, IconWhatsApp,
} from '@/components/ui/icons'

const PER_PAGE = 20

const STATUS_OPTIONS = [
  { value: '',          label: 'All statuses' },
  { value: 'new',       label: 'New',       description: '🔵' },
  { value: 'contacted', label: 'Contacted', description: '🟡' },
  { value: 'qualified', label: 'Qualified', description: '🟣' },
  { value: 'closed',    label: 'Closed',    description: '🟢' },
  { value: 'lost',      label: 'Lost',      description: '🔴' },
]

const SOURCE_OPTIONS = [
  { value: '',          label: 'All sources' },
  { value: 'website',   label: 'Website',   icon: <IconGlobe size={14} /> },
  { value: 'instagram', label: 'Instagram', icon: <IconInstagram size={14} /> },
  { value: 'facebook',  label: 'Facebook',  icon: <IconFacebook size={14} /> },
  { value: 'whatsapp',  label: 'WhatsApp',  icon: <IconWhatsApp size={14} /> },
  { value: 'referral',  label: 'Referral',  icon: <IconMail size={14} /> },
  { value: 'other',     label: 'Other',     icon: <IconUsers size={14} /> },
]

const SOURCE_LABELS: Record<LeadSource, string> = {
  website:   'Website',
  instagram: 'Instagram',
  facebook:  'Facebook',
  whatsapp:  'WhatsApp',
  referral:  'Referral',
  other:     'Other',
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30)  return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function LeadsPage() {
  const { user } = useAuth()
  const canDelete = user?.role === 'manager' || user?.role === 'super_admin'

  const [leads,     setLeads]     = useState<Lead[]>([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('')
  const [source,    setSource]    = useState('')
  const [region,    setRegion]    = useState('')
  const [regions,   setRegions]   = useState<Region[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [toDelete,  setToDelete]  = useState<Lead | null>(null)
  const [acting,    setActing]    = useState(false)
  const [exporting, setExporting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
  }, [])

  const load = useCallback(async (p: number, s: string, st: string, src: string, rgn: string) => {
    setLoading(true); setError('')
    try {
      const res = await getLeads({ page: p, per_page: PER_PAGE, search: s || undefined, status: st || undefined, source: src || undefined, region: rgn || undefined })
      setLeads(res.data ?? [])
      setTotal(res.meta?.pagination?.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search, status, source, region) }, [page, status, source, region, load])

  function handleSearch(val: string) {
    setSearch(val); setPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(1, val, status, source, region), 400)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try {
      await deleteLead(toDelete.id)
      setToDelete(null)
      load(page, search, status, source, region)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally { setActing(false) }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const blob = await exportLeadsCSV()
      downloadBlob(blob, `leads-${new Date().toISOString().slice(0, 10)}.csv`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed')
    } finally { setExporting(false) }
  }

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{total} leads</p>
        {canDelete && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {exporting ? 'Exporting…' : '↓ Export CSV'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
        />
        <CustomSelect
          value={status}
          onChange={v => { setStatus(v); setPage(1) }}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          className="sm:w-44"
        />
        <CustomSelect
          value={source}
          onChange={v => { setSource(v); setPage(1) }}
          options={SOURCE_OPTIONS}
          placeholder="All sources"
          className="sm:w-44"
        />
        <CustomSelect
          value={region}
          onChange={v => { setRegion(v); setPage(1) }}
          options={[
            { value: '', label: 'All regions' },
            ...regions.filter(r => r.is_active).map(r => ({ value: r.code, label: `${r.flag ?? ''} ${r.name}`.trim() })),
          ]}
          placeholder="All regions"
          className="sm:w-44"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Region</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Received</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className={`px-5 py-4${[2,3].includes(j) ? ' hidden sm:table-cell' : j === 4 ? ' hidden md:table-cell' : j === 5 ? ' hidden lg:table-cell' : ''}`}><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">No leads found.</td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-slate-400">{lead.phone}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <LeadStatusBadge status={lead.status as LeadStatus} />
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                          {lead.source === 'facebook'  && <IconFacebook  size={13} className="text-blue-600 shrink-0" />}
                          {lead.source === 'instagram' && <IconInstagram size={13} className="text-pink-500 shrink-0" />}
                          {lead.source === 'whatsapp'  && <IconWhatsApp  size={13} className="text-emerald-500 shrink-0" />}
                          {lead.source === 'website'   && <IconGlobe     size={13} className="text-slate-400 shrink-0" />}
                          {lead.source === 'referral'  && <IconMail      size={13} className="text-amber-500 shrink-0" />}
                          {lead.source === 'other'     && <IconUsers     size={13} className="text-slate-400 shrink-0" />}
                          {SOURCE_LABELS[lead.source] ?? lead.source}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                        {lead.assigned_user ? lead.assigned_user.name : <span className="text-amber-500">Unassigned</span>}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3.5">
                        <RegionBadge region={lead.property?.region ?? null} />
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3.5 text-slate-400 dark:text-slate-500 text-xs">
                        {relativeDate(lead.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View
                          </Link>
                          {canDelete && (
                            <>
                              <span className="text-slate-200 dark:text-slate-600">|</span>
                              <button
                                type="button"
                                onClick={() => setToDelete(lead)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && total > PER_PAGE && (
          <div className="border-t border-slate-100 dark:border-slate-700 px-4">
            <Pagination currentPage={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onPage={setPage} />
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Delete lead"
          message={`Delete the lead from "${toDelete.name}"? This can be restored later.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
