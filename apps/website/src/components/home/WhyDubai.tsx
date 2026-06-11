import { Percent, TrendingUp, Globe, Award } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const ICONS = [Percent, TrendingUp, Globe, Award]

const DEFAULT_STATS = [
  { value: '0%',    label: 'Property Tax',      description: 'No capital gains or property tax makes Dubai the most tax-efficient real estate market globally.' },
  { value: '8–12%', label: 'Rental Yield',      description: 'Among the highest net rental yields of any global prime city, consistently outperforming London and New York.' },
  { value: '100%',  label: 'Foreign Ownership', description: 'Designated freehold zones allow full foreign ownership with no restrictions on repatriation of funds.' },
  { value: '#1',    label: 'Global Destination', description: "Dubai ranks as the world's most visited city and a top destination for HNWI relocation." },
]

export function WhyDubai({ cms }: { cms?: Record<string, unknown> }) {
  const eyebrow = (cms?.why_dubai_eyebrow as string) ?? 'Why Dubai'
  const rawHeadline = (cms?.why_dubai_headline as string) ?? "The World's Premier\nInvestment Destination"
  const [headLine1, headLine2] = rawHeadline.split('\n')
  const cmsStats = cms?.why_dubai_stats as Array<{ value: string; label: string; description: string }> | undefined
  const STATS = (cmsStats ?? DEFAULT_STATS).map((s, i) => ({ ...s, icon: ICONS[i] ?? Percent }))
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#06090F] via-brand to-brand-section" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.08),transparent_60%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">{eyebrow}</span>
              <div className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              {headLine1}
              <br />
              <span className="text-gold-gradient italic">{headLine2}</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <ScrollReveal key={stat.label} delay={i * 0.12}>
                <div className="group text-center p-8 border border-gold-border rounded-sm bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/40 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-gold-border flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors">
                    <Icon size={24} className="text-gold" />
                  </div>
                  <div className="font-serif text-4xl font-bold text-gold mb-1">{stat.value}</div>
                  <div className="text-white font-semibold text-sm tracking-wider uppercase mb-3">
                    {stat.label}
                  </div>
                  <p className="text-muted text-xs leading-relaxed">{stat.description}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
