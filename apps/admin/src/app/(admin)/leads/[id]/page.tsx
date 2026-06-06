'use client'

import { useEffect, useState, use, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  getLead, updateLead, getLeadNotes, addLeadNote, deleteLeadNote, getLeadTasks,
} from '@/lib/api'
import type { Lead, LeadNote, LeadTask, LeadStatus } from '@/types'
import { LeadStatusBadge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'closed', 'lost']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

// ── Notes panel ───────────────────────────────────────────────────────────────

function NotesPanel({ leadId }: { leadId: number }) {
  const [notes,   setNotes]   = useState<LeadNote[]>([])
  const [draft,   setDraft]   = useState('')
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    getLeadNotes(leadId)
      .then(res => setNotes((res.data ?? []).reverse()))
      .finally(() => setLoading(false))
  }, [leadId])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    setSaving(true)
    try {
      const res = await addLeadNote(leadId, draft.trim())
      setNotes(prev => [res.data, ...prev])
      setDraft('')
    } finally { setSaving(false) }
  }

  async function remove(noteId: number) {
    await deleteLeadNote(leadId, noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Notes</h3>
      </div>
      <form onSubmit={submit} className="p-4 border-b border-slate-100">
        <textarea
          rows={3}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Add a note…"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] resize-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || !draft.trim()}
            className="px-4 py-1.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] disabled:opacity-50 text-slate-900 text-sm font-semibold transition-colors"
          >
            {saving ? 'Adding…' : 'Add Note'}
          </button>
        </div>
      </form>
      <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {loading ? (
          <li className="p-4 text-sm text-slate-400 animate-pulse">Loading…</li>
        ) : notes.length === 0 ? (
          <li className="p-4 text-sm text-slate-400">No notes yet.</li>
        ) : notes.map(n => (
          <li key={n.id} className="p-4 group">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap flex-1">{n.note}</p>
              <button
                type="button"
                onClick={() => remove(n.id)}
                className="text-slate-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">{n.author?.name ?? 'Unknown'} · {fmtDate(n.created_at)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Tasks panel ───────────────────────────────────────────────────────────────

function TasksPanel({ leadId }: { leadId: number }) {
  const [tasks,   setTasks]   = useState<LeadTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeadTasks(leadId)
      .then(res => setTasks(res.data ?? []))
      .finally(() => setLoading(false))
  }, [leadId])

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Tasks</h3>
      </div>
      <ul className="divide-y divide-slate-100 min-h-[60px]">
        {loading ? (
          <li className="p-4 text-sm text-slate-400 animate-pulse">Loading…</li>
        ) : tasks.length === 0 ? (
          <li className="p-4 text-sm text-slate-400">No tasks yet.</li>
        ) : tasks.map(t => (
          <li key={t.id} className="flex items-center gap-3 px-4 py-3">
            <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${t.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.title}</p>
              {t.due_date && (
                <p className="text-xs text-slate-400">{new Date(t.due_date).toLocaleDateString()}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const leadId  = Number(id)
  const router  = useRouter()
  const { user } = useAuth()

  const canUpdate = user?.role !== 'agent' || true // agents can update their leads
  const canAssign = user?.role === 'manager' || user?.role === 'super_admin'

  const [lead,    setLead]    = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [status,  setStatus]  = useState<LeadStatus>('new')

  useEffect(() => {
    getLead(leadId)
      .then(res => { setLead(res.data); setStatus(res.data.status) })
      .catch(err => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [leadId])

  async function saveStatus(newStatus: LeadStatus) {
    if (!lead) return
    setSaving(true)
    try {
      const res = await updateLead(lead.id, { status: newStatus })
      setLead(res.data)
      setStatus(res.data.status)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="max-w-5xl animate-pulse space-y-4">
        <div className="h-6 bg-slate-100 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 h-96" />
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 h-48" />
            <div className="bg-white rounded-xl border border-slate-200 h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || 'Lead not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button type="button" onClick={() => router.push('/leads')} className="text-slate-400 hover:text-slate-600">
          ← Leads
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">{lead.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — info + notes + tasks */}
        <div className="lg:col-span-2 space-y-5">
          {/* Lead info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{lead.name}</h2>
                <p className="text-sm text-slate-500">{lead.email}</p>
                {lead.phone    && <p className="text-sm text-slate-500">{lead.phone}</p>}
                {lead.whatsapp && <p className="text-sm text-slate-500">WhatsApp: {lead.whatsapp}</p>}
              </div>
              <LeadStatusBadge status={lead.status as LeadStatus} />
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Source</p>
                <p className="text-slate-700 capitalize">{lead.source}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Received</p>
                <p className="text-slate-700">{fmtDate(lead.created_at)}</p>
              </div>
              {lead.budget_min != null && (
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Budget</p>
                  <p className="text-slate-700">
                    AED {Number(lead.budget_min).toLocaleString()}
                    {lead.budget_max ? ` – ${Number(lead.budget_max).toLocaleString()}` : '+'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs mb-0.5">Assigned to</p>
                <p className="text-slate-700">{lead.assignee?.name ?? <span className="text-amber-500">Unassigned</span>}</p>
              </div>
            </div>

            {lead.message && (
              <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-600 whitespace-pre-wrap">
                {lead.message}
              </div>
            )}
          </div>

          <NotesPanel leadId={lead.id} />
          <TasksPanel leadId={lead.id} />
        </div>

        {/* Right — status update */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Update Status</h3>
            <div className="space-y-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  disabled={saving}
                  onClick={() => saveStatus(s)}
                  className={[
                    'w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                    status === s
                      ? 'bg-[#C9A84C]/15 text-[#9A7A2E] border border-[#C9A84C]/30'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span className="capitalize">{s}</span>
                  {status === s && <span className="float-right text-[#C9A84C]">✓</span>}
                </button>
              ))}
            </div>
            {saving && <p className="text-xs text-slate-400 mt-2 text-center">Saving…</p>}
          </div>

          {lead.property && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Property Interest</h3>
              <p className="text-sm text-slate-600">{lead.property.title}</p>
              <p className="text-xs text-slate-400 font-mono">{lead.property.slug}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
