import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, ArrowLeft, Tag } from 'lucide-react'
import { getBlogPost } from '@/lib/api'
import { sanitizeBlogContent } from '@/lib/sanitize'
import type { BlogPostSummary } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const res = await getBlogPost(slug)
    const post = res.data.post
    return {
      title: post.meta_title ?? post.title,
      description: post.meta_description ?? post.excerpt ?? undefined,
      openGraph: post.featured_image_url
        ? { images: [{ url: post.featured_image_url }] }
        : undefined,
    }
  } catch {
    return { title: 'Article Not Found' }
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AE', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function RelatedCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="flex gap-4 p-4 bg-brand-section border border-gold-border rounded-xl hover:border-gold/40 transition-all">
        {post.featured_image_url && (
          <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white/5">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="80px"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-muted text-xs mb-1">{formatDate(post.published_at)}</p>
          <h4 className="text-white text-sm font-medium leading-snug group-hover:text-gold transition-colors line-clamp-2">
            {post.title}
          </h4>
          {post.reading_time && (
            <p className="text-muted text-xs mt-1 flex items-center gap-1">
              <Clock size={10} /> {post.reading_time}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  let post, related

  try {
    const res = await getBlogPost(slug)
    post    = res.data.post
    related = res.data.related
  } catch {
    notFound()
  }

  return (
    <article className="min-h-screen pt-24">
      {/* Hero image */}
      {post.featured_image_url && (
        <div className="relative h-[45vh] min-h-[320px] overflow-hidden">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/40 to-transparent" />
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-muted text-sm hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={15} />
              Back to Journal
            </Link>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="flex items-center gap-1 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs font-medium hover:bg-gold/20 transition-colors"
                  >
                    <Tag size={10} />
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-6">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-muted text-sm pb-6 mb-8 border-b border-gold-border">
              <div className="flex items-center gap-2">
                {post.author.avatar_url ? (
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-semibold">
                    {post.author.name[0]}
                  </div>
                )}
                <span>{post.author.name}</span>
              </div>
              <span className="w-px h-4 bg-white/10" />
              <span>{formatDate(post.published_at)}</span>
              {post.reading_time && (
                <>
                  <span className="w-px h-4 bg-white/10" />
                  <span className="flex items-center gap-1"><Clock size={13} />{post.reading_time}</span>
                </>
              )}
              <span className="flex items-center gap-1"><Eye size={13} />{post.view_count} views</span>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-white/70 leading-relaxed mb-8 font-light italic border-l-2 border-gold pl-5">
                {post.excerpt}
              </p>
            )}

            {/* Body — sanitized server-side before render */}
            <div
              className="prose prose-invert prose-gold max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(post.content) }}
            />
          </main>

          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-28 space-y-8">
              {/* Related posts */}
              {related.length > 0 && (
                <div>
                  <h3 className="text-white font-serif text-xl mb-4">Related Articles</h3>
                  <div className="space-y-3">
                    {related.map((r) => <RelatedCard key={r.id} post={r} />)}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="p-6 bg-brand-section border border-gold-border rounded-xl">
                <p className="text-gold text-xs tracking-widest uppercase mb-2">Ready to Invest?</p>
                <h3 className="font-serif text-white text-xl mb-3">Speak with an advisor</h3>
                <p className="text-muted text-sm mb-4 leading-relaxed">
                  Get personalised guidance on Dubai&apos;s most exclusive properties.
                </p>
                <Link
                  href="/contact"
                  className="block w-full text-center py-2.5 bg-gold text-brand text-sm font-semibold rounded-sm hover:bg-gold/90 transition-colors"
                >
                  Book a Private Call
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
