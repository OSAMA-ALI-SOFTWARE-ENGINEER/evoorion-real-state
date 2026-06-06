import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Star, HeartHandshake, BarChart3, ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export const metadata: Metadata = {
  title: 'About EVOORION',
  description:
    'Learn about EVOORION — Dubai\'s premier luxury real estate investment firm, dedicated to delivering exceptional returns and a seamless investment experience.',
}

const DIFFERENTIATORS = [
  {
    icon: Shield,
    title: 'Exclusive Access',
    description:
      'Direct partnerships with Dubai\'s leading developers give our clients access to pre-launch allocations and off-market properties unavailable to the general public.',
  },
  {
    icon: Star,
    title: 'Expert Advisory',
    description:
      'Our team of certified real estate advisors brings decades of combined experience in Dubai\'s luxury property market, with deep knowledge of every micro-location.',
  },
  {
    icon: HeartHandshake,
    title: 'End-to-End Support',
    description:
      'From initial consultation and property selection through legal completion, handover, and ongoing management — we handle every detail seamlessly.',
  },
  {
    icon: BarChart3,
    title: 'Proven Track Record',
    description:
      'Over AED 2 billion in completed transactions, 500+ satisfied clients, and a portfolio spanning Dubai\'s most prestigious communities since our founding.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">Our Story</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Built on Trust.
              <br />
              <span className="text-gold-gradient italic">Driven by Results.</span>
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              EVOORION was founded on a singular conviction: that investing in Dubai real estate
              should be as effortless as it is rewarding. We exist to bridge the gap between
              world-class properties and the discerning investors who deserve them.
            </p>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="py-20 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted leading-relaxed">
                  <p>
                    EVOORION was established by a team of seasoned real estate professionals who
                    recognised a growing disconnect between the pace of Dubai&apos;s property market
                    and the quality of guidance available to international investors.
                  </p>
                  <p>
                    We set out to build an advisory firm that combined institutional-grade market
                    intelligence with personalised, relationship-first service — one that would
                    treat every client&apos;s capital with the same respect we would our own.
                  </p>
                  <p>
                    Today, EVOORION serves a global clientele of high-net-worth individuals,
                    family offices, and corporate investors, managing some of the most prestigious
                    property portfolios in the UAE.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['500+', 'Properties Sold'],
                  ['AED 2B+', 'Transaction Volume'],
                  ['98%', 'Client Satisfaction'],
                  ['15+', 'Developer Partnerships'],
                ].map(([val, label]) => (
                  <div key={label} className="p-8 border border-gold-border rounded-sm bg-brand-section/50 text-center">
                    <div className="font-serif text-4xl font-bold text-gold mb-2">{val}</div>
                    <div className="text-muted text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.04),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <blockquote className="font-serif text-2xl sm:text-3xl text-white/90 italic leading-relaxed mb-6">
              &ldquo;Our mission is to make Dubai&apos;s most exceptional real estate accessible to every
              investor who dreams of building a lasting legacy — regardless of where in the world
              they call home.&rdquo;
            </blockquote>
            <div className="h-px w-16 bg-gold mx-auto mb-4" />
            <p className="text-gold text-sm tracking-widest uppercase">The EVOORION Team</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Why EVOORION */}
      <section className="py-20 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="h-px w-10 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">Why EVOORION</span>
                <div className="h-px w-10 bg-gold" />
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
                What Sets Us <span className="text-gold-gradient italic">Apart</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = d.icon
              return (
                <ScrollReveal key={d.title} delay={i * 0.1}>
                  <div className="group p-8 border border-white/5 rounded-sm hover:border-gold-border bg-brand-section/30 hover:bg-brand-section/70 transition-all duration-300">
                    <div className="w-12 h-12 rounded-sm border border-gold-border bg-gold/5 group-hover:bg-gold/10 flex items-center justify-center mb-5 transition-colors">
                      <Icon size={22} className="text-gold" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-3 group-hover:text-gold transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">{d.description}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-section border-t border-gold-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              Let&apos;s Build Your Portfolio Together
            </h2>
            <p className="text-muted mb-8">
              Schedule a confidential conversation with one of our senior investment advisors.
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors"
            >
              Get in Touch
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
