'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { getCmsPages, getCmsPage, updateCmsPage, deleteCmsSection } from '@/lib/api'
import type { CmsSection } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useAuth } from '@/context/AuthContext'
import { IconPencil, IconTrash, IconX, IconShield } from '@/components/ui/icons'

const KNOWN_PAGES = ['home', 'about', 'contact', 'investments']

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'
const lbl = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5'

interface SectionEditorProps {
  section: CmsSection | null  // null = new section
  pageSlug: string
  onSave: (key: string, content: string) => Promise<void>
  onClose: () => void
}

function SectionEditor({ section, pageSlug, onSave, onClose }: SectionEditorProps) {
  const [key,     setKey]     = useState(section?.section_key ?? '')
  const [content, setContent] = useState(
    section ? (typeof section.content === 'string' ? section.content : JSON.stringify(section.content, null, 2)) : ''
  )
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await onSave(key.trim(), content.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {section ? 'Edit Section' : 'New Section'}
          </h3>
          <button type="button" onClick={onClose} title="Close" className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <IconX size={15} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className={lbl}>Section Key <span className="text-red-400 normal-case">*</span></label>
            <input
              type="text" required value={key}
              onChange={e => setKey(e.target.value)}
              disabled={!!section}
              placeholder="e.g. hero_title, about_body"
              className={inp + (section ? ' opacity-60 cursor-not-allowed' : '')}
            />
            <p className="text-xs text-slate-400 mt-1">Use snake_case. This identifies the section in your frontend.</p>
          </div>
          <div>
            <label className={lbl}>Content</label>
            <textarea
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={'Plain text or JSON\ne.g. "Welcome to Evoorion"\nor {"en": "Welcome", "ar": "أهلاً"}'}
              className={inp + ' resize-y font-mono text-xs'}
            />
            <p className="text-xs text-slate-400 mt-1">Plain text, HTML snippet, or JSON object — parsed automatically.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CmsPage() {
  const { user: me } = useAuth()
  const [pages,     setPages]     = useState<string[]>(KNOWN_PAGES)
  const [activeSlug,setActiveSlug]= useState<string>(KNOWN_PAGES[0])
  const [sections,  setSections]  = useState<CmsSection[]>([])
  const [loading,   setLoading]   = useState(false)
  const [editing,   setEditing]   = useState<CmsSection | 'new' | null>(null)
  const [toDelete,  setToDelete]  = useState<CmsSection | null>(null)
  const [acting,    setActing]    = useState(false)

  const loadPages = useCallback(async () => {
    try {
      const res = await getCmsPages()
      const fetched = res.data ?? []
      const merged = Array.from(new Set([...KNOWN_PAGES, ...fetched]))
      setPages(merged)
    } catch { setPages(KNOWN_PAGES) }
  }, [])

  const loadSections = useCallback(async (slug: string) => {
    setLoading(true)
    try {
      const res = await getCmsPage(slug)
      setSections(res.data?.sections ?? [])
    } catch { setSections([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadPages() }, [loadPages])
  useEffect(() => { loadSections(activeSlug) }, [activeSlug, loadSections])

  async function handleSave(key: string, rawContent: string) {
    let parsed: unknown = rawContent
    try { parsed = JSON.parse(rawContent) } catch { /* plain text */ }
    await updateCmsPage(activeSlug, [{ section_key: key, content: parsed }])
    loadSections(activeSlug)
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try {
      await deleteCmsSection(activeSlug, toDelete.section_key)
      setToDelete(null)
      loadSections(activeSlug)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally { setActing(false) }
  }

  if (me?.role !== 'super_admin') {
    return (
      <div className="py-24 text-center">
        <IconShield size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Super admin access required.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-4xl">
      {/* Page nav */}
      <nav className="flex flex-row sm:flex-col gap-1 sm:gap-0.5 sm:w-44 sm:shrink-0 overflow-x-auto pb-1 sm:pb-0 sm:overflow-x-visible">
        {pages.map(slug => (
          <button
            key={slug}
            type="button"
            onClick={() => setActiveSlug(slug)}
            className={`shrink-0 flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap sm:whitespace-normal sm:w-full text-left capitalize ${
              activeSlug === slug
                ? 'bg-[#C9A84C]/10 dark:bg-[#C9A84C]/15 text-[#9A7A2E] dark:text-[#C9A84C]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {slug}
          </button>
        ))}
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 capitalize">{activeSlug} page</h2>
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm"
          >
            + Add Section
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sections.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-400 text-sm">No sections yet for this page.</p>
              <button
                type="button"
                onClick={() => setEditing('new')}
                className="mt-3 text-[#C9A84C] hover:text-[#D4B668] text-sm font-medium"
              >
                + Add first section
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Content preview</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sections.map(s => {
                  const preview = typeof s.content === 'string'
                    ? s.content
                    : JSON.stringify(s.content)
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{s.section_key}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                        <span className="truncate block max-w-xs">{preview.slice(0, 80)}{preview.length > 80 ? '…' : ''}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(s)}
                            title="Edit section"
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <IconPencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(s)}
                            title="Delete section"
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing !== null && (
        <SectionEditor
          section={editing === 'new' ? null : editing}
          pageSlug={activeSlug}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete section"
          message={`Delete section "${toDelete.section_key}" from the ${activeSlug} page?`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
