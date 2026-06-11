'use client'

import { useCallback, useEffect, useState } from 'react'
import { getActivityLogs } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Pagination } from '@/components/ui/Pagination'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { IconActivity, IconList, IconTimeline } from '@/components/ui/icons'

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
  created:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  updated:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  deleted:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  restored: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

const ACTION_DOT: Record<string, string> = {
  created:  'bg-emerald-400',
  updated:  'bg-blue-400',
  deleted:  'bg-red-400',
  restored: 'bg-purple-400',
}

const VIEW_KEY = 'evoorion_logs_view'

function fmtTime(d: string) {
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtTimeShort(d: string) {
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

function shortModel(m: string) {
  return m.split('\\').pop() ?? m
}

function ChangesCell({ changes }: { changes: ActivityLog['changes'] }) {
  const [expanded, setExpanded] = useState(false)
  if (!changes || !Object.keys(changes).length) return <span className="text-slate-300 dark:text-slate-600">—</span>
  const keys = Object.keys(changes)
  if (!expanded) {
    return (
      <button type="button" onClick={() => setExpanded(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
            <span className="font-medium text-slate-600 dark:text-slate-300">{k}:</span>{' '}
            <span className="text-red-500 line-through">{JSON.stringify(c.old)}</span>{' → '}
            <span className="text-emerald-600 dark:text-emerald-400">{JSON.stringify(c.new)}</span>
          </div>
        )
      })}
      <button type="button" onClick={() => setExpanded(false)} className="text-[11px] text-slate-400 hover:text-slate-600">Collapse</button>
    </div>
  )
}

// Group logs by date for timeline view
function groupByDate(logs: ActivityLog[]) {
  const groups: Record<string, ActivityLog[]> = {}
  for (const log of logs) {
    const d = new Date(log.created_at).toDateString()
    if (!groups[d]) groups[d] = []
    groups[d].push(log)
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }))
}

const ACTION_OPTIONS = [
  { value: '',          label: 'All actions' },
  { value: 'created',   label: 'Created' },
  { value: 'updated',   label: 'Updated' },
  { value: 'deleted',   label: 'Deleted' },
  { value: 'restored',  label: 'Restored' },
]

export default function ActivityLogsPage() {
  const { user: me } = useAuth()
  const [logs,      setLogs]      = useState<ActivityLog[]>([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)
  const [lastPage,  setLastPage]  = useState(1)
  const [action,    setAction]    = useState('')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [view,      setView]      = useState<'table' | 'timeline'>('table')

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY)
    if (stored === 'table' || stored === 'timeline') setView(stored as 'table' | 'timeline')
  }, [])

  function toggleView(v: 'table' | 'timeline') { setView(v); localStorage.setItem(VIEW_KEY, v) }

  const load = useCallback(() => {
    setLoading(true)
    const params: Parameters<typeof getActivityLogs>[0] = { page, per_page: 25 }
    if (action)   params.action    = action
    if (dateFrom) params.date_from = dateFrom
    if (dateTo)   params.date_to   = dateTo
    // non-super-admins only see their own logs
    if (me && me.role !== 'super_admin') params.user_id = me.id
    getActivityLogs(params)
      .then(res => {
        setLogs((res.data as unknown as ActivityLog[]) ?? [])
        const meta = res.meta?.pagination
        if (meta) { setTotal(meta.total); setLastPage(meta.last_page) }
      })
      .finally(() => setLoading(false))
  }, [page, action, dateFrom, dateTo, me])

  useEffect(load, [load])

  const grouped = groupByDate(logs)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="w-44">
          <CustomSelect value={action} onChange={v => { setAction(v); setPage(1) }} options={ACTION_OPTIONS} />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            title="From date"
            aria-label="From date"
            onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100"
          />
          <span className="text-slate-400 text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            title="To date"
            aria-label="To date"
            onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg ml-auto">
          <button type="button" onClick={() => toggleView('table')} title="Table view"
            className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`}>
            <IconList size={15} />
          </button>
          <button type="button" onClick={() => toggleView('timeline')} title="Timeline view"
            className={`p-1.5 rounded-md transition-colors ${view === 'timeline' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`}>
            <IconTimeline size={15} />
          </button>
        </div>

        <span className="text-slate-400 dark:text-slate-500 text-sm">{total.toLocaleString()} logs</span>
      </div>

      {/* ── Table view ── */}
      {view === 'table' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                {me?.role === 'super_admin' && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Changes</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: me?.role === 'super_admin' ? 6 : 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={me?.role === 'super_admin' ? 6 : 5} className="px-5 py-8 text-center text-slate-400">
                    <IconActivity size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No activity logs found.
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtTime(log.created_at)}</td>
                  {me?.role === 'super_admin' && (
                    <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200">{log.user?.name ?? 'System'}</td>
                  )}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${ACTION_COLORS[log.action] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                    {shortModel(log.model_type)}
                    {log.model_id != null && <span className="ml-1 text-slate-400">#{log.model_id}</span>}
                  </td>
                  <td className="px-4 py-3.5 max-w-xs"><ChangesCell changes={log.changes} /></td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 dark:text-slate-500 font-mono">{log.ip_address ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Timeline view ── */}
      {view === 'timeline' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <IconActivity size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-400 text-sm">No activity logs found.</p>
            </div>
          ) : grouped.map(({ date, items }) => (
            <div key={date}>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                {fmtDate(items[0].created_at)}
                <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </p>
              <div className="relative pl-8">
                {/* vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                <div className="space-y-3">
                  {items.map(log => (
                    <div key={log.id} className="relative">
                      {/* dot */}
                      <div className={`absolute -left-5 top-2.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${ACTION_DOT[log.action] ?? 'bg-slate-300'}`} />

                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${ACTION_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                              {log.action}
                            </span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {shortModel(log.model_type)}
                              {log.model_id != null && <span className="text-slate-400 ml-1 font-normal">#{log.model_id}</span>}
                            </span>
                            {me?.role === 'super_admin' && log.user && (
                              <span className="text-xs text-slate-400 dark:text-slate-500">by {log.user.name}</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{fmtTimeShort(log.created_at)}</span>
                        </div>

                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <ChangesCell changes={log.changes} />
                          </div>
                        )}

                        {log.ip_address && (
                          <p className="mt-2 text-[11px] text-slate-400 font-mono">{log.ip_address}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} perPage={25} onPage={setPage} />
      )}
    </div>
  )
}
