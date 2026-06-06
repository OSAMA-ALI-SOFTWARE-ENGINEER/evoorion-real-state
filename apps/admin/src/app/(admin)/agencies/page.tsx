'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  getAgencies, createAgency, updateAgency, deleteAgency,
  getAgents,   createAgent,  updateAgent,  deleteAgent, restoreAgent,
} from '@/lib/api'
import type { Agency, Agent } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

// ── shared input style ────────────────────────────────────────────────────────
const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white'

// ── Agency modal ──────────────────────────────────────────────────────────────
function AgencyModal({
  agency, agencies, onSave, onClose,
}: {
  agency?: Agency | null
  agencies: Agency[]
  onSave: (data: Partial<Agency>) => Promise<void>
  onClose: () => void
}) {
  const [name,  setName]  = useState(agency?.name ?? '')
  const [email, setEmail] = useState(agency?.contact_email ?? '')
  const [phone, setPhone] = useState(agency?.phone ?? '')
  const [addr,  setAddr]  = useState(agency?.address ?? '')
  const [logo,  setLogo]  = useState(agency?.logo_url ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        contact_email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: addr.trim() || undefined,
        logo_url: logo.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5">
          {agency ? 'Edit Agency' : 'New Agency'}
        </h3>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="+971 4 000 0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
            <input type="text" value={addr} onChange={e => setAddr(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo URL</label>
            <input type="url" value={logo} onChange={e => setLogo(e.target.value)} className={inp} placeholder="https://…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Agent modal ───────────────────────────────────────────────────────────────
function AgentModal({
  agent, agencies, onSave, onClose,
}: {
  agent?: Agent | null
  agencies: Agency[]
  onSave: (data: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const isEdit = !!agent
  const [name,      setName]      = useState(agent?.user?.name ?? '')
  const [email,     setEmail]     = useState(agent?.user?.email ?? '')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [agencyId,  setAgencyId]  = useState<string>(String(agent?.agency_id ?? ''))
  const [phone,     setPhone]     = useState(agent?.phone ?? '')
  const [whatsapp,  setWhatsapp]  = useState(agent?.whatsapp ?? '')
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!isEdit && password !== confirm) { setError('Passwords do not match'); return }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        name:      name.trim(),
        agency_id: agencyId ? Number(agencyId) : null,
        phone:     phone.trim() || null,
        whatsapp:  whatsapp.trim() || null,
      }
      if (!isEdit) {
        data.email              = email.trim()
        data.password           = password
        data.password_confirmation = confirm
      }
      await onSave(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-slate-800 mb-5">
          {isEdit ? 'Edit Agent' : 'New Agent'}
        </h3>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inp} />
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password <span className="text-red-400">*</span></label>
                <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
                <input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} className={inp} />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Agency</label>
            <select value={agencyId} onChange={e => setAgencyId(e.target.value)} className={inp}>
              <option value="">— None —</option>
              {agencies.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="+971 50 000 0000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp</label>
            <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inp} placeholder="+971 50 000 0000" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Agencies tab ──────────────────────────────────────────────────────────────
function AgenciesTab() {
  const [agencies,  setAgencies]  = useState<Agency[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [editing,   setEditing]   = useState<Agency | null | undefined>(undefined)
  const [toDelete,  setToDelete]  = useState<Agency | null>(null)
  const [acting,    setActing]    = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getAgencies(search ? { search } : undefined)
      .then(res => setAgencies(res.data ?? []))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(load, [load])

  async function handleSave(data: Partial<Agency>) {
    if (editing?.id) {
      await updateAgency(editing.id, data)
    } else {
      await createAgency(data)
    }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteAgency(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search agencies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:border-[#C9A84C]"
        />
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0"
        >
          + New Agency
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Agency</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Agents</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : agencies.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No agencies found.</td></tr>
            ) : agencies.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-800">{a.name}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{a.contact_email ?? '—'}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{a.phone ?? '—'}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    {a.agents_count ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditing(a)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                    <span className="text-slate-200">|</span>
                    <button type="button" onClick={() => setToDelete(a)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <AgencyModal agency={editing} agencies={agencies} onSave={handleSave} onClose={() => setEditing(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete agency"
          message={`Delete "${toDelete.name}"? This will fail if the agency has active agents.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}

// ── Agents tab ────────────────────────────────────────────────────────────────
function AgentsTab({ agencies }: { agencies: Agency[] }) {
  const [agents,    setAgents]    = useState<Agent[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [editing,   setEditing]   = useState<Agent | null | undefined>(undefined)
  const [toDelete,  setToDelete]  = useState<Agent | null>(null)
  const [toRestore, setToRestore] = useState<Agent | null>(null)
  const [acting,    setActing]    = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getAgents(search ? { search } : undefined)
      .then(res => setAgents(res.data ?? []))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(load, [load])

  async function handleSave(data: Record<string, unknown>) {
    if (editing?.id) {
      await updateAgent(editing.id, data as Parameters<typeof updateAgent>[1])
    } else {
      await createAgent(data as Parameters<typeof createAgent>[0])
    }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteAgent(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Deactivate failed') }
    finally { setActing(false) }
  }

  async function confirmRestore() {
    if (!toRestore) return
    setActing(true)
    try { await restoreAgent(toRestore.id); setToRestore(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Restore failed') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search agents…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:border-[#C9A84C]"
        />
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0"
        >
          + New Agent
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Agency</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : agents.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No agents found.</td></tr>
            ) : agents.map(a => {
              const inactive = !!a.deleted_at
              return (
                <tr key={a.id} className={`hover:bg-slate-50 ${inactive ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{a.user?.name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{a.user?.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{a.agency?.name ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{a.phone ?? '—'}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{a.whatsapp ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      inactive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {inactive ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {!inactive && (
                        <>
                          <button type="button" onClick={() => setEditing(a)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                          <span className="text-slate-200">|</span>
                          <button type="button" onClick={() => setToDelete(a)} className="text-xs text-red-500 hover:text-red-600 font-medium">Deactivate</button>
                        </>
                      )}
                      {inactive && (
                        <button type="button" onClick={() => setToRestore(a)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Restore</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <AgentModal agent={editing} agencies={agencies} onSave={handleSave} onClose={() => setEditing(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Deactivate agent"
          message={`Deactivate "${toDelete.user?.name}"? They will lose access to the admin panel.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
      {toRestore && (
        <ConfirmModal
          title="Restore agent"
          message={`Restore "${toRestore.user?.name}" and re-enable their access?`}
          onConfirm={confirmRestore}
          onCancel={() => setToRestore(null)}
          loading={acting}
        />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AgenciesPage() {
  const [tab, setTab] = useState<'agencies' | 'agents'>('agencies')
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    getAgencies().then(res => setAgencies(res.data ?? []))
  }, [])

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['agencies', 'agents'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
              tab === t
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {t === 'agencies' ? 'Agencies' : 'Agents'}
          </button>
        ))}
      </div>

      {tab === 'agencies' ? (
        <AgenciesTab />
      ) : (
        <AgentsTab agencies={agencies} />
      )}
    </div>
  )
}
