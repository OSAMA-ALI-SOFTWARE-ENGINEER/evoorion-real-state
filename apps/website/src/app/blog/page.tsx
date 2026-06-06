'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Tag, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getBlogPosts, getBlogTags } from '@/lib/api'
import type { BlogPostSummary, BlogTag } from '@/types'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AE', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function BlogCard({ post, index }: { post: BlogPostSummary; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <div className="h-full bg-brand-section border border-gold-border rounded-xl overflow-hidden hover:border-gold/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
          {/* Image */}
          <div className="relative h-52 bg-white/5 overflow-hidden">
            {post.featured_image_url ? (
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-gold/20 font-serif text-5xl">E</span>
              </div>
            )}
            {/* Tags overlay */}
            {post.tags.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 bg-brand/80 backdrop-blur-sm border border-gold-border rounded-full text-gold text-xs font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-3 text-muted text-xs mb-3">
              <span>{formatDate(post.published_at)}</span>
              {post.reading_time && (
                <>
                  <span className="w-px h-3 bg-white/10" />
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.reading_time}
                  </span>
                </>
              )}
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {post.view_count}
              </span>
            </div>

            <h3 className="font-serif text-white text-lg leading-snug mb-2 group-hover:text-gold transition-colors line-clamp-2">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-4">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{post.author.name}</span>
              <span className="text-gold text-xs font-medium group-hover:underline">Read more →</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="bg-brand-section border border-gold-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-52 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-5 bg-white/5 rounded w-full" />
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  )
}

export default function BlogPage() {
  const [posts, setPosts]       = useState<BlogPostSummary[]>([])
  const [tags, setTags]         = useState<BlogTag[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeTag, setActiveTag] = useState('')
  const [search, setSearch]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [activeTag, debouncedSearch])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBlogPosts({
        tag: activeTag || undefined,
        search: debouncedSearch || undefined,
        page,
        per_page: 9,
      })
      setPosts(res.data)
      setTotalPages(res.meta.pagination.last_page)
      setTotalPosts(res.meta.pagination.total)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [activeTag, debouncedSearch, page])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    getBlogTags().then((res) => setTags(res.data)).catch(() => {})
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Insights &amp; Perspectives</p>
              <h1 className="font-serif text-4xl sm:text-5xl text-white mb-4">
                The EVOORION <span className="text-gold italic">Journal</span>
              </h1>
              <p className="text-muted text-lg leading-relaxed">
                Expert analysis, market intelligence, and investment insights for the discerning Dubai real estate investor.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-30 bg-brand/95 backdrop-blur-md border-b border-gold-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {/* Tag filters */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTag('')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  !activeTag
                    ? 'bg-gold text-brand border-gold'
                    : 'border-white/15 text-muted hover:text-white hover:border-white/30'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => setActiveTag(activeTag === tag.slug ? '' : tag.slug)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    activeTag === tag.slug
                      ? 'bg-gold text-brand border-gold'
                      : 'border-white/15 text-muted hover:text-white hover:border-white/30'
                  }`}
                >
                  <Tag size={10} />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!loading && totalPosts > 0 && (
            <p className="text-muted text-sm mb-6">
              {totalPosts} article{totalPosts !== 1 ? 's' : ''}
              {activeTag && ` in "${tags.find((t) => t.slug === activeTag)?.name ?? activeTag}"`}
              {debouncedSearch && ` matching "${debouncedSearch}"`}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-gold-border flex items-center justify-center mx-auto mb-4">
                <Search size={22} className="text-muted" />
              </div>
              <h3 className="font-serif text-xl text-white mb-2">No articles found</h3>
              <p className="text-muted text-sm">Try adjusting your search or browse all topics.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setActiveTag('') }}
                className="mt-4 text-gold text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-white/15 text-muted hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-muted text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-white/15 text-muted hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
