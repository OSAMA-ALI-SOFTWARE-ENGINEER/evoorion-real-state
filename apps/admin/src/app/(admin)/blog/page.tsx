'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getAdminBlogPosts, getAdminBlogPost, createBlogPost, updateBlogPost,
  deleteBlogPost, restoreBlogPost, getAdminBlogTags, createBlogTag, deleteBlogTag,
} from '@/lib/api'
import type { BlogPost, BlogTag } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Pagination } from '@/components/ui/Pagination'

type Tab = 'posts' | 'tags'

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  draft:     'bg-amber-50 text-amber-700',
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Post Modal ────────────────────────────────────────────────────────────────

interface PostModalProps {
  post?: BlogPost | null
  tags: BlogTag[]
  onSave: (data: Partial<BlogPost> & { tag_ids?: number[] }) => Promise<void>
  onClose: () => void
}

function PostModal({ post, tags, onSave, onClose }: PostModalProps) {
  const [title,       setTitle]       = useState(post?.title ?? '')
  const [slug,        setSlug]        = useState(post?.slug ?? '')
  const [excerpt,     setExcerpt]     = useState(post?.excerpt ?? '')
  const [content,     setContent]     = useState(post?.content ?? '')
  const [imageUrl,    setImageUrl]    = useState(post?.featured_image_url ?? '')
  const [status,      setStatus]      = useState<'draft' | 'published'>(post?.status ?? 'draft')
  const [publishedAt, setPublishedAt] = useState(post?.published_at ? post.published_at.slice(0, 10) : '')
  const [metaTitle,   setMetaTitle]   = useState(post?.meta_title ?? '')
  const [metaDesc,    setMetaDesc]    = useState(post?.meta_description ?? '')
  const [selectedTags,setSelectedTags]= useState<number[]>(post?.tags?.map(t => t.id) ?? [])
  const [autoSlug,    setAutoSlug]    = useState(!post)
  const [error,       setError]       = useState('')
  const [saving,      setSaving]      = useState(false)

  function handleTitle(v: string) {
    setTitle(v)
    if (autoSlug) setSlug(slugify(v))
  }

  function toggleTag(id: number) {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  async function submit() {
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    if (!content.trim()) { setError('Content is required'); return }
    setSaving(true)
    try {
      await onSave({
        title:              title.trim(),
        slug:               slug.trim() || undefined,
        excerpt:            excerpt.trim() || undefined,
        content:            content.trim(),
        featured_image_url: imageUrl.trim() || undefined,
        status,
        published_at:       publishedAt || undefined,
        meta_title:         metaTitle.trim() || undefined,
        meta_description:   metaDesc.trim() || undefined,
        tag_ids:            selectedTags,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const inp  = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white'
  const sect = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-5 mb-3 border-b border-slate-100 pb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-3 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{post ? 'Edit Post' : 'New Post'}</h3>
        </div>

        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-0">
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <p className={sect}>Content</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-400">*</span></label>
              <input id="post-title" type="text" required value={title} onChange={e => handleTitle(e.target.value)} className={inp} />
            </div>
            <div>
              <label htmlFor="post-slug" className="block text-sm font-medium text-slate-700 mb-1.5">Slug</label>
              <input id="post-slug" type="text" value={slug} onChange={e => { setAutoSlug(false); setSlug(e.target.value) }} className={inp + ' font-mono'} />
            </div>
            <div>
              <label htmlFor="post-excerpt" className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
              <textarea id="post-excerpt" rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} className={inp + ' resize-none'} />
            </div>
            <div>
              <label htmlFor="post-content" className="block text-sm font-medium text-slate-700 mb-1.5">Content <span className="text-red-400">*</span></label>
              <textarea id="post-content" rows={10} value={content} onChange={e => setContent(e.target.value)} className={inp + ' resize-none font-mono text-xs'} />
            </div>
          </div>

          <p className={sect}>Media &amp; Publishing</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="post-image" className="block text-sm font-medium text-slate-700 mb-1.5">Featured Image URL</label>
              <input id="post-image" type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://…" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="post-status" className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select id="post-status" value={status} onChange={e => setStatus(e.target.value as 'draft' | 'published')} className={inp}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label htmlFor="post-pub-date" className="block text-sm font-medium text-slate-700 mb-1.5">Publish Date</label>
                <input id="post-pub-date" type="date" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} className={inp} />
              </div>
            </div>
          </div>

          <p className={sect}>Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.length === 0 && <span className="text-slate-400 text-sm">No tags yet.</span>}
            {tags.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedTags.includes(t.id)
                    ? 'bg-[#C9A84C] border-[#C9A84C] text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:border-[#C9A84C]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <p className={sect}>SEO</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="post-meta-title" className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
              <input id="post-meta-title" type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={60} className={inp} />
            </div>
            <div>
              <label htmlFor="post-meta-desc" className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
              <textarea id="post-meta-desc" rows={2} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} maxLength={160} className={inp + ' resize-none'} />
            </div>
          </div>
          <div className="h-4" />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tags Tab ──────────────────────────────────────────────────────────────────

function TagsTab() {
  const [tags,      setTags]      = useState<BlogTag[]>([])
  const [loading,   setLoading]   = useState(true)
  const [newName,   setNewName]   = useState('')
  const [adding,    setAdding]    = useState(false)
  const [toDelete,  setToDelete]  = useState<BlogTag | null>(null)
  const [acting,    setActing]    = useState(false)

  function load() {
    setLoading(true)
    getAdminBlogTags().then(res => setTags(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function addTag() {
    if (!newName.trim()) return
    setAdding(true)
    try { await createBlogTag({ name: newName.trim() }); setNewName(''); load() }
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
        <input
          type="text"
          placeholder="New tag name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTag()}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:border-[#C9A84C]"
        />
        <button type="button" onClick={addTag} disabled={adding || !newName.trim()} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
          {adding ? 'Adding…' : 'Add Tag'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Posts</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : tags.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No tags yet.</td></tr>
            ) : tags.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-800">{t.name}</td>
                <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{t.slug}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{t.posts_count ?? 0}</td>
                <td className="px-5 py-3.5">
                  <button type="button" onClick={() => setToDelete(t)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
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

function PostsTab({ tags }: { tags: BlogTag[] }) {
  const [posts,     setPosts]     = useState<BlogPost[]>([])
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState(1)
  const [lastPage,  setLastPage]  = useState(1)
  const [search,    setSearch]    = useState('')
  const [statusF,   setStatusF]   = useState('')
  const [editing,   setEditing]   = useState<BlogPost | null | undefined>(undefined)
  const [loadingPost, setLoadingPost] = useState(false)
  const [toDelete,  setToDelete]  = useState<BlogPost | null>(null)
  const [toRestore, setToRestore] = useState<BlogPost | null>(null)
  const [acting,    setActing]    = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params: Parameters<typeof getAdminBlogPosts>[0] = { page, per_page: 15 }
    if (search)  params.search  = search
    if (statusF) params.status  = statusF
    getAdminBlogPosts(params)
      .then(res => {
        setPosts(res.data ?? [])
        const meta = res.meta?.pagination
        if (meta) setLastPage(meta.last_page)
      })
      .finally(() => setLoading(false))
  }, [page, search, statusF])

  useEffect(load, [load])

  async function openEdit(post: BlogPost) {
    setLoadingPost(true)
    try {
      const res = await getAdminBlogPost(post.id)
      setEditing(res.data)
    } catch { setEditing(post) }
    finally { setLoadingPost(false) }
  }

  async function handleSave(data: Partial<BlogPost> & { tag_ids?: number[] }) {
    if (editing && editing.id) {
      await updateBlogPost(editing.id, data)
    } else {
      await createBlogPost(data)
    }
    load()
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
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Search posts…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:border-[#C9A84C]"
        />
        <select
          value={statusF}
          onChange={e => { setStatusF(e.target.value); setPage(1) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#C9A84C]"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button
          type="button"
          onClick={() => setEditing(null)}
          disabled={loadingPost}
          className="ml-auto px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm disabled:opacity-50"
        >
          + New Post
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-28" /></td>
                  ))}
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No posts found.</td></tr>
            ) : posts.map(p => {
              const isDeleted = !!p.deleted_at
              return (
                <tr key={p.id} className={`hover:bg-slate-50 ${isDeleted ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800 truncate max-w-xs">{p.title}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_COLORS[p.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {isDeleted ? 'Deleted' : p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{fmtDate(p.published_at)}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{p.view_count.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {!isDeleted ? (
                        <>
                          <button type="button" onClick={() => openEdit(p)} disabled={loadingPost} className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">Edit</button>
                          <span className="text-slate-200">|</span>
                          <button type="button" onClick={() => setToDelete(p)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setToRestore(p)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Restore</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && <Pagination page={page} lastPage={lastPage} onPage={setPage} />}

      {editing !== undefined && (
        <PostModal post={editing} tags={tags} onSave={handleSave} onClose={() => setEditing(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete post"
          message={`Delete "${toDelete.title}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
      {toRestore && (
        <ConfirmModal
          title="Restore post"
          message={`Restore "${toRestore.title}"?`}
          onConfirm={confirmRestore}
          onCancel={() => setToRestore(null)}
          loading={acting}
        />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [tab,  setTab]  = useState<Tab>('posts')
  const [tags, setTags] = useState<BlogTag[]>([])

  useEffect(() => {
    getAdminBlogTags().then(res => setTags(res.data ?? []))
  }, [])

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? 'bg-[#C9A84C] text-slate-900'
        : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex gap-2">
        <button type="button" className={tabCls('posts')} onClick={() => setTab('posts')}>Posts</button>
        <button type="button" className={tabCls('tags')}  onClick={() => setTab('tags')}>Tags</button>
      </div>

      {tab === 'posts' && <PostsTab tags={tags} />}
      {tab === 'tags'  && <TagsTab />}
    </div>
  )
}
