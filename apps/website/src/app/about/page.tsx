import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Star, HeartHandshake, BarChart3, ArrowRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { getCmsContent } from '@/lib/api'

const DIFF_ICONS = [Shield, Star, HeartHandshake, BarChart3]

const DEFAULT_DIFFERENTIATORS = [
  { title: 'Exclusive Access',    description: "Direct partnerships with Dubai's leading developers give our clients access to pre-launch allocations and off-market properties unavailable to the general public." },
  { title: 'Expert Advisory',     description: "Our team of certified real estate advisors brings decades of combined experience in Dubai's luxury property market, with deep knowledge of every micro-location." },
  { title: 'End-to-End Support',  description: 'From initial consultation and property selection through legal completion, handover, and ongoing management — we handle every detail seamlessly.' },
  { title: 'Proven Track Record', description: "Over AED 2 billion in completed transactions, 500+ satisfied clients, and a portfolio spanning Dubai's most prestigious communities since our founding." },
]

const DEFAULT_STORY_STATS = [
  ['500+', 'Properties Sold'],
  ['AED 2B+', 'Transaction Volume'],
  ['98%', 'Client Satisfaction'],
  ['15+', 'Developer Partnerships'],
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsContent('about')
  return {
    title:       (cms?.meta_title as string)       ?? 'About EVOORION',
    description: (cms?.meta_description as string) ?? "Learn about EVOORION — Dubai's premier luxury real estate investment firm, dedicated to delivering exceptional returns and a seamless investment experience.",
  }
}

export default async function AboutPage() {
  const cms = await getCmsContent('about')

  const heroEyebrow = (cms.hero_eyebrow as string)        ?? 'Our Story'
  const heroLine1   = (cms.hero_headline_line1 as string) ?? 'Built on Trust.'
  const heroLine2   = (cms.hero_headline_line2 as string) ?? 'Driven by Results.'
  const heroBody    = (cms.hero_body as string)           ?? "EVOORION was founded on a singular conviction: that investing in Dubai real estate should be as effortless as it is rewarding. We exist to bridge the gap between world-class properties and the discerning investors who deserve them."

  const storyHeadline = (cms.story_headline as string) ?? 'Our Story'
  const storyBody     = (cms.story_body as string)     ?? ''
  const storyParagraphs = storyBody
    ? storyBody.split('\n\n').filter(Boolean)
    : [
        "EVOORION was established by a team of seasoned real estate professionals who recognised a growing disconnect between the pace of Dubai's property market and the quality of guidance available to international investors.",
        "We set out to build an advisory firm that combined institutional-grade market intelligence with personalised, relationship-first service — one that would treat every client's capital with the same respect we would our own.",
        "Today, EVOORION serves a global clientele of high-net-worth individuals, family offices, and corporate investors, managing some of the most prestigious property portfolios in the UAE.",
      ]

  const storyStats = (cms.story_stats as Array<{ value: string; label: string }>) ?? DEFAULT_STORY_STATS.map(([value, label]) => ({ value, label }))

  const missionQuote  = (cms.mission_quote as string)  ?? "Our mission is to make Dubai's most exceptional real estate accessible to every investor who dreams of building a lasting legacy — regardless of where in the world they call home."
  const missionByline = (cms.mission_byline as string) ?? 'The EVOORION Team'

  const diffEyebrow  = (cms.differentiators_eyebrow as string)  ?? 'Why EVOORION'
  const diffHeadline = (cms.differentiators_headline as string) ?? 'What Sets Us Apart'
  const cmsDs = cms.differentiators as Array<{ title: string; description: string }> | undefined
  const differentiators = (cmsDs ?? DEFAULT_DIFFERENTIATORS).map((d, i) => ({ ...d, icon: DIFF_ICONS[i] ?? Shield }))

  const ctaHeadline = (cms.cta_headline as string) ?? "Let's Build Your Portfolio Together"
  const ctaBody     = (cms.cta_body as string)     ?? 'Schedule a confidential conversation with one of our senior investment advisors.'
  const ctaButton   = (cms.cta_button as string)   ?? 'Get in Touch'

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
              <span className="text-gold text-xs tracking-[0.3em] uppercase">{heroEyebrow}</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              {heroLine1}
              <br />
              <span className="text-gold-gradient italic">{heroLine2}</span>
            </h1>
            <p className="text-muted text-lg leading-relaxed">{heroBody}</p>
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
                  {storyHeadline}
                </h2>
                <div className="space-y-4 text-muted leading-relaxed">
                  {storyParagraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {storyStats.map(({ value, label }) => (
                  <div key={label} className="p-8 border border-gold-border rounded-sm bg-brand-section/50 text-center">
                    <div className="font-serif text-4xl font-bold text-gold mb-2">{value}</div>
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
              &ldquo;{missionQuote}&rdquo;
            </blockquote>
            <div className="h-px w-16 bg-gold mx-auto mb-4" />
            <p className="text-gold text-sm tracking-widest uppercase">{missionByline}</p>
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
                <span className="text-gold text-xs tracking-[0.3em] uppercase">{diffEyebrow}</span>
                <div className="h-px w-10 bg-gold" />
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
                {diffHeadline.includes(' ') ? (
                  <>
                    {diffHeadline.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-gold-gradient italic">{diffHeadline.split(' ').at(-1)}</span>
                  </>
                ) : diffHeadline}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {differentiators.map((d, i) => {
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
              {ctaHeadline}
            </h2>
            <p className="text-muted mb-8">{ctaBody}</p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors"
            >
              {ctaButton}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
