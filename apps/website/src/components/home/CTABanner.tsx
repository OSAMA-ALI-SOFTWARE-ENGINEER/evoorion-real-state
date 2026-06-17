import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export function CTABanner({ cms, bgImage }: { cms?: Record<string, unknown>; bgImage?: string | null }) {
  const eyebrow = (cms?.cta_eyebrow as string) ?? 'Get Started'
  const rawHeadline = (cms?.cta_headline as string) ?? "Ready to Build Your\nDubai Real Estate Portfolio?"
  const [headLine1, headLine2] = rawHeadline.split('\n')
  const body       = (cms?.cta_body as string)   ?? 'Book a private consultation with our experts. No pressure, no obligations — just personalised investment intelligence.'
  const buttonText = (cms?.cta_button as string) ?? 'Book Private Consultation'
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand-section to-brand" />
      {bgImage && (
        <Image src={bgImage} alt="" fill className="object-cover opacity-20" unoptimized />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06),transparent_70%)]" />
      {/* Decorative borders */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-gold/30" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-gold/30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-gold/30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-gold/30" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">{eyebrow}</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            {headLine1}
            <br />
            <span className="text-gold-gradient italic">{headLine2}</span>
          </h2>
          <p className="text-muted text-base sm:text-lg mb-10 max-w-lg mx-auto">
            {body}
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
          >
            {buttonText}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
