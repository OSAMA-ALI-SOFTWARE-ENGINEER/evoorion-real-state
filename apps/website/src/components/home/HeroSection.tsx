'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

type OperationTab = 'buy' | 'rent' | 'off-plan'

export function HeroSection({ cms, bgImage }: { cms?: Record<string, unknown>; bgImage?: string | null }) {
  const t  = useTranslations('hero')
  const ts = useTranslations('search')

  const eyebrow      = t('eyebrow')
  const line1        = t('line1')
  const line2        = t('line2')
  const subtext      = t('subtext')
  const ctaPrimary   = t('ctaPrimary')
  const ctaSecondary = t('ctaSecondary')
  const stats = [
    { value: '500+',    label: t('statPropertiesSold') },
    { value: 'AED 2B+', label: t('statTransactions') },
    { value: '98%',     label: t('statClientSatisfaction') },
  ]

  const OP_TABS: { key: OperationTab; label: string }[] = [
    { key: 'buy',      label: ts('buy')     },
    { key: 'rent',     label: ts('rent')    },
    { key: 'off-plan', label: ts('offPlan') },
  ]

  const [operationTab, setOperationTab] = useState<OperationTab>('buy')

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
        {/* Base gradient — uses CSS custom properties so admin theme colors apply */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand via-brand to-brand-section" />
        {bgImage && (
          <Image
            src={bgImage}
            alt=""
            fill
            className="object-cover opacity-50"
            priority
            unoptimized
          />
        )}
        {/* Geometric gold lines — decorative */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="900" x2="720" y2="0" stroke="var(--color-gold)" strokeWidth="1" />
          <line x1="1440" y1="900" x2="720" y2="0" stroke="var(--color-gold)" strokeWidth="1" />
          <line x1="400" y1="900" x2="900" y2="200" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.5" />
          <line x1="1040" y1="900" x2="540" y2="200" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.5" />
          <circle cx="720" cy="0" r="300" fill="none" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.3" />
          <circle cx="720" cy="0" r="500" fill="none" stroke="var(--color-gold)" strokeWidth="0.3" opacity="0.2" />
        </svg>
        {/* Radial gold glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      {/* Content — pt-24 clears the 80px fixed navbar */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-28">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <div className="h-px w-12 bg-gold" />
          <span className="text-gold text-xs tracking-[0.4em] uppercase font-light">
            {eyebrow}
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
          <span className="text-white block">{line1}</span>
          <span className="text-gold-gradient block mt-1">{line2}</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="text-muted text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {subtext}
        </motion.p>

        {/* Operation tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.78 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {OP_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setOperationTab(tab.key)}
              className={`px-7 py-2.5 text-xs tracking-widest uppercase rounded-sm border transition-all duration-200 ${
                operationTab === tab.key
                  ? 'bg-gold text-brand border-gold font-semibold'
                  : 'border-white/25 text-white/70 hover:border-gold/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={`/properties?operation=${operationTab}`}
            className="group flex items-center gap-2.5 px-8 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
          >
            {ctaPrimary}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2.5 px-8 py-4 border border-gold/50 text-white text-sm tracking-widest uppercase rounded-sm hover:border-gold hover:bg-gold/5 transition-all duration-300"
          >
            {ctaSecondary}
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-gold font-serif text-2xl font-bold">{value}</div>
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
