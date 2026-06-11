'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getMedia, uploadMedia, deleteMedia } from '@/lib/api'
import type { MediaFile } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { IconTrash, IconSearch } from '@/components/ui/icons'

const FOLDERS = ['all', 'properties', 'blog', 'areas', 'developers', 'agents', 'misc']

function fmt(bytes: number | null | undefined) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MediaPage() {
  const [files,    setFiles]    = useState<MediaFile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [folder,   setFolder]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [total,    setTotal]    = useState(0)
  const [toDelete, setToDelete] = useState<MediaFile | null>(null)
  const [acting,   setActing]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [selected, setSelected] = useState<MediaFile | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMedia({
        folder: folder === 'all' ? undefined : folder,
        search: search || undefined,
        per_page: 48,
      })
      setFiles(res.data ?? [])
      setTotal(res.meta?.pagination?.total ?? res.data?.length ?? 0)
    } finally { setLoading(false) }
  }, [folder, search])

  useEffect(() => { load() }, [load])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadMedia(file, folder === 'all' ? 'misc' : folder)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try {
      await deleteMedia(toDelete.id)
      setToDelete(null)
      if (selected?.id === toDelete.id) setSelected(null)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-40">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search files…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 shrink-0">{total} file{total !== 1 ? 's' : ''}</p>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm disabled:opacity-50 shrink-0"
        >
          {uploading ? 'Uploading…' : '↑ Upload'}
        </button>
      </div>

      {/* Folder tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {FOLDERS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFolder(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize shrink-0 ${
              folder === f
                ? 'bg-[#C9A84C]/15 text-[#9A7A2E] dark:text-[#C9A84C]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-slate-400 text-sm">No files found.</p>
              <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Upload your first file using the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelected(file)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${
                    selected?.id === file.id
                      ? 'border-[#C9A84C]'
                      : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                  }`}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover bg-slate-100 dark:bg-slate-700"
                    onError={e => { (e.target as HTMLImageElement).src = '/placeholder-image.svg' }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-end p-1.5 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={ev => { ev.stopPropagation(); setToDelete(file) }}
                      className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-56 shrink-0 hidden lg:block">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sticky top-4">
              <img
                src={selected.url}
                alt={selected.name}
                className="w-full aspect-square object-cover rounded-lg bg-slate-100 dark:bg-slate-700 mb-3"
              />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate mb-1">{selected.name}</p>
              <p className="text-xs text-slate-400 capitalize mb-0.5">{selected.folder}</p>
              <p className="text-xs text-slate-400 mb-0.5">{fmt(selected.size)}</p>
              <p className="text-xs text-slate-400 mb-3">{fmtDate(selected.created_at)}</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(selected.url).catch(() => {}) }}
                  className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(selected)}
                  className="w-full py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Delete file"
          message={`Delete "${toDelete.name}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
