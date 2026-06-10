'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  getAgencies, deleteAgency,
  getAgents, deleteAgent, restoreAgent,
} from '@/lib/api'
import type { Agency, Agent } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CustomSelect } from '@/components/ui/CustomSelect'
import {
  IconBriefcase, IconGrid, IconList, IconPhone, IconMail,
  IconSearch, IconUser, IconPencil, IconTrash, IconRotateCcw,
} from '@/components/ui/icons'

// ── Agency card ───────────────────────────────────────────────────────────────

function AgencyCard({ agency, onDelete }: { agency: Agency; onDelete: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
      <div className="h-24 bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
        {agency.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agency.logo_url} alt={agency.name} className="max-h-16 max-w-[80%] object-contain" />
        ) : (
          <IconBriefcase size={32} className="text-slate-300 dark:text-slate-600" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{agency.name}</p>
        {agency.contact_email && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-0.5">
            <IconMail size={11} /> {agency.contact_email}
          </p>
        )}
        {agency.phone && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
            <IconPhone size={11} /> {agency.phone}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <span className="text-xs text-slate-400">{agency.agents_count ?? 0} agent{(agency.agents_count ?? 0) !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <Link href={`/agencies/${agency.id}/edit`} title="Edit agency" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <IconPencil size={13} />
            </Link>
            <button type="button" onClick={onDelete} title="Delete agency" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <IconTrash size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Agent card ────────────────────────────────────────────────────────────────

function AgentCard({ agent, onDelete, onRestore }: { agent: Agent; onDelete: () => void; onRestore: () => void }) {
  const inactive = !!agent.deleted_at
  const name     = agent.user?.name ?? 'Agent'
  const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col ${inactive ? 'opacity-60' : ''}`}>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-[#C9A84C]/15 flex items-center justify-center shrink-0 overflow-hidden">
            {agent.user?.avatar_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={agent.user.avatar_url} alt={name} className="w-full h-full object-cover" />
              : <span className="text-[#C9A84C] font-bold text-sm">{initials}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{agent.user?.email}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${inactive ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
            {inactive ? 'Inactive' : 'Active'}
          </span>
        </div>
        {agent.agency && <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><IconBriefcase size={11} /> {agent.agency.name}</p>}
        {agent.phone  && <p className="text-xs text-slate-400 flex items-center gap-1"><IconPhone size={11} /> {agent.phone}</p>}
        <div className="flex gap-1 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          {inactive ? (
            <button type="button" onClick={onRestore} title="Restore agent" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              <IconRotateCcw size={12} /> Restore
            </button>
          ) : (
            <>
              <Link href={`/agencies/agents/${agent.id}/edit`} title="Edit agent" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <IconPencil size={12} /> Edit
              </Link>
              <button type="button" onClick={onDelete} title="Deactivate agent" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <IconTrash size={12} /> Deactivate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Agencies tab ──────────────────────────────────────────────────────────────

function AgenciesTab() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [view,     setView]     = useState<'table' | 'cards'>('table')
  const [toDelete, setToDelete] = useState<Agency | null>(null)
  const [acting,   setActing]   = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getAgencies(search ? { search } : undefined).then(res => setAgencies(res.data ?? [])).finally(() => setLoading(false))
  }, [search])
  useEffect(load, [load])

  async function confirmDelete() {
    if (!toDelete) return; setActing(true)
    try { await deleteAgency(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" placeholder="Search agencies…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400" />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <button type="button" onClick={() => setView('table')} className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Table view"><IconList size={15} /></button>
          <button type="button" onClick={() => setView('cards')} className={`p-1.5 rounded-md transition-colors ${view === 'cards' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Cards view"><IconGrid size={15} /></button>
        </div>
        <Link href="/agencies/new" className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0">
          + New Agency
        </Link>
      </div>

      {view === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agents</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded" /></td>)}
                  </tr>
                ))
              ) : agencies.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No agencies found.</td></tr>
              ) : agencies.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {a.logo_url
                        ? <div className="w-7 h-7 rounded overflow-hidden bg-slate-50 dark:bg-slate-700 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={a.logo_url} alt="" className="w-full h-full object-contain" />
                          </div>
                        : <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0"><IconBriefcase size={13} className="text-slate-400" /></div>
                      }
                      <span className="font-medium text-slate-800 dark:text-slate-100">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{a.contact_email ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{a.phone ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs max-w-[180px] truncate">{a.address ?? '—'}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">{a.agents_count ?? 0}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link href={`/agencies/${a.id}/edit`} title="Edit agency" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <IconPencil size={14} />
                      </Link>
                      <button type="button" onClick={() => setToDelete(a)} title="Delete agency" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse h-52" />)}
          </div>
        ) : agencies.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No agencies found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agencies.map(a => <AgencyCard key={a.id} agency={a} onDelete={() => setToDelete(a)} />)}
          </div>
        )
      )}

      {toDelete && <ConfirmModal title="Delete agency" message={`Delete "${toDelete.name}"? This will fail if the agency has active agents.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} loading={acting} />}
    </div>
  )
}

// ── Agents tab ────────────────────────────────────────────────────────────────

function AgentsTab({ agencies }: { agencies: Agency[] }) {
  const [agents,       setAgents]       = useState<Agent[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [agencyFilter, setAgencyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [view,         setView]         = useState<'table' | 'cards'>('table')
  const [toDelete,     setToDelete]     = useState<Agent | null>(null)
  const [toRestore,    setToRestore]    = useState<Agent | null>(null)
  const [acting,       setActing]       = useState(false)

  const agencyOptions = [
    { value: '', label: 'All agencies' },
    ...agencies.map(a => ({ value: String(a.id), label: a.name, icon: <IconBriefcase size={13} /> })),
  ]
  const statusOptions = [
    { value: '',         label: 'All statuses' },
    { value: 'active',   label: 'Active',   icon: <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> },
    { value: 'inactive', label: 'Inactive', icon: <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> },
  ]

  const load = useCallback(() => {
    setLoading(true)
    getAgents(search ? { search } : undefined).then(res => setAgents(res.data ?? [])).finally(() => setLoading(false))
  }, [search])
  useEffect(load, [load])

  const filtered = agents.filter(a => {
    if (agencyFilter && String(a.agency_id) !== agencyFilter) return false
    if (statusFilter === 'active'   && !!a.deleted_at) return false
    if (statusFilter === 'inactive' && !a.deleted_at)  return false
    return true
  })

  async function confirmDelete() {
    if (!toDelete) return; setActing(true)
    try { await deleteAgent(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Deactivate failed') }
    finally { setActing(false) }
  }

  async function confirmRestore() {
    if (!toRestore) return; setActing(true)
    try { await restoreAgent(toRestore.id); setToRestore(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Restore failed') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="search" placeholder="Search agents…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400" />
        </div>
        <CustomSelect value={agencyFilter} onChange={setAgencyFilter} options={agencyOptions} placeholder="All agencies" searchable={agencies.length > 5} className="w-48" />
        <CustomSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All statuses" className="w-40" />
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <button type="button" onClick={() => setView('table')} className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Table view"><IconList size={15} /></button>
          <button type="button" onClick={() => setView('cards')} className={`p-1.5 rounded-md transition-colors ${view === 'cards' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Cards view"><IconGrid size={15} /></button>
        </div>
        <Link href="/agencies/agents/new" className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0">
          + New Agent
        </Link>
      </div>

      {view === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-24" /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No agents found.</td></tr>
              ) : filtered.map(a => {
                const inactive = !!a.deleted_at
                const name     = a.user?.name ?? '—'
                const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                return (
                  <tr key={a.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${inactive ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 flex items-center justify-center shrink-0 overflow-hidden">
                          {a.user?.avatar_url
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={a.user.avatar_url} alt={name} className="w-full h-full object-cover" />
                            : <span className="text-[#C9A84C] text-xs font-bold">{initials}</span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{name}</p>
                          <p className="text-xs text-slate-400">{a.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{a.agency?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{a.phone ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{a.whatsapp ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${inactive ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                        {inactive ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {!inactive ? (
                          <>
                            <Link href={`/agencies/agents/${a.id}/edit`} title="Edit agent" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                              <IconPencil size={14} />
                            </Link>
                            <button type="button" onClick={() => setToDelete(a)} title="Deactivate agent" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <IconTrash size={14} />
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setToRestore(a)} title="Restore agent" className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                            <IconRotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No agents found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(a => <AgentCard key={a.id} agent={a} onDelete={() => setToDelete(a)} onRestore={() => setToRestore(a)} />)}
          </div>
        )
      )}

      {toDelete  && <ConfirmModal title="Deactivate agent" message={`Deactivate "${toDelete.user?.name}"? They will lose admin access.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} loading={acting} />}
      {toRestore && <ConfirmModal title="Restore agent" message={`Restore "${toRestore.user?.name}" and re-enable their access?`} onConfirm={confirmRestore} onCancel={() => setToRestore(null)} loading={acting} />}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgenciesPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'agencies' | 'agents'>('agencies')

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'agents') {
      setTab('agents')
    }
  }, [])
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    getAgencies().then(res => setAgencies(res.data ?? []))
  }, [])

  function switchTab(t: 'agencies' | 'agents') {
    setTab(t)
    router.replace(`/agencies${t === 'agents' ? '?tab=agents' : ''}`, { scroll: false })
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {(['agencies', 'agents'] as const).map(t => (
          <button key={t} type="button" onClick={() => switchTab(t)}
            className={['px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
              tab === t ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            ].join(' ')}>
            {t === 'agencies' ? 'Agencies' : 'Agents'}
          </button>
        ))}
      </div>
      {tab === 'agencies' ? <AgenciesTab /> : <AgentsTab agencies={agencies} />}
    </div>
  )
}
