import Image from 'next/image'
import { Star } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Testimonial } from '@/types'

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function TestimonialCard({ item, delay }: { item: Testimonial; delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div className="h-full flex flex-col p-6 sm:p-8 border border-gold-border rounded-sm bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/40 transition-all duration-300">
        {item.rating ? (
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} size={14} className="text-gold" fill="currentColor" />
            ))}
          </div>
        ) : null}

        <p className="font-serif italic text-white/90 text-lg leading-relaxed mb-6 flex-1">
          &ldquo;{item.quote}&rdquo;
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          {item.avatar_url ? (
            <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden border border-gold-border">
              <Image
                src={item.avatar_url}
                alt={item.author_name}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
          ) : (
            <div className="w-11 h-11 shrink-0 rounded-full border border-gold-border bg-gold/10 flex items-center justify-center">
              <span className="font-serif text-sm text-gold font-semibold">{initialsOf(item.author_name)}</span>
            </div>
          )}
          <div>
            <div className="text-white font-semibold text-sm">{item.author_name}</div>
            {item.author_title ? (
              <div className="text-muted text-xs tracking-wide">{item.author_title}</div>
            ) : null}
          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null

  return (
    <section className="py-16 sm:py-24 bg-brand-section relative overflow-hidden">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">CLIENT STORIES</span>
              <div className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Trusted by
              <br />
              <span className="text-gold-gradient italic">Investors Worldwide</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <TestimonialCard key={item.id} item={item} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}
