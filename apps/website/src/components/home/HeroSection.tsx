'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'

export function HeroSection() {
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        {/* Dubai skyline silhouette via CSS */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06090F] via-[#0A0F1E] to-[#0D1526]" />
        {/* Geometric gold lines — decorative */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="900" x2="720" y2="0" stroke="#C9A84C" strokeWidth="1" />
          <line x1="1440" y1="900" x2="720" y2="0" stroke="#C9A84C" strokeWidth="1" />
          <line x1="400" y1="900" x2="900" y2="200" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5" />
          <line x1="1040" y1="900" x2="540" y2="200" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5" />
          <circle cx="720" cy="0" r="300" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3" />
          <circle cx="720" cy="0" r="500" fill="none" stroke="#C9A84C" strokeWidth="0.3" opacity="0.2" />
        </svg>
        {/* Radial gold glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      {/* Content — pt-24 clears the 80px fixed navbar */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <div className="h-px w-12 bg-gold" />
          <span className="text-gold text-xs tracking-[0.4em] uppercase font-light">
            Luxury Real Estate Investment
          </span>
          <div className="h-px w-12 bg-gold" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-4"
        >
          <span className="text-white block">Invest in Dubai.</span>
          <span className="text-gold-gradient block mt-1">Secure Your Legacy.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="text-muted text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Exclusive off-market opportunities. High returns. Full-service investment advisory.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/properties"
            className="group flex items-center gap-2.5 px-8 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
          >
            Explore Opportunities
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2.5 px-8 py-4 border border-gold/50 text-white text-sm tracking-widest uppercase rounded-sm hover:border-gold hover:bg-gold/5 transition-all duration-300"
          >
            Book Private Call
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            ['500+', 'Properties Sold'],
            ['AED 2B+', 'Transactions'],
            ['98%', 'Client Satisfaction'],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="text-gold font-serif text-2xl font-bold">{val}</div>
              <div className="text-muted text-xs tracking-wider uppercase mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 z-20"
      >
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  )
}
