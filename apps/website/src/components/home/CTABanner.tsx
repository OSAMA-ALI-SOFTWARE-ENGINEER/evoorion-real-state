import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export function CTABanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#060A15] via-brand-section to-[#060A15]" />
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
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Get Started</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
            Ready to Build Your
            <br />
            <span className="text-gold-gradient italic">Dubai Real Estate Portfolio?</span>
          </h2>
          <p className="text-muted text-base sm:text-lg mb-10 max-w-lg mx-auto">
            Book a private consultation with our experts. No pressure, no obligations — just
            personalised investment intelligence.
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
          >
            Book Private Consultation
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
