'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getOperationTypes, createOperationType, updateOperationType, deleteOperationType } from '@/lib/api'
import type { OperationType } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { IconTag, IconSearch, IconPencil, IconTrash } from '@/components/ui/icons'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  opType?: OperationType | null
  existing: OperationType[]
  onSave: (data: { name: string; slug: string }) => Promise<void>
  onClose: () => void
}

function OpTypeModal({ opType, existing, onSave, onClose }: ModalProps) {
  const [name,  setName]  = useState(opType?.name ?? '')
  const [slug,  setSlug]  = useState(opType?.slug ?? '')
  const [auto,  setAuto]  = useState(!opType)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleName(v: string) { setName(v); if (auto) setSlug(slugify(v)) }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const trimmedName = name.trim()
    const isDuplicate = existing.some(
      o => o.name.toLowerCase() === trimmedName.toLowerCase() && o.id !== opType?.id
    )
    if (isDuplicate) { setError(`"${trimmedName}" already exists`); return }
    setSaving(true)
    try { await onSave({ name: trimmedName, slug: slug.trim() }); onClose() }
    catch (err) { setError(err instanceof Error ? err.message : 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">{opType ? 'Edit Operation Type' : 'New Operation Type'}</h3>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="op-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input id="op-name" type="text" required value={name} onChange={e => handleName(e.target.value)} className={inp} placeholder="e.g. Buy" />
          </div>
          <div>
            <label htmlFor="op-slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Slug <span className="text-red-400">*</span>
              <span className="ml-2 text-xs text-slate-400 font-normal normal-case tracking-normal">auto-generated from name</span>
            </label>
            <input
              id="op-slug"
              type="text"
              required
              value={slug}
              onChange={e => { setAuto(false); setSlug(e.target.value) }}
              className={inp + ' font-mono'}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OperationTypesPage() {
  const [opTypes,  setOpTypes]  = useState<OperationType[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<OperationType | null | undefined>(undefined)
  const [toDelete, setToDelete] = useState<OperationType | null>(null)
  const [acting,   setActing]   = useState(false)
  const [search,   setSearch]   = useState('')

  function load() {
    setLoading(true)
    getOperationTypes().then(res => setOpTypes(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleSave(data: { name: string; slug: string }) {
    if (editing && editing.id) { await updateOperationType(editing.id, data) }
    else { await createOperationType(data) }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteOperationType(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  const filtered = opTypes.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.slug.includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search operation types…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0">
          + New Type
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Slug</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-24" /></td>
                  <td className="px-4 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-16" /></td>
                  <td className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-16" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400">{search ? 'No operation types match your search.' : 'No operation types yet.'}</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <IconTag size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-100">{o.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 font-mono text-xs">{o.slug}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditing(o)} title="Edit type" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <IconPencil size={14} />
                    </button>
                    <button type="button" onClick={() => setToDelete(o)} title="Delete type" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <IconTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <OpTypeModal opType={editing} existing={opTypes} onSave={handleSave} onClose={() => setEditing(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete operation type"
          message={`Delete "${toDelete.name}"? Properties linked to it may be affected.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
