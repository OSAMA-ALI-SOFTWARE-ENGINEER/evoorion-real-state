import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, Home, Users, ArrowRight } from 'lucide-react'
import { WhyDubai } from '@/components/home/WhyDubai'
import { LeadForm } from '@/components/ui/LeadForm'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export const metadata: Metadata = {
  title: 'Investment Opportunities',
  description:
    'Explore off-plan investments, ready properties, and private advisory services for Dubai real estate.',
}

const INVESTMENT_TYPES = [
  {
    icon: TrendingUp,
    title: 'Off-Plan Investments',
    badge: 'HIGH APPRECIATION',
    description:
      'Gain exclusive access to pre-launch opportunities from Dubai\'s most prestigious developers. Secure units at pre-market pricing with structured payment plans extending over construction periods.',
    highlights: [
      'Pre-market pricing advantage',
      'Flexible payment plans (post-handover)',
      'Capital appreciation of 20–40%',
      'Managed by top-tier developers',
    ],
    cta: 'Explore Off-Plan',
  },
  {
    icon: Home,
    title: 'Ready Properties',
    badge: 'IMMEDIATE INCOME',
    description:
      'Acquire fully finished, tenanted or vacant luxury residences generating immediate rental income across Dubai\'s most in-demand neighbourhoods — from the Marina to Palm Jumeirah.',
    highlights: [
      '8–12% annual rental yield',
      'Immediate cash flow from day one',
      'Full property management available',
      'Short & long-term rental strategies',
    ],
    cta: 'Browse Ready Properties',
  },
  {
    icon: Users,
    title: 'Private Advisory',
    badge: 'FULL-SERVICE SUPPORT',
    description:
      'For high-net-worth individuals seeking a completely hands-off investment experience. From market intelligence and property selection to legal structuring and asset management — we handle everything.',
    highlights: [
      'Dedicated investment advisor',
      'Legal structuring & DLD registration',
      'Portfolio diversification strategy',
      'Ongoing asset optimisation',
    ],
    cta: 'Book Advisory Call',
  },
]

export default function InvestmentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Opportunities</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-5">
            Investment <span className="text-gold-gradient italic">Pathways</span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg leading-relaxed">
            Three proven strategies to build, grow, and secure your Dubai real estate portfolio —
            each tailored to your investment horizon and lifestyle goals.
          </p>
        </div>
      </section>

      {/* Investment type cards */}
      <section className="py-20 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {INVESTMENT_TYPES.map((type, i) => {
            const Icon = type.icon
            const isReversed = i % 2 === 1
            return (
              <ScrollReveal key={type.title} delay={0.1}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gold-border rounded-sm overflow-hidden ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Icon panel */}
                  <div className={`flex flex-col justify-center p-10 bg-brand-section ${isReversed ? 'lg:order-2' : ''}`}>
                    <span className="text-[10px] tracking-[0.3em] text-gold uppercase mb-3">
                      {type.badge}
                    </span>
                    <div className="w-16 h-16 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center mb-5">
                      <Icon size={28} className="text-gold" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-white mb-4">{type.title}</h2>
                    <p className="text-muted leading-relaxed mb-6">{type.description}</p>
                    <Link
                      href="/contact"
                      className="group inline-flex items-center gap-2 text-gold text-sm tracking-wider hover:gap-3 transition-all"
                    >
                      {type.cta}
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Highlights panel */}
                  <div className={`p-10 bg-brand ${isReversed ? 'lg:order-1' : ''}`}>
                    <h3 className="text-white/50 text-xs tracking-[0.2em] uppercase mb-6">Key Benefits</h3>
                    <ul className="space-y-4">
                      {type.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full border border-gold-border flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                          </div>
                          <span className="text-white/80 leading-relaxed">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* Why Dubai stats */}
      <WhyDubai />

      {/* Lead form */}
      <section className="py-20 bg-brand">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
                Start Your Investment Journey
              </h2>
              <p className="text-muted">Our advisors will reach out within 24 hours.</p>
            </div>
            <div className="border border-gold-border rounded-sm p-8 bg-brand-section/50">
              <LeadForm variant="compact" />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
