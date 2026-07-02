'use client'

import { useEffect, useState, use, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  getLead, updateLead, getLeadNotes, addLeadNote, deleteLeadNote,
  getLeadTasks, addLeadTask, completeLeadTask, deleteLeadTask, getUsers,
} from '@/lib/api'
import type { Lead, LeadNote, LeadTask, LeadStatus, AdminUser } from '@/types'
import { LeadStatusBadge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'closed', 'lost']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

// ── Shared card wrapper ───────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  )
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
    <Card>
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notes</h3>
      </div>
      <form onSubmit={submit} className="p-4 border-b border-slate-100 dark:border-slate-700">
        <textarea
          rows={3}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Add a note…"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400"
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
      <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
        {loading ? (
          <li className="p-4 text-sm text-slate-400 animate-pulse">Loading…</li>
        ) : notes.length === 0 ? (
          <li className="p-4 text-sm text-slate-400">No notes yet.</li>
        ) : notes.map(n => (
          <li key={n.id} className="p-4 group">
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap flex-1">{n.note}</p>
              <button
                type="button"
                onClick={() => remove(n.id)}
                className="text-slate-300 dark:text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">{n.user?.name ?? 'Unknown'} · {fmtDate(n.created_at)}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

// ── Tasks panel ───────────────────────────────────────────────────────────────

function TasksPanel({ leadId }: { leadId: number }) {
  const [tasks,    setTasks]    = useState<LeadTask[]>([])
  const [loading,  setLoading]  = useState(true)
  const [title,    setTitle]    = useState('')
  const [dueDate,  setDueDate]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    getLeadTasks(leadId)
      .then(res => setTasks(res.data ?? []))
      .finally(() => setLoading(false))
  }, [leadId])

  async function submitTask(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      const res = await addLeadTask(leadId, { title: title.trim(), due_date: dueDate || null })
      setTasks(prev => [...prev, res.data])
      setTitle('')
      setDueDate('')
      setShowForm(false)
    } finally { setSaving(false) }
  }

  async function toggleComplete(task: LeadTask) {
    const res = await completeLeadTask(leadId, task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? res.data : t))
  }

  async function removeTask(taskId: number) {
    await deleteLeadTask(leadId, taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const pending   = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  return (
    <Card>
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Tasks {tasks.length > 0 && <span className="ml-1.5 text-xs font-normal text-slate-400">{pending.length} open</span>}
        </h3>
        <button
          type="button"
          onClick={() => setShowForm(f => !f)}
          className="text-xs text-[#C9A84C] hover:text-[#D4B668] font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add task'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitTask} className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title…"
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] disabled:opacity-50 text-slate-900 text-sm font-semibold transition-colors"
            >
              {saving ? '…' : 'Add'}
            </button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {loading ? (
          <li className="p-4 text-sm text-slate-400 animate-pulse">Loading…</li>
        ) : tasks.length === 0 ? (
          <li className="p-4 text-sm text-slate-400">No tasks yet.</li>
        ) : (
          <>
            {pending.map(t => <TaskRow key={t.id} task={t} leadId={leadId} onToggle={toggleComplete} onDelete={removeTask} />)}
            {completed.map(t => <TaskRow key={t.id} task={t} leadId={leadId} onToggle={toggleComplete} onDelete={removeTask} />)}
          </>
        )}
      </ul>
    </Card>
  )
}

function TaskRow({ task, leadId, onToggle, onDelete }: {
  task: LeadTask
  leadId: number
  onToggle: (t: LeadTask) => void
  onDelete: (id: number) => void
}) {
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    try { await onToggle(task) } finally { setToggling(false) }
  }

  const overdue = !task.completed && task.due_date && new Date(task.due_date) < new Date()

  return (
    <li className="flex items-start gap-3 px-4 py-3 group">
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className="mt-0.5 shrink-0 disabled:opacity-50"
        title={task.completed ? 'Reopen' : 'Mark complete'}
      >
        <span className={`flex w-4 h-4 rounded-full border-2 items-center justify-center transition-colors ${
          task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-500 hover:border-emerald-400'
        }`}>
          {task.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {task.title}
        </p>
        {task.due_date && (
          <p className={`text-xs mt-0.5 ${overdue ? 'text-red-400' : 'text-slate-400'}`}>
            {overdue ? 'Overdue · ' : ''}{new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="text-slate-300 dark:text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
      >
        ✕
      </button>
    </li>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000'

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const leadId  = Number(id)
  const router  = useRouter()
  const { user } = useAuth()

  const canAssign = user?.role === 'manager' || user?.role === 'super_admin'

  const [lead,       setLead]       = useState<Lead | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [status,     setStatus]     = useState<LeadStatus>('new')
  const [staffUsers, setStaffUsers] = useState<AdminUser[]>([])
  const [assigning,  setAssigning]  = useState(false)

  useEffect(() => {
    getLead(leadId)
      .then(res => { setLead(res.data); setStatus(res.data.status) })
      .catch(err => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [leadId])

  useEffect(() => {
    if (canAssign) {
      getUsers().then(res => setStaffUsers((res.data ?? []).filter(u => u.is_active && ['super_admin', 'manager', 'agent'].includes(u.role))))
    }
  }, [canAssign])

  async function saveStatus(newStatus: LeadStatus) {
    if (!lead || saving) return
    setSaving(true)
    try {
      const res = await updateLead(lead.id, { status: newStatus })
      setLead(res.data)
      setStatus(res.data.status)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally { setSaving(false) }
  }

  async function saveAssignment(userId: number | null) {
    if (!lead || assigning) return
    setAssigning(true)
    try {
      const res = await updateLead(lead.id, { assigned_to: userId } as never)
      setLead(res.data)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Assignment failed')
    } finally { setAssigning(false) }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-96" />
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-56" />
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-40" />
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => router.push('/leads')}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          ← Leads
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-700 dark:text-slate-200 font-medium">{lead.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — info + notes + tasks */}
        <div className="lg:col-span-2 space-y-5">

          {/* Lead info card */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">{lead.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{lead.email}</p>
                {lead.phone    && <p className="text-sm text-slate-500 dark:text-slate-400">{lead.phone}</p>}
                {lead.whatsapp && <p className="text-sm text-slate-500 dark:text-slate-400">WhatsApp: {lead.whatsapp}</p>}
              </div>
              <LeadStatusBadge status={lead.status as LeadStatus} />
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-5">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">Source</p>
                <p className="text-slate-700 dark:text-slate-200 capitalize">{lead.source}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">Received</p>
                <p className="text-slate-700 dark:text-slate-200">{fmtDate(lead.created_at)}</p>
              </div>
              {lead.budget_min != null && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">Budget</p>
                  <p className="text-slate-700 dark:text-slate-200">
                    AED {Number(lead.budget_min).toLocaleString()}
                    {lead.budget_max ? ` – ${Number(lead.budget_max).toLocaleString()}` : '+'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">Assigned to</p>
                {canAssign ? (
                  <div className="relative">
                    <select
                      disabled={assigning}
                      value={lead.assigned_user?.id ?? ''}
                      onChange={e => saveAssignment(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full appearance-none bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 pr-7 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      <option value="">— Unassigned —</option>
                      {staffUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                    {assigning ? (
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 12 12">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                ) : (
                  lead.assigned_user?.name
                    ? <p className="text-slate-700 dark:text-slate-200">{lead.assigned_user.name}</p>
                    : <p className="text-amber-500">Unassigned</p>
                )}
              </div>
            </div>

            {lead.message && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-4 py-3 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-600/50">
                {lead.message}
              </div>
            )}
          </Card>

          <NotesPanel leadId={lead.id} />
          <TasksPanel leadId={lead.id} />
        </div>

        {/* Right — status + property */}
        <div className="space-y-5">
          {/* Status picker */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Update Status</h3>
            <div className="space-y-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  disabled={saving}
                  onClick={() => saveStatus(s)}
                  className={[
                    'w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between',
                    status === s
                      ? 'bg-[#C9A84C]/15 text-[#9A7A2E] dark:text-[#C9A84C] border border-[#C9A84C]/40'
                      : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50',
                  ].join(' ')}
                >
                  <span className="capitalize">{s}</span>
                  {status === s && <span className="text-[#C9A84C]">✓</span>}
                </button>
              ))}
            </div>
            {saving && <p className="text-xs text-slate-400 mt-3 text-center">Saving…</p>}
          </Card>

          {/* Property interest */}
          {lead.property?.id ? (
            <Card className="overflow-hidden">
              {/* Cover image */}
              {(() => {
                const cover = lead.property.images?.find(i => i.is_primary) ?? lead.property.images?.[0]
                return cover ? (
                  <div className="h-40 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <img src={cover.url} alt={lead.property.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
                    </svg>
                  </div>
                )
              })()}

              <div className="p-5">
                <p className="text-xs font-medium text-[#C9A84C] uppercase tracking-wide mb-1">
                  {lead.property.type?.replace(/_/g, ' ')}
                  {lead.property.status && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      lead.property.status === 'available'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : lead.property.status === 'sold'
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }`}>{lead.property.status}</span>
                  )}
                </p>

                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-2">
                  {lead.property.title}
                </h3>

                {lead.property.price && (
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">
                    {lead.property.currency ?? 'AED'} {Number(lead.property.price).toLocaleString()}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {lead.property.bedrooms != null && (
                    <span>{lead.property.bedrooms} bed{lead.property.bedrooms !== 1 ? 's' : ''}</span>
                  )}
                  {lead.property.bathrooms != null && (
                    <span>{lead.property.bathrooms} bath{lead.property.bathrooms !== 1 ? 's' : ''}</span>
                  )}
                  {lead.property.area_sqft && (
                    <span>{Number(lead.property.area_sqft).toLocaleString()} sqft</span>
                  )}
                </div>

                {(lead.property.location || lead.property.area?.name) && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                    📍 {lead.property.location ?? lead.property.area?.name}
                  </p>
                )}

                <a
                  href={`${WEBSITE_URL}/properties/${lead.property?.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-2 rounded-lg border border-[#C9A84C]/50 text-[#C9A84C] text-xs font-semibold hover:bg-[#C9A84C]/10 transition-colors text-center"
                >
                  View property →
                </a>
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Property Interest</h3>
              <p className="text-xs text-slate-400">No specific property.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
