'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getLeads, deleteLead, exportLeadsCSV } from '@/lib/api'
import type { Lead, LeadStatus, LeadSource } from '@/types'
import { LeadStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useAuth } from '@/context/AuthContext'

const PER_PAGE = 20

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

  const [leads,    setLeads]    = useState<Lead[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [source,   setSource]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [toDelete, setToDelete] = useState<Lead | null>(null)
  const [acting,   setActing]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (p: number, s: string, st: string, src: string) => {
    setLoading(true); setError('')
    try {
      const res = await getLeads({ page: p, per_page: PER_PAGE, search: s || undefined, status: st || undefined, source: src || undefined })
      setLeads(res.data ?? [])
      setTotal(res.meta?.pagination.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search, status, source) }, [page, status, source, load])

  function handleSearch(val: string) {
    setSearch(val); setPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => load(1, val, status, source), 400)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try {
      await deleteLead(toDelete.id)
      setToDelete(null)
      load(page, search, status, source)
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
    <div className="max-w-7xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{total} leads</p>
        {canDelete && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
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
          className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white"
        />
        <select
          aria-label="Filter by status"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] bg-white text-slate-700"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
        <select
          aria-label="Filter by source"
          value={source}
          onChange={e => { setSource(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] bg-white text-slate-700"
        >
          <option value="">All sources</option>
          {(Object.entries(SOURCE_LABELS) as [LeadSource, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Received</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-3.5 bg-slate-100 rounded w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No leads found.</td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-slate-400">{lead.phone}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <LeadStatusBadge status={lead.status as LeadStatus} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs">
                        {SOURCE_LABELS[lead.source] ?? lead.source}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">
                        {lead.assignee ? lead.assignee.name : <span className="text-amber-500">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs">
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
                              <span className="text-slate-200">|</span>
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
          <div className="border-t border-slate-100 px-4">
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
