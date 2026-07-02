'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBlogPost, updateBlogPost, getAdminBlogTags, createBlogTag, getRegions, type Region } from '@/lib/api'
import type { BlogPost, BlogTag, BlogStatus } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { BlogEditor } from '@/components/ui/BlogEditor'
import { FeaturedImageUpload } from '@/components/ui/FeaturedImageUpload'
import { DatePickerInput } from '@/components/ui/DatePickerInput'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface Props {
  post?: BlogPost      // undefined = create mode
  initialTags?: BlogTag[]
}

export function BlogPostForm({ post, initialTags }: Props) {
  const router      = useRouter()
  const { user }    = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const [title,       setTitle]       = useState(post?.title ?? '')
  const [slug,        setSlug]        = useState(post?.slug ?? '')
  const [excerpt,     setExcerpt]     = useState(post?.excerpt ?? '')
  const [content,     setContent]     = useState(post?.content ?? '')
  const [imageUrl,    setImageUrl]    = useState(post?.featured_image_url ?? '')
  const [status,      setStatus]      = useState<BlogStatus>(post?.status ?? 'draft')
  // Sync status if post loads after initial render (edit mode)
  useEffect(() => { if (post?.status) setStatus(post.status) }, [post?.status])
  const [publishedAt, setPublishedAt] = useState(
    post?.published_at ? post.published_at.slice(0, 10) : ''
  )
  const [metaTitle,    setMetaTitle]    = useState(post?.meta_title ?? '')
  const [metaDesc,     setMetaDesc]     = useState(post?.meta_description ?? '')
  const [selectedTags, setSelectedTags] = useState<number[]>(post?.tags?.map(t => t.id) ?? [])
  const [autoSlug,     setAutoSlug]     = useState(!post)
  const [error,        setError]        = useState('')
  const [titleError,   setTitleError]   = useState('')
  const [saving,       setSaving]       = useState(false)

  const [tags,         setTags]         = useState<BlogTag[]>(initialTags ?? [])
  const [newTagName,   setNewTagName]   = useState('')
  const [addingTag,    setAddingTag]    = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const [regions,      setRegions]      = useState<Region[]>([])
  const [regionId,     setRegionId]     = useState<string>(
    post?.region_id != null ? String(post.region_id) : ''
  )

  useEffect(() => {
    if (!initialTags) {
      getAdminBlogTags().then(res => setTags(res.data ?? []))
    }
    getRegions().then(res => setRegions(res.data ?? []))
  }, [initialTags])

  useEffect(() => {
    if (showTagInput) setTimeout(() => tagInputRef.current?.focus(), 40)
  }, [showTagInput])

  function handleTitle(v: string) {
    setTitle(v)
    setTitleError('')
    if (autoSlug) setSlug(slugify(v))
  }

  function toggleTag(id: number) {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function submitNewTag(e: FormEvent) {
    e.preventDefault()
    if (!newTagName.trim()) return
    setAddingTag(true)
    try {
      const res = await createBlogTag({ name: newTagName.trim() })
      const tag = res.data
      setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedTags(prev => [...prev, tag.id])
      setNewTagName('')
      setShowTagInput(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not create tag')
    } finally { setAddingTag(false) }
  }

  // Non-super-admin can archive a published post but cannot self-publish or restore
  const effectiveStatus: BlogStatus = isSuperAdmin
    ? status
    : status === 'archived' ? 'archived' : 'draft'

  // Status options depend on the current saved post status
  const statusOptions: BlogStatus[] = (() => {
    const saved = post?.status
    if (saved === 'published' || saved === 'archived') return ['published', 'archived']
    return ['draft', 'published']
  })()

  // Determine if post will be scheduled
  const willSchedule = effectiveStatus === 'published' && publishedAt
    && new Date(publishedAt) > new Date()

  const handleSubmit = useCallback(async () => {
    setError('')
    if (!title.trim()) { setError('Title is required'); return }
    if (!content || content === '<p></p>') { setError('Content is required'); return }

    setSaving(true)
    try {
      const payload = {
        title:              title.trim(),
        slug:               slug.trim() || undefined,
        excerpt:            excerpt.trim() || undefined,
        content,
        featured_image_url: imageUrl || undefined,
        status:             effectiveStatus,
        published_at:       publishedAt || undefined,
        meta_title:         metaTitle.trim() || undefined,
        meta_description:   metaDesc.trim() || undefined,
        tag_ids:            selectedTags,
        region_id:          regionId ? Number(regionId) : null,
      }

      if (post) {
        await updateBlogPost(post.id, payload)
      } else {
        await createBlogPost(payload)
      }
      router.push('/blog')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      // Surface validation errors (e.g. duplicate title)
      if (msg.toLowerCase().includes('title')) setTitleError(msg)
      else setError(msg)
    } finally { setSaving(false) }
  }, [title, slug, excerpt, content, imageUrl, effectiveStatus, publishedAt, metaTitle, metaDesc, selectedTags, regionId, post, router])

  const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors'
  const lbl = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5'

  return (
    <div>
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/blog')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm transition-colors shrink-0"
          >
            ← Blog
          </button>
          <span className="text-slate-300 dark:text-slate-600 shrink-0">/</span>
          <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
            {post ? 'Edit Post' : 'New Post'}
          </h1>
          {!isSuperAdmin && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-medium shrink-0">
              Pending approval
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/blog')}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : post
              ? (effectiveStatus === 'archived' && post.status !== 'archived' ? 'Archive Post' : 'Update Post')
              : (isSuperAdmin ? 'Publish' : 'Submit for Review')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Title + Slug */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <label className={lbl}>Title <span className="text-red-400 normal-case">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => handleTitle(e.target.value)}
                placeholder="Post title…"
                className={inp + (titleError ? ' border-red-400 focus:border-red-400 focus:ring-red-400' : '')}
              />
              {titleError && <p className="text-red-500 text-xs mt-1">{titleError}</p>}
            </div>
            <div>
              <label className={lbl}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={e => { setAutoSlug(false); setSlug(e.target.value) }}
                placeholder="auto-generated-from-title"
                className={inp + ' font-mono text-xs'}
              />
            </div>
            <div>
              <label className={lbl}>Excerpt</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Brief summary shown in listings…"
                className={inp + ' resize-none'}
              />
            </div>
          </div>

          {/* Rich text content */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <label className={lbl + ' mb-3'}>Content <span className="text-red-400 normal-case">*</span></label>
            <BlogEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your post… Paste images directly or use the toolbar."
              minHeight={480}
            />
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700 pb-2">SEO</p>
            <div>
              <label className={lbl}>Meta Title <span className="text-slate-300 text-[10px] font-normal normal-case">({metaTitle.length}/60)</span></label>
              <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={60} placeholder="Defaults to post title" className={inp} />
            </div>
            <div>
              <label className={lbl}>Meta Description <span className="text-slate-300 text-[10px] font-normal normal-case">({metaDesc.length}/160)</span></label>
              <textarea rows={2} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} maxLength={160} placeholder="Defaults to excerpt" className={inp + ' resize-none'} />
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">

          {/* Featured image */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <p className={lbl}>Featured Image</p>
            <FeaturedImageUpload value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Status + date */}
          {isSuperAdmin && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <p className={lbl}>Publishing</p>
              <div>
                <label className={lbl}>Status</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {statusOptions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                        status === s
                          ? 'bg-[#C9A84C]/15 border-[#C9A84C]/50 text-[#9A7A2E] dark:text-[#C9A84C]'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {s === 'archived' ? 'Archive' : s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={lbl}>
                  {willSchedule ? '🕐 Scheduled for' : 'Publish Date'}
                </label>
                <DatePickerInput
                  value={publishedAt}
                  onChange={setPublishedAt}
                  placeholder="Now (immediate)"
                />
                {willSchedule && (
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1.5">
                    Post will go live on the selected date.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Region */}
          {regions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className={lbl}>Region</p>
              <select
                aria-label="Region"
                value={regionId}
                onChange={e => setRegionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="">Global (all regions)</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.flag} {r.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className={lbl + ' mb-0'}>Tags</p>
              <button
                type="button"
                onClick={() => setShowTagInput(v => !v)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 text-sm font-bold transition-colors"
                title="Add new tag"
              >
                {showTagInput ? '×' : '+'}
              </button>
            </div>

            {showTagInput && (
              <form onSubmit={submitNewTag} className="flex gap-1.5 mb-3">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="New tag name…"
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#C9A84C]"
                />
                <button
                  type="submit"
                  disabled={addingTag || !newTagName.trim()}
                  className="px-2.5 py-1.5 rounded-lg bg-[#C9A84C] text-slate-900 text-xs font-semibold disabled:opacity-50 hover:bg-[#D4B668] transition-colors"
                >
                  {addingTag ? '…' : 'Add'}
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-1.5">
              {tags.length === 0 && <span className="text-xs text-slate-400">No tags yet. Create one above.</span>}
              {tags.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedTags.includes(t.id)
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-slate-900'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#C9A84C] hover:text-[#C9A84C]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile save */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="lg:hidden w-full py-3 rounded-xl bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : post
              ? (effectiveStatus === 'archived' && post.status !== 'archived' ? 'Archive Post' : 'Update Post')
              : (isSuperAdmin ? 'Publish' : 'Submit for Review')}
          </button>
        </div>
      </div>
    </div>
  )
}
