'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  getAdminBlogPosts, updateBlogPost, deleteBlogPost, restoreBlogPost,
  getAdminBlogTags, createBlogTag, deleteBlogTag, approveBlogPost,
} from '@/lib/api'
import type { BlogPost, BlogTag, BlogStatus } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Pagination } from '@/components/ui/Pagination'
import {
  IconGrid, IconList, IconPencil, IconTrash, IconRotateCcw,
  IconExternalLink, IconCalendar, IconEye, IconCheck, IconClock,
  IconSearch, IconTag,
} from '@/components/ui/icons'

type Tab = 'posts' | 'tags'

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000'
const VIEW_KEY = 'evoorion_blog_view'

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  draft:     'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  pending:   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  archived:  'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
}

const STATUS_OPTIONS = [
  { value: '',          label: 'All statuses' },
  { value: 'published', label: 'Published', icon: <IconCheck size={13} /> },
  { value: 'draft',     label: 'Draft',     icon: <IconPencil size={13} /> },
  { value: 'scheduled', label: 'Scheduled', icon: <IconClock size={13} /> },
  { value: 'pending',   label: 'Pending',   icon: <IconClock size={13} /> },
  { value: 'archived',  label: 'Archived',  icon: <IconTrash size={13} /> },
]

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function effectiveStatus(post: BlogPost): string {
  if (post.status === 'published' && post.published_at && new Date(post.published_at) > new Date()) {
    return 'scheduled'
  }
  return post.status
}

// ── Quick status changer ───────────────────────────────────────────────────────

function QuickStatus({ post, onChanged, isSuperAdmin }: { post: BlogPost; onChanged: () => void; isSuperAdmin: boolean }) {
  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const status = effectiveStatus(post)
  const isDeleted = !!post.deleted_at
  if (isDeleted) return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500">Deleted</span>
  )

  // Status transition rules:
  //   published  → archived only (no unpublishing to draft)
  //   archived   → published or draft (super_admin only)
  //   pending    → published or draft (super_admin only)
  //   draft      → published (super_admin only)
  const options: { value: string; label: string }[] = (() => {
    if (status === 'published') {
      return [{ value: 'archived', label: 'Archive' }]
    }
    if (status === 'archived') {
      if (!isSuperAdmin) return []
      return [
        { value: 'published', label: 'Re-publish' },
        { value: 'draft',     label: 'Restore to Draft' },
      ]
    }
    if (status === 'pending') {
      if (!isSuperAdmin) return []
      return [
        { value: 'published', label: 'Publish' },
        { value: 'draft',     label: 'Move to Draft' },
      ]
    }
    // draft
    if (!isSuperAdmin) return []
    return [{ value: 'published', label: 'Publish' }]
  })()

  const canChange = options.length > 0

  async function changeStatus(s: string) {
    setOpen(false)
    setSaving(true)
    try {
      await updateBlogPost(post.id, { status: s as BlogStatus })
      onChanged()
    } catch { /* silent */ }
    finally { setSaving(false) }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => canChange && setOpen(o => !o)}
        disabled={saving}
        title={canChange ? 'Click to change status' : undefined}
        className={`focus:outline-none disabled:opacity-50 ${!canChange ? 'cursor-default' : ''}`}
      >
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'}`}>
          {status}
          {canChange && <span className="text-[8px] opacity-60">▾</span>}
        </span>
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden min-w-[120px]">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => changeStatus(o.value)}
              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${o.value === post.status ? 'text-[#C9A84C]' : 'text-slate-700 dark:text-slate-200'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({
  post, onDelete, onRestore, onRefresh, isSuperAdmin,
}: {
  post: BlogPost; onDelete: () => void; onRestore: () => void; onRefresh: () => void; isSuperAdmin: boolean
}) {
  const [approving, setApproving] = useState(false)
  const isDeleted = !!post.deleted_at
  const status = effectiveStatus(post)

  async function approve() {
    setApproving(true)
    try { await approveBlogPost(post.id); onRefresh() }
    catch { /* silent */ }
    finally { setApproving(false) }
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col ${isDeleted ? 'opacity-60' : ''}`}>
      <div className="h-36 bg-slate-100 dark:bg-slate-700 shrink-0 relative overflow-hidden">
        {post.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconFileText size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <QuickStatus post={post} onChanged={onRefresh} isSuperAdmin={isSuperAdmin} />
        </div>
        {status === 'scheduled' && (
          <div className="absolute bottom-2 right-2 bg-blue-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <IconCalendar size={10} /> {fmtDate(post.published_at)}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-1 text-sm">{post.title}</p>
        <p className="text-[11px] text-slate-400 font-mono mb-2 truncate">{post.slug}</p>
        {post.author && <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">by {post.author.name}</p>}
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
          <IconEye size={12} /> {post.view_count}
          <span className="ml-auto">{fmtDate(post.published_at)}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {!isDeleted ? (
            <>
              {isSuperAdmin && status === 'pending' && (
                <button
                  type="button"
                  onClick={approve}
                  disabled={approving}
                  title="Approve post"
                  className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-2.5 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                >
                  <IconCheck size={12} /> {approving ? '…' : 'Approve'}
                </button>
              )}
              <Link
                href={`/blog/${post.id}/edit`}
                title="Edit post"
                className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <IconPencil size={12} /> Edit
              </Link>
              <a
                href={`${WEBSITE_URL}/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                title="Live preview"
                className="p-1.5 rounded-md text-slate-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
              >
                <IconExternalLink size={13} />
              </a>
              <button type="button" onClick={onDelete} title="Delete post" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <IconTrash size={13} />
              </button>
            </>
          ) : (
            <button type="button" onClick={onRestore} title="Restore post" className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-emerald-600 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
              <IconRotateCcw size={12} /> Restore
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Need this icon ────────────────────────────────────────────────────────────
function IconFileText(p: { size?: number; className?: string }) {
  return (
    <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

// ── Tags Tab ──────────────────────────────────────────────────────────────────

function TagsTab() {
  const [tags,     setTags]     = useState<BlogTag[]>([])
  const [loading,  setLoading]  = useState(true)
  const [newName,  setNewName]  = useState('')
  const [adding,   setAdding]   = useState(false)
  const [toDelete, setToDelete] = useState<BlogTag | null>(null)
  const [acting,   setActing]   = useState(false)

  function load() {
    setLoading(true)
    getAdminBlogTags().then(res => setTags(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function addTag() {
    if (!newName.trim()) return
    setAdding(true)
    try {
      await createBlogTag({ name: newName.trim() }); setNewName(''); load()
    }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setAdding(false) }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteBlogTag(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <IconTag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="New tag name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            className="w-full pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <button type="button" onClick={addTag} disabled={adding || !newName.trim()} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
          {adding ? 'Adding…' : 'Add Tag'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Posts</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : tags.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No tags yet.</td></tr>
            ) : tags.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <IconTag size={13} className="text-slate-400 dark:text-slate-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-100">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500 font-mono text-xs">{t.slug}</td>
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{t.posts_count ?? 0}</td>
                <td className="px-5 py-3.5">
                  <button type="button" onClick={() => setToDelete(t)} title="Delete tag" className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <IconTrash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toDelete && (
        <ConfirmModal
          title="Delete tag"
          message={`Delete tag "${toDelete.name}"? It will be removed from all posts.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}

// ── Posts Tab ─────────────────────────────────────────────────────────────────

function PostsTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [posts,     setPosts]     = useState<BlogPost[]>([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [lastPage,  setLastPage]  = useState(1)
  const [total,     setTotal]     = useState(0)
  const [search,    setSearch]    = useState('')
  const [statusF,   setStatusF]   = useState('')
  const [view,      setView]      = useState<'table' | 'cards'>('table')
  const [toDelete,  setToDelete]  = useState<BlogPost | null>(null)
  const [toRestore, setToRestore] = useState<BlogPost | null>(null)
  const [acting,    setActing]    = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY)
    if (stored === 'table' || stored === 'cards') setView(stored as 'table' | 'cards')
  }, [])

  function toggleView(v: 'table' | 'cards') { setView(v); localStorage.setItem(VIEW_KEY, v) }

  const load = useCallback(() => {
    setLoading(true)
    const params: Parameters<typeof getAdminBlogPosts>[0] = { page, per_page: 15 }
    if (search)  params.search = search
    if (statusF) params.status = statusF
    getAdminBlogPosts(params)
      .then(res => {
        setPosts(res.data ?? [])
        const meta = res.meta?.pagination
        if (meta) { setLastPage(meta.last_page); setTotal(meta.total) }
      })
      .finally(() => setLoading(false))
  }, [page, search, statusF])

  useEffect(load, [load])

  async function handleApprove(post: BlogPost) {
    try { await approveBlogPost(post.id); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Approve failed') }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteBlogPost(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  async function confirmRestore() {
    if (!toRestore) return
    setActing(true)
    try { await restoreBlogPost(toRestore.id); setToRestore(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Restore failed') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search posts…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm w-56 focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <div className="w-44">
          <CustomSelect value={statusF} onChange={v => { setStatusF(v); setPage(1) }} options={STATUS_OPTIONS} placeholder="All statuses" />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
          <button type="button" onClick={() => toggleView('table')} title="Table view"
            className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`}>
            <IconList size={15} />
          </button>
          <button type="button" onClick={() => toggleView('cards')} title="Cards view"
            className={`p-1.5 rounded-md transition-colors ${view === 'cards' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400'}`}>
            <IconGrid size={15} />
          </button>
        </div>

        <Link
          href="/blog/new"
          className="ml-auto px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* ── Table view ── */}
      {view === 'table' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Views</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className={`px-5 py-3.5${[2,3].includes(j) ? ' hidden sm:table-cell' : ''}`}><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-28" /></td>
                    ))}
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No posts found.</td></tr>
              ) : posts.map(p => {
                const isDeleted = !!p.deleted_at
                const pStatus = effectiveStatus(p)
                return (
                  <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isDeleted ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-xs">{p.title}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.slug}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <QuickStatus post={p} onChanged={load} isSuperAdmin={isSuperAdmin} />
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{fmtDate(p.published_at)}</td>
                    <td className="hidden sm:table-cell px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{p.view_count.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {!isDeleted ? (
                          <>
                            {isSuperAdmin && pStatus === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleApprove(p)}
                                title="Approve post"
                                className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                              >
                                <IconCheck size={14} />
                              </button>
                            )}
                            <Link
                              href={`/blog/${p.id}/edit`}
                              title="Edit post"
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <IconPencil size={14} />
                            </Link>
                            <a href={`${WEBSITE_URL}/blog/${p.slug}`} target="_blank" rel="noreferrer" title="Live preview"
                              className="p-1.5 rounded-md text-slate-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors">
                              <IconExternalLink size={14} />
                            </a>
                            <button type="button" onClick={() => setToDelete(p)} title="Delete post"
                              className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <IconTrash size={14} />
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setToRestore(p)} title="Restore post"
                            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                            <IconRotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Cards view ── */}
      {view === 'cards' && (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-36 bg-slate-100 dark:bg-slate-700 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No posts found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                isSuperAdmin={isSuperAdmin}
                onDelete={() => setToDelete(p)}
                onRestore={() => setToRestore(p)}
                onRefresh={load}
              />
            ))}
          </div>
        )
      )}

      {lastPage > 1 && <Pagination currentPage={page} lastPage={lastPage} total={total} perPage={15} onPage={setPage} />}

      {toDelete && (
        <ConfirmModal title="Delete post" message={`Delete "${toDelete.title}"?`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} loading={acting} />
      )}
      {toRestore && (
        <ConfirmModal title="Restore post" message={`Restore "${toRestore.title}"?`} onConfirm={confirmRestore} onCancel={() => setToRestore(null)} loading={acting} danger={false} />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { user: me } = useAuth()
  const [tab, setTab] = useState<Tab>('posts')
  const isSuperAdmin = me?.role === 'super_admin'

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? 'bg-[#C9A84C] text-slate-900'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
    }`

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" className={tabCls('posts')} onClick={() => setTab('posts')}>Posts</button>
        <button type="button" className={tabCls('tags')}  onClick={() => setTab('tags')}>Tags</button>
      </div>

      {tab === 'posts' && <PostsTab isSuperAdmin={isSuperAdmin} />}
      {tab === 'tags'  && <TagsTab />}
    </div>
  )
}
