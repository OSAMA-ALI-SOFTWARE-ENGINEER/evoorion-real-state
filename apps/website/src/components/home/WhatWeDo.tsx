import { TrendingUp, Home, Users } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const SERVICES = [
  {
    icon: TrendingUp,
    title: 'Off-Plan Investments',
    description:
      'Access pre-launch opportunities from Dubai\'s most prestigious developers. Secure units at pre-market pricing with flexible payment plans and exceptional capital appreciation potential.',
  },
  {
    icon: Home,
    title: 'Ready Properties',
    description:
      'Immediate rental income from handpicked ready-to-occupy villas, apartments, and penthouses in Dubai\'s most sought-after communities — delivering 8–12% annual rental yields.',
  },
  {
    icon: Users,
    title: 'Private Advisory',
    description:
      'End-to-end investment management: market intelligence, legal structuring, property management, and portfolio optimisation — all handled by our expert team.',
  },
]

export function WhatWeDo() {
  return (
    <section className="py-24 bg-brand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left heading */}
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">What We Do</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
                Strategic Investments.
                <br />
                <span className="text-gold-gradient italic">Tailored for You.</span>
              </h2>
              <p className="text-muted mt-6 leading-relaxed max-w-md">
                EVOORION is a Dubai-based luxury real estate investment firm dedicated to helping
                high-net-worth individuals build and grow their real estate portfolios with
                confidence and precision.
              </p>
              <div className="mt-8 h-px w-full bg-gradient-to-r from-gold/40 to-transparent" />
            </div>
          </ScrollReveal>

          {/* Right cards */}
          <div className="space-y-5">
            {SERVICES.map((service, i) => {
              const Icon = service.icon
              return (
                <ScrollReveal key={service.title} delay={i * 0.15}>
                  <div className="group flex gap-5 p-6 rounded-sm border border-white/5 hover:border-gold-border bg-brand-section/50 hover:bg-brand-section transition-all duration-300">
                    <div className="shrink-0 w-12 h-12 rounded-sm border border-gold-border flex items-center justify-center bg-gold/5 group-hover:bg-gold/10 transition-colors">
                      <Icon size={22} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2 group-hover:text-gold transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
