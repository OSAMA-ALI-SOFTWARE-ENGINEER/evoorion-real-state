'use client'

import { useCallback, useEffect, useState } from 'react'
import { getActivityLogs } from '@/lib/api'
import { Pagination } from '@/components/ui/Pagination'

interface ActivityLog {
  id: number
  user_id: number | null
  action: string
  model_type: string
  model_id: number | null
  changes: Record<string, { old: unknown; new: unknown }> | null
  ip_address: string | null
  created_at: string
  user?: { id: number; name: string } | null
}

const ACTION_COLORS: Record<string, string> = {
  created:  'bg-emerald-50 text-emerald-700',
  updated:  'bg-blue-50 text-blue-700',
  deleted:  'bg-red-50 text-red-700',
  restored: 'bg-purple-50 text-purple-700',
}

function fmtTime(d: string) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function shortModel(m: string) {
  return m.split('\\').pop() ?? m
}

function ChangesCell({ changes }: { changes: ActivityLog['changes'] }) {
  const [expanded, setExpanded] = useState(false)
  if (!changes || !Object.keys(changes).length) return <span className="text-slate-300">—</span>
  const keys = Object.keys(changes)
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        {keys.length} field{keys.length !== 1 ? 's' : ''} changed
      </button>
    )
  }
  return (
    <div className="space-y-1">
      {keys.map(k => {
        const c = changes[k]
        return (
          <div key={k} className="text-xs">
            <span className="font-medium text-slate-600">{k}:</span>{' '}
            <span className="text-red-500 line-through">{JSON.stringify(c.old)}</span>{' → '}
            <span className="text-emerald-600">{JSON.stringify(c.new)}</span>
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="text-[11px] text-slate-400 hover:text-slate-600"
      >
        Collapse
      </button>
    </div>
  )
}

export default function ActivityLogsPage() {
  const [logs,      setLogs]      = useState<ActivityLog[]>([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const [lastPage,  setLastPage]  = useState(1)
  const [action,    setAction]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params: Parameters<typeof getActivityLogs>[0] = { page, per_page: 20 }
    if (action)   params.action    = action
    if (dateFrom) params.date_from = dateFrom
    if (dateTo)   params.date_to   = dateTo
    getActivityLogs(params)
      .then(res => {
        setLogs((res.data as ActivityLog[]) ?? [])
        const meta = res.meta?.pagination
        if (meta) { setTotal(meta.total); setLastPage(meta.last_page) }
      })
      .finally(() => setLoading(false))
  }, [page, action, dateFrom, dateTo])

  useEffect(load, [load])

  function handleFilter() {
    setPage(1)
    load()
  }

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="">All actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="restored">Restored</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C]"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => { setDateTo(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C]"
        />
        <span className="text-slate-400 text-sm ml-auto">{total.toLocaleString()} logs</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Model</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Changes</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No activity logs found.</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{fmtTime(log.created_at)}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700">{log.user?.name ?? 'System'}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${ACTION_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">
                  {shortModel(log.model_type)}
                  {log.model_id != null && <span className="ml-1 text-slate-400">#{log.model_id}</span>}
                </td>
                <td className="px-4 py-3.5 max-w-xs"><ChangesCell changes={log.changes} /></td>
                <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{log.ip_address ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <Pagination page={page} lastPage={lastPage} onPage={setPage} />
      )}
    </div>
  )
}
