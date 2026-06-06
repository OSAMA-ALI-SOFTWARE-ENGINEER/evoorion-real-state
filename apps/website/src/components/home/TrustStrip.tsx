'use client'

import { motion } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const DEVELOPERS = [
  'EMAAR',
  'DAMAC',
  'SOBHA REALTY',
  'NAKHEEL',
  'MERAAS',
  'SELECT GROUP',
]

export function TrustStrip() {
  return (
    <section className="bg-brand-section py-14 border-y border-gold-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <p className="text-center text-muted text-[10px] tracking-[0.4em] uppercase mb-8">
            Trusted by Leading Developers
          </p>
        </ScrollReveal>

        <div className="relative overflow-hidden">
          {/* Fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-brand-section to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-brand-section to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex items-center gap-12 sm:gap-20"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
          >
            {/* Duplicate for seamless loop */}
            {[...DEVELOPERS, ...DEVELOPERS].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="shrink-0 font-serif text-xl sm:text-2xl font-bold tracking-[0.12em] text-white/20 hover:text-white/50 transition-colors duration-300 cursor-default select-none"
              >
                {name}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
