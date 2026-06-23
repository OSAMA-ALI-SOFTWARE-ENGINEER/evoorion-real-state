import { TrendingUp, Home, Users } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { SectionBackground } from '@/components/ui/SectionBackground'

const ICONS = [TrendingUp, Home, Users]

const DEFAULT_SERVICES = [
  { title: 'Off-Plan Investments', description: "Access pre-launch opportunities from Dubai's most prestigious developers. Secure units at pre-market pricing with flexible payment plans and exceptional capital appreciation potential." },
  { title: 'Ready Properties',     description: "Immediate rental income from handpicked ready-to-occupy villas, apartments, and penthouses in Dubai's most sought-after communities — delivering 8–12% annual rental yields." },
  { title: 'Private Advisory',     description: 'End-to-end investment management: market intelligence, legal structuring, property management, and portfolio optimisation — all handled by our expert team.' },
]

export function WhatWeDo({ cms, bgJson }: { cms?: Record<string, unknown>; bgJson?: string | null }) {
  const eyebrow  = (cms?.what_we_do_eyebrow as string) ?? 'What We Do'
  const body     = (cms?.what_we_do_body as string)    ?? 'EVOORION is a Dubai-based luxury real estate investment firm dedicated to helping high-net-worth individuals build and grow their real estate portfolios with confidence and precision.'
  const rawHeadline = (cms?.what_we_do_headline as string) ?? "Strategic Investments.\nTailored for You."
  const [headLine1, headLine2] = rawHeadline.split('\n')
  const cmsServices = cms?.what_we_do_services as Array<{ title: string; description: string }> | undefined
  const services = (cmsServices ?? DEFAULT_SERVICES).map((s, i) => ({ ...s, icon: ICONS[i] ?? TrendingUp }))
  return (
    <section className="py-24 bg-brand relative overflow-hidden">
      <SectionBackground bgJson={bgJson} opacity={20} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top: heading block */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end mb-14">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">{eyebrow}</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
                {headLine1}
                <br />
                <span className="text-gold-gradient italic">{headLine2}</span>
              </h2>
            </div>
            <p className="text-muted leading-relaxed lg:pb-2">{body}</p>
          </div>
        </ScrollReveal>

        {/* Bottom: 3-column service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <ScrollReveal key={service.title} delay={i * 0.15}>
                <div className="group flex flex-col p-8 rounded-sm border border-white/5 hover:border-gold-border bg-brand-section/50 hover:bg-brand-section transition-all duration-300 h-full">
                  <div className="shrink-0 w-12 h-12 rounded-sm border border-gold-border flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors mb-5">
                    <Icon size={22} className="text-gold" />
                  </div>
                  <h3 className="text-white font-semibold mb-3 tracking-wide text-sm uppercase group-hover:text-gold transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">{service.description}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
