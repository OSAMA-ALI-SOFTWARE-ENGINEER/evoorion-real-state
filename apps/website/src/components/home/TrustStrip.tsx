'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

interface Partner {
  name: string
  logo_url: string
}

const DEFAULT_PARTNERS: Partner[] = [
  { name: 'EMAAR',        logo_url: '' },
  { name: 'DAMAC',        logo_url: '' },
  { name: 'SOBHA REALTY', logo_url: '' },
  { name: 'NAKHEEL',      logo_url: '' },
  { name: 'MERAAS',       logo_url: '' },
  { name: 'SELECT GROUP', logo_url: '' },
]

interface Props {
  cms?: Record<string, unknown>
  /** Raw JSON string from settings API — overrides cms trust_strip_developers */
  partnersJson?: string | null
  speedSeconds?: string | null
  stripLabel?: string | null
}

export function TrustStrip({ cms, partnersJson, speedSeconds, stripLabel }: Props) {
  const label = stripLabel ?? (cms?.trust_strip_label as string) ?? 'Trusted by Leading Developers'
  const duration = Math.max(5, Math.min(120, parseInt(speedSeconds ?? '25', 10) || 25))

  let partners: Partner[] = DEFAULT_PARTNERS
  if (partnersJson) {
    try {
      const parsed = JSON.parse(partnersJson)
      if (Array.isArray(parsed) && parsed.length > 0) partners = parsed
    } catch { /* fall back to defaults */ }
  } else if (Array.isArray(cms?.trust_strip_developers)) {
    partners = (cms.trust_strip_developers as string[]).map(name => ({ name, logo_url: '' }))
  }

  return (
    <section className="bg-brand-section py-14 border-y border-gold-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <p className="text-center text-muted text-[10px] tracking-[0.4em] uppercase mb-8">
            {label}
          </p>
        </ScrollReveal>

        <div className="relative overflow-hidden">
          {/* Fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-brand-section to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-brand-section to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex items-center gap-12 sm:gap-20"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration, ease: 'linear', repeat: Infinity }}
          >
            {/* Duplicate for seamless loop */}
            {[...partners, ...partners].map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="shrink-0 flex items-center justify-center"
              >
                {partner.logo_url ? (
                  <div className="relative h-8 w-28 opacity-40 hover:opacity-70 transition-opacity duration-300">
                    <Image
                      src={partner.logo_url}
                      alt={partner.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="font-serif text-xl sm:text-2xl font-bold tracking-[0.12em] text-white/20 hover:text-white/50 transition-colors duration-300 cursor-default select-none whitespace-nowrap">
                    {partner.name}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
