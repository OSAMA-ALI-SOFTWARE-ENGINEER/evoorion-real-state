'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getAreas, createArea, updateArea, deleteArea } from '@/lib/api'
import type { Area } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface ModalProps {
  area?: Area | null
  onSave: (data: { name: string; slug: string; description?: string }) => Promise<void>
  onClose: () => void
}

function AreaModal({ area, onSave, onClose }: ModalProps) {
  const [name,  setName]  = useState(area?.name ?? '')
  const [slug,  setSlug]  = useState(area?.slug ?? '')
  const [desc,  setDesc]  = useState(area?.description ?? '')
  const [auto,  setAuto]  = useState(!area)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleName(v: string) {
    setName(v)
    if (auto) setSlug(slugify(v))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave({ name: name.trim(), slug: slug.trim(), description: desc.trim() || undefined })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const cls = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5">{area ? 'Edit Area' : 'New Area'}</h3>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input type="text" required value={name} onChange={e => handleName(e.target.value)} className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug <span className="text-red-400">*</span></label>
            <input type="text" required value={slug} onChange={e => { setAuto(false); setSlug(e.target.value) }} className={cls + ' font-mono'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} className={cls + ' resize-none'} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AreasPage() {
  const [areas,    setAreas]    = useState<Area[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<Area | null | undefined>(undefined)
  const [toDelete, setToDelete] = useState<Area | null>(null)
  const [acting,   setActing]   = useState(false)

  function load() {
    setLoading(true)
    getAreas().then(res => setAreas(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleSave(data: { name: string; slug: string; description?: string }) {
    if (editing && editing.id) {
      await updateArea(editing.id, data)
    } else {
      await createArea(data)
    }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteArea(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm"
        >
          + New Area
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-32" /></td>
                  <td className="px-4 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                  <td className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                </tr>
              ))
            ) : areas.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400">No areas yet.</td></tr>
            ) : areas.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-800">{a.name}</td>
                <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{a.slug}</td>
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
        <AreaModal area={editing} onSave={handleSave} onClose={() => setEditing(undefined)} />
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
