'use client'

import { use, useEffect, useState } from 'react'
import { getAdminBlogPost, getAdminBlogTags } from '@/lib/api'
import type { BlogPost, BlogTag } from '@/types'
import { BlogPostForm } from '@/components/blog/BlogPostForm'

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const [post,  setPost]  = useState<BlogPost | null>(null)
  const [tags,  setTags]  = useState<BlogTag[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getAdminBlogPost(Number(id)), getAdminBlogTags()])
      .then(([p, t]) => { setPost(p.data); setTags(t.data ?? []) })
      .catch(() => setError('Post not found'))
  }, [id])

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-500">{error}</p>
    </div>
  )

  if (!post) return (
    <div className="max-w-6xl animate-pulse space-y-4">
      <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-slate-100 dark:bg-slate-700 rounded-xl h-[600px]" />
        <div className="space-y-4">
          {[200, 160, 120].map(h => (
            <div key={h} className="bg-slate-100 dark:bg-slate-700 rounded-xl" style={{ height: h }} />
          ))}
        </div>
      </div>
    </div>
  )

  return <BlogPostForm post={post} initialTags={tags} />
}
