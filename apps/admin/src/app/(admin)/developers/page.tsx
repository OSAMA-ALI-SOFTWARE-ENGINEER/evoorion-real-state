'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getDevelopers, createDeveloper, updateDeveloper, deleteDeveloper, uploadMedia } from '@/lib/api'
import type { Developer } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ImageCropper } from '@/components/ui/ImageCropper'
import { IconGrid, IconList, IconLayers, IconSearch, IconPencil, IconTrash, IconUpload, IconX } from '@/components/ui/icons'

const VIEW_KEY = 'evoorion_developers_view'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps { developer?: Developer | null; onSave: (data: Partial<Developer>) => Promise<void>; onClose: () => void }

function DeveloperModal({ developer, onSave, onClose }: ModalProps) {
  const [name,        setName]        = useState(developer?.name ?? '')
  const [email,       setEmail]       = useState(developer?.email ?? '')
  const [slug,        setSlug]        = useState(developer?.slug ?? '')
  const [logoUrl,     setLogoUrl]     = useState(developer?.logo_url ?? '')
  const [auto,        setAuto]        = useState(!developer)
  const [error,       setError]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [cropSrc,     setCropSrc]     = useState<string | null>(null)
  const [uploading,   setUploading]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleName(v: string) { setName(v); if (auto) setSlug(slugify(v)) }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setCropSrc(ev.target?.result as string)
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  async function onCropConfirm(blob: Blob) {
    setCropSrc(null)
    setUploading(true)
    try {
      const file = new File([blob], 'logo.png', { type: 'image/png' })
      const res  = await uploadMedia(file, 'developers')
      setLogoUrl(res.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await onSave({ name: name.trim(), email: email.trim() || undefined, slug: slug.trim(), logo_url: logoUrl.trim() || undefined })
      onClose()
    } catch (err) { setError(err instanceof Error ? err.message : 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <>
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={1}
          onConfirm={onCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">{developer ? 'Edit Developer' : 'New Developer'}</h3>
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label htmlFor="dev-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name <span className="text-red-400">*</span></label>
              <input id="dev-name" type="text" required value={name} onChange={e => handleName(e.target.value)} className={inp} placeholder="e.g. Emaar Properties" />
            </div>
            <div>
              <label htmlFor="dev-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Notification Email
                <span className="ml-1 text-xs text-slate-400 font-normal">(receives lead notifications)</span>
              </label>
              <input id="dev-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="developer@example.com" />
            </div>
            <div>
              <label htmlFor="dev-slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Slug <span className="text-red-400">*</span></label>
              <input id="dev-slug" type="text" required value={slug} onChange={e => { setAuto(false); setSlug(e.target.value) }} className={inp + ' font-mono'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Logo</label>
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <IconLayers size={28} className="text-slate-300 dark:text-slate-500" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="text-xs text-slate-400">Uploading…</span>
                    ) : (
                      <><IconUpload size={14} /> Upload & Crop</>
                    )}
                  </button>
                  <input
                    id="dev-logo-url"
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="or paste URL…"
                    className={inp + ' text-xs'}
                  />
                  {logoUrl && (
                    <button type="button" onClick={() => setLogoUrl('')} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                      <IconX size={11} /> Remove logo
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" aria-label="Upload developer logo" className="hidden" onChange={onFileChange} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
              <button type="submit" disabled={saving || uploading} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// ── Developer card ────────────────────────────────────────────────────────────

function DeveloperCard({ dev, onEdit, onDelete }: { dev: Developer; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
      <div className="h-32 bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
        {dev.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dev.logo_url} alt={dev.name} className="max-h-20 max-w-[80%] object-contain" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
        ) : null}
        <IconLayers size={36} className={`text-slate-300 dark:text-slate-600 ${dev.logo_url ? 'hidden' : ''}`} />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{dev.name}</p>
        <p className="text-xs text-slate-400 font-mono mb-4">{dev.slug}</p>
        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          <button type="button" onClick={onEdit} title="Edit developer" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <IconPencil size={12} /> Edit
          </button>
          <button type="button" onClick={onDelete} title="Delete developer" className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <IconTrash size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DevelopersPage() {
  const [devs,     setDevs]     = useState<Developer[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<Developer | null | undefined>(undefined)
  const [toDelete, setToDelete] = useState<Developer | null>(null)
  const [acting,   setActing]   = useState(false)
  const [search,   setSearch]   = useState('')
  const [view,     setView]     = useState<'table' | 'cards'>('table')

  function load() {
    setLoading(true)
    getDevelopers().then(res => setDevs(res.data ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const stored = localStorage.getItem(VIEW_KEY)
    if (stored === 'cards' || stored === 'table') setView(stored as 'table' | 'cards')
  }, [])

  function toggleView(v: 'table' | 'cards') { setView(v); localStorage.setItem(VIEW_KEY, v) }

  async function handleSave(data: Partial<Developer>) {
    if (editing && editing.id) { await updateDeveloper(editing.id, data) }
    else { await createDeveloper(data) }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteDeveloper(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  const filtered = devs.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.slug.includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search developers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <button type="button" onClick={() => toggleView('table')} className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Table view">
            <IconList size={15} />
          </button>
          <button type="button" onClick={() => toggleView('cards')} className={`p-1.5 rounded-md transition-colors ${view === 'cards' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`} aria-label="Cards view">
            <IconGrid size={15} />
          </button>
        </div>

        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm shrink-0">
          + New Developer
        </button>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Developer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">{search ? 'No developers match your search.' : 'No developers yet.'}</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">{d.name}</td>
                  <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 font-mono text-xs">{d.slug}</td>
                  <td className="px-4 py-3.5 text-center">
                    {d.logo_url ? (
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-700 inline-flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.logo_url} alt={d.name} className="max-h-7 max-w-[28px] object-contain" />
                      </div>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setEditing(d)} title="Edit developer" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <IconPencil size={14} />
                      </button>
                      <button type="button" onClick={() => setToDelete(d)} title="Delete developer" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards view */}
      {view === 'cards' && (
        loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">{search ? 'No developers match your search.' : 'No developers yet.'}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(d => (
              <DeveloperCard key={d.id} dev={d} onEdit={() => setEditing(d)} onDelete={() => setToDelete(d)} />
            ))}
          </div>
        )
      )}

      {editing !== undefined && (
        <DeveloperModal developer={editing} onSave={handleSave} onClose={() => setEditing(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete developer"
          message={`Delete "${toDelete.name}"? Properties linked to it may be affected.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
