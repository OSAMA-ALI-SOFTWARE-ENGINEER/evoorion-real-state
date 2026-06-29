import Image from 'next/image'
import { Percent, TrendingUp, Globe, Award } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const ICONS = [Percent, TrendingUp, Globe, Award]

export async function WhyDubai({ cms, bgImage }: { cms?: Record<string, unknown>; bgImage?: string | null }) {
  const t = await getTranslations('whyDubai')

  const eyebrow  = t('eyebrow')
  const headLine1 = t('headline1')
  const headLine2 = t('headline2')

  const STATS = [
    { value: t('stat1Value'), label: t('stat1Label'), description: t('stat1Desc'), icon: ICONS[0] },
    { value: t('stat2Value'), label: t('stat2Label'), description: t('stat2Desc'), icon: ICONS[1] },
    { value: t('stat3Value'), label: t('stat3Label'), description: t('stat3Desc'), icon: ICONS[2] },
    { value: t('stat4Value'), label: t('stat4Label'), description: t('stat4Desc'), icon: ICONS[3] },
  ]

  const bgImg = (cms?.image_why_dubai as string) ?? bgImage

  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

        {/* Left — featured image */}
        <div className="relative h-72 lg:h-auto order-2 lg:order-1">
          {bgImg ? (
            <Image
              src={bgImg}
              alt="Dubai Investment"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-section to-brand" />
          )}
          {/* Gold overlay on the right edge to blend into content */}
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-brand to-transparent hidden lg:block" />
          {/* Bottom overlay for mobile */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand to-transparent lg:hidden" />
        </div>

        {/* Right — heading + stats */}
        <div className="order-1 lg:order-2 bg-brand relative py-14 sm:py-20 px-5 sm:px-12 lg:px-16 flex flex-col justify-center">
          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-gold/30 via-transparent to-transparent" />

          <ScrollReveal>
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">{eyebrow}</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
                {headLine1}
                <br />
                <span className="text-gold-gradient italic">{headLine2}</span>
              </h2>
            </div>
          </ScrollReveal>

          {/* 2×2 stat grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat, i) => {
              const Icon = stat.icon
              return (
                <ScrollReveal key={stat.label} delay={i * 0.1}>
                  <div className="group p-4 sm:p-6 border border-gold-border rounded-sm bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/40 transition-all duration-300">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border border-gold-border flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors">
                        <Icon size={14} className="text-gold" />
                      </div>
                      <div className="font-serif text-2xl sm:text-3xl font-bold text-gold leading-none pt-1">{stat.value}</div>
                    </div>
                    <div className="text-white font-semibold text-xs tracking-wider uppercase mb-1.5">{stat.label}</div>
                    <p className="text-muted text-xs leading-relaxed">{stat.description}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>

          {/* Decorative bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-gold/30 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  )
}
