'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/api'
import type { Testimonial } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { IconMessageSquare, IconSearch, IconPencil, IconTrash, IconStar, IconShield } from '@/components/ui/icons'

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

const RATING_OPTIONS = [
  { value: '',  label: '— none —' },
  { value: '1', label: '1 star' },
  { value: '2', label: '2 stars' },
  { value: '3', label: '3 stars' },
  { value: '4', label: '4 stars' },
  { value: '5', label: '5 stars' },
]

type TestimonialFormData = {
  author_name: string
  author_title: string
  quote: string
  rating: string
  avatar_url: string
  sort_order: number
  is_active: boolean
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  testimonial?: Testimonial | null
  onSave: (data: Partial<Testimonial>) => Promise<void>
  onClose: () => void
}

function TestimonialModal({ testimonial, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState<TestimonialFormData>({
    author_name:  testimonial?.author_name ?? '',
    author_title: testimonial?.author_title ?? '',
    quote:        testimonial?.quote ?? '',
    rating:       testimonial?.rating ? String(testimonial.rating) : '',
    avatar_url:   testimonial?.avatar_url ?? '',
    sort_order:   testimonial?.sort_order ?? 0,
    is_active:    testimonial?.is_active ?? true,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set<K extends keyof TestimonialFormData>(key: K, value: TestimonialFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const trimmedName = form.author_name.trim()
    const trimmedQuote = form.quote.trim()
    if (!trimmedName) { setError('Author name is required'); return }
    if (!trimmedQuote) { setError('Quote is required'); return }
    if (trimmedQuote.length > 1000) { setError('Quote must be 1000 characters or fewer'); return }

    setSaving(true)
    try {
      await onSave({
        author_name:  trimmedName,
        author_title: form.author_title.trim() || null,
        quote:        trimmedQuote,
        rating:       form.rating ? Number(form.rating) : null,
        avatar_url:   form.avatar_url.trim() || null,
        sort_order:   form.sort_order,
        is_active:    form.is_active,
      })
      onClose()
    }
    catch (err) { setError(err instanceof Error ? err.message : 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">{testimonial ? 'Edit Testimonial' : 'New Testimonial'}</h3>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label htmlFor="t-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Author Name <span className="text-red-400">*</span></label>
            <input id="t-name" type="text" required value={form.author_name} onChange={e => set('author_name', e.target.value)} className={inp} placeholder="e.g. John Smith" />
          </div>

          <div>
            <label htmlFor="t-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Author Title</label>
            <input id="t-title" type="text" value={form.author_title} onChange={e => set('author_title', e.target.value)} className={inp} placeholder="e.g. Property Investor" />
          </div>

          <div>
            <label htmlFor="t-quote" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quote <span className="text-red-400">*</span></label>
            <textarea
              id="t-quote"
              required
              rows={4}
              maxLength={1000}
              value={form.quote}
              onChange={e => set('quote', e.target.value)}
              className={inp}
              placeholder="What did they say?"
            />
            <p className="mt-1 text-xs text-slate-400 text-right">{form.quote.length}/1000</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rating</label>
              <CustomSelect value={form.rating} onChange={v => set('rating', v)} options={RATING_OPTIONS} placeholder="— none —" />
            </div>
            <div>
              <label htmlFor="t-order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sort Order</label>
              <input
                id="t-order"
                type="number"
                value={form.sort_order}
                onChange={e => set('sort_order', Number(e.target.value))}
                className={inp}
              />
            </div>
          </div>

          <div>
            <label htmlFor="t-avatar" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Avatar URL</label>
            <input id="t-avatar" type="text" value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} className={inp} placeholder="https://…" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
          </label>

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

// ── Rating display ────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating?: number | null }) {
  if (!rating) return <span className="text-slate-400 dark:text-slate-500">—</span>
  return (
    <span className="flex items-center gap-0.5 text-[#C9A84C]">
      {Array.from({ length: rating }).map((_, i) => (
        <IconStar key={i} size={13} fill="currentColor" className="text-[#C9A84C]" />
      ))}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TestimonialsPage() {
  const { user: me } = useAuth()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<Testimonial | null | undefined>(undefined)
  const [toDelete, setToDelete] = useState<Testimonial | null>(null)
  const [acting,   setActing]   = useState(false)
  const [search,   setSearch]   = useState('')

  function load() {
    setLoading(true)
    getTestimonials().then(res => setTestimonials(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  if (me && me.role === 'agent') {
    return (
      <div className="py-24 text-center">
        <IconShield size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Manager or super admin access required.</p>
      </div>
    )
  }

  async function handleSave(data: Partial<Testimonial>) {
    if (editing && editing.id) { await updateTestimonial(editing.id, data) }
    else { await createTestimonial(data) }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteTestimonial(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  const filtered = testimonials.filter(t =>
    !search
    || t.author_name.toLowerCase().includes(search.toLowerCase())
    || (t.author_title ?? '').toLowerCase().includes(search.toLowerCase())
    || t.quote.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search testimonials…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0">
          + New Testimonial
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quote</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">{search ? 'No testimonials match your search.' : 'No testimonials yet.'}</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <IconMessageSquare size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{t.author_name}</p>
                      {t.author_title && <p className="text-xs text-slate-400 dark:text-slate-500">{t.author_title}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-md truncate">{t.quote}</td>
                <td className="px-4 py-3.5"><RatingStars rating={t.rating} /></td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${t.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{t.sort_order}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditing(t)} title="Edit testimonial" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <IconPencil size={14} />
                    </button>
                    <button type="button" onClick={() => setToDelete(t)} title="Delete testimonial" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
        <TestimonialModal testimonial={editing} onSave={handleSave} onClose={() => setEditing(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete testimonial"
          message={`Delete the testimonial from "${toDelete.author_name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
