'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from '@/lib/api'
import type { Language } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { IconPencil, IconTrash, IconX, IconSearch } from '@/components/ui/icons'

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

// ── Modal ─────────────────────────────────────────────────────────────────────

function LanguageModal({ language, onSave, onClose }: {
  language?: Language | null
  onSave: (data: Partial<Language>) => Promise<void>
  onClose: () => void
}) {
  const [code,       setCode]       = useState(language?.code ?? '')
  const [name,       setName]       = useState(language?.name ?? '')
  const [nativeName, setNativeName] = useState(language?.native_name ?? '')
  const [direction,  setDirection]  = useState<'ltr' | 'rtl'>(language?.direction ?? 'ltr')
  const [sortOrder,  setSortOrder]  = useState(language?.sort_order?.toString() ?? '0')
  const [isActive,   setIsActive]   = useState(language?.is_active ?? true)
  const [isDefault,  setIsDefault]  = useState(language?.is_default ?? false)
  const [error,      setError]      = useState('')
  const [saving,     setSaving]     = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await onSave({
        code:        code.trim(),
        name:        name.trim(),
        native_name: nativeName.trim(),
        direction,
        sort_order:  parseInt(sortOrder) || 0,
        is_active:   isActive,
        is_default:  isDefault,
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
            {language ? 'Edit Language' : 'New Language'}
          </h3>
          <button type="button" onClick={onClose} title="Close" className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <IconX size={15} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Code <span className="text-red-400">*</span>
                <span className="font-normal text-xs text-slate-400 ml-1">BCP 47</span>
              </label>
              <input type="text" required maxLength={10} value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="en" className={inp + ' font-mono'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Direction <span className="text-red-400">*</span>
              </label>
              <select value={direction} onChange={e => setDirection(e.target.value as 'ltr' | 'rtl')}
                title="Text direction"
                className={inp}>
                <option value="ltr">LTR</option>
                <option value="rtl">RTL</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Name (English) <span className="text-red-400">*</span>
            </label>
            <input type="text" required value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Arabic" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Native Name <span className="text-red-400">*</span>
            </label>
            <input type="text" required value={nativeName}
              onChange={e => setNativeName(e.target.value)}
              placeholder="العربية" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sort Order</label>
            <input type="number" min={0} value={sortOrder} onChange={e => setSortOrder(e.target.value)} title="Sort order" placeholder="0" className={inp} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-[#C9A84C]" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
                className="w-4 h-4 accent-[#C9A84C]" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Default</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : language ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [editing,   setEditing]   = useState<Language | null | 'new'>(null)
  const [toDelete,  setToDelete]  = useState<Language | null>(null)
  const [acting,    setActing]    = useState(false)

  function load() {
    setLoading(true)
    getLanguages().then(res => setLanguages(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function handleSave(data: Partial<Language>) {
    if (editing === 'new') {
      await createLanguage(data)
    } else if (editing) {
      await updateLanguage(editing.id, data)
    }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteLanguage(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  const filtered = languages.filter(l =>
    !search ||
    l.code.toLowerCase().includes(search.toLowerCase()) ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search languages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <button type="button" onClick={() => setEditing('new')}
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm">
          + New Language
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Native</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dir</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-20" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                {search ? 'No languages match your search.' : 'No languages yet.'}
              </td></tr>
            ) : filtered.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{l.code}</span>
                    {l.is_default && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#C9A84C]/20 text-[#C9A84C]">Default</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-700 dark:text-slate-200">{l.name}</td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{l.native_name}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${l.direction === 'rtl' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {l.direction}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${l.is_active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                    {l.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{l.sort_order}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditing(l)} title="Edit language" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <IconPencil size={14} />
                    </button>
                    <button type="button" onClick={() => setToDelete(l)} disabled={l.is_default}
                      title={l.is_default ? 'Cannot delete default language' : undefined}
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                      <IconTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <LanguageModal
          language={editing === 'new' ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete language"
          message={`Delete "${toDelete.name} (${toDelete.code})"?`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
