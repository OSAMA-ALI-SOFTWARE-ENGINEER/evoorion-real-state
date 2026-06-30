'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getRegions, createRegion, updateRegion, deleteRegion, type Region } from '@/lib/api'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { IconPencil, IconTrash, IconX } from '@/components/ui/icons'

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

function RegionModal({ region, onSave, onClose }: {
  region?: Region | null
  onSave: (data: Partial<Region>) => Promise<void>
  onClose: () => void
}) {
  const [code,      setCode]      = useState(region?.code ?? '')
  const [name,      setName]      = useState(region?.name ?? '')
  const [flag,      setFlag]      = useState(region?.flag ?? '')
  const [sortOrder, setSortOrder] = useState(region?.sort_order?.toString() ?? '0')
  const [isActive,  setIsActive]  = useState(region?.is_active ?? true)
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await onSave({
        code:       code.trim().toLowerCase().replace(/\s+/g, '-'),
        name:       name.trim(),
        flag:       flag.trim() || null,
        sort_order: parseInt(sortOrder) || 0,
        is_active:  isActive,
      })
      onClose()
    } catch (err) { setError(err instanceof Error ? err.message : 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {region ? 'Edit Region' : 'Add Region'}
          </h3>
          <button type="button" onClick={onClose} title="Close" className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <IconX size={15} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Code <span className="text-red-400">*</span>
              <span className="font-normal text-xs text-slate-400 ml-1">slug, e.g. italy</span>
            </label>
            <input type="text" required value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="italy"
              disabled={!!region}
              className={inp + ' font-mono' + (region ? ' opacity-60 cursor-not-allowed' : '')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input type="text" required value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Italy" className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Flag emoji
              </label>
              <input type="text" value={flag}
                onChange={e => setFlag(e.target.value)}
                placeholder="🇮🇹" className={inp + ' text-xl text-center'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Sort order
              </label>
              <input type="number" min={0} value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className={inp} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded accent-[#C9A84C]" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[#C9A84C] text-white font-semibold text-sm hover:bg-[#b8963e] disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save Region'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RegionsPage() {
  const [regions,    setRegions]    = useState<Region[]>([])
  const [loading,    setLoading]    = useState(true)
  const [editing,    setEditing]    = useState<Region | null | undefined>(undefined)
  const [deleting,   setDeleting]   = useState<Region | null>(null)

  async function load() {
    setLoading(true)
    try { setRegions((await getRegions()).data ?? []) }
    catch { /* ignore */ }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function handleSave(data: Partial<Region>) {
    if (editing?.id) {
      await updateRegion(editing.id, data)
    } else {
      await createRegion(data)
    }
    await load()
  }

  async function handleDelete(r: Region) {
    await deleteRegion(r.id)
    setDeleting(null)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Regions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage content regions. Properties, areas and blog posts can be tagged to a region.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="px-4 py-2.5 rounded-lg bg-[#C9A84C] text-white text-sm font-semibold hover:bg-[#b8963e] transition-colors"
        >
          + Add Region
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-700" />
          ))}
        </div>
      ) : regions.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400">No regions yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map(r => (
            <div key={r.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <span className="text-3xl leading-none select-none">{r.flag ?? '🌍'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{r.name}</p>
                <p className="text-xs text-slate-400 font-mono">{r.code}</p>
                <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {r.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button type="button" onClick={() => setEditing(r)} title="Edit"
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#C9A84C] transition-colors">
                  <IconPencil size={14} />
                </button>
                <button type="button" onClick={() => setDeleting(r)} title="Delete"
                  className="p-2 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <RegionModal
          region={editing}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete Region"
          message={`Remove region "${deleting.name}"? Content assigned to this region will lose its region tag.`}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
