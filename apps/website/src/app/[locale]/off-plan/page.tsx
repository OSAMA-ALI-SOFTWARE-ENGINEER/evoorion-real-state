import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, TrendingUp, BadgePercent, CalendarCheck, ShieldCheck, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LeadForm } from '@/components/ui/LeadForm'
import { SectionBackground } from '@/components/ui/SectionBackground'
import { OffPlanGrid } from '@/components/ui/OffPlanGrid'
import { getCmsContent, getPublicSettings } from '@/lib/api'
import type { PropertySummary, OperationType } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsContent('off-plan')
  return {
    title:       (cms?.meta_title as string)       ?? 'Off-Plan Properties Dubai | New Developments | EVOORION',
    description: (cms?.meta_description as string) ?? 'Invest in Dubai\'s most anticipated new developments. Pre-launch pricing, flexible payment plans, and 20–40% capital appreciation during construction.',
  }
}

const BENEFITS = [
  {
    icon: BadgePercent,
    title: 'Pre-Market Entry Price',
    body: 'Secure units at 15–30% below projected market value before public launch — exclusive access only available through registered agents.',
  },
  {
    icon: CalendarCheck,
    title: 'Flexible Payment Plans',
    body: 'Spread payments across construction milestones. Post-handover plans allow you to pay the balance from rental income after you receive the keys.',
  },
  {
    icon: TrendingUp,
    title: '20–40% Capital Appreciation',
    body: 'Dubai\'s fastest-growing areas consistently deliver 20–40% growth between contract signing and handover — often within 2–4 years.',
  },
  {
    icon: ShieldCheck,
    title: 'Developer Warranties',
    body: '1-year defect liability and 10-year structural warranty on all new builds. ESCROW-protected payments guarantee your capital is ring-fenced.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Choose Your Development',
    body: 'Browse our curated portfolio of off-plan projects from Dubai\'s most prestigious developers — each rigorously vetted for location, ROI potential, and developer track record.',
  },
  {
    step: '02',
    title: 'Reserve & Structure Your Plan',
    body: 'A typical reservation requires 5–20% upfront. We negotiate the optimal payment schedule on your behalf — construction-linked or post-handover, matched to your cashflow.',
  },
  {
    step: '03',
    title: 'We Manage Everything to Handover',
    body: 'From DLD registration and ESCROW monitoring to snagging and rental management post-handover — your dedicated advisor handles every step.',
  },
]

async function fetchOffPlanProperties(): Promise<PropertySummary[]> {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  try {
    // First get operation types to find the Off-plan ID
    const opRes = await fetch(`${api}/operation-types`, { next: { revalidate: 3600 } })
    if (!opRes.ok) return []
    const opJson = await opRes.json()
    const opTypes: OperationType[] = opJson.data ?? []
    const offPlan = opTypes.find((o) => o.name === 'Off-plan')
    if (!offPlan) return []

    // Fetch off-plan properties — newest first, up to 9
    const pRes = await fetch(
      `${api}/properties?operation_type_id=${offPlan.id}&per_page=9&sort_by=created_at&sort_direction=desc`,
      { next: { revalidate: 300 } },
    )
    if (!pRes.ok) return []
    const pJson = await pRes.json()
    return (pJson.data ?? []) as PropertySummary[]
  } catch {
    return []
  }
}

export default async function OffPlanPage() {
  const [properties, settings, cms] = await Promise.all([
    fetchOffPlanProperties(),
    getPublicSettings().catch(() => ({} as Awaited<ReturnType<typeof getPublicSettings>>)),
    getCmsContent('off-plan'),
  ])

  const heroEyebrow        = (cms.hero_eyebrow as string)        ?? 'New Developments'
  const heroHeadlinePrefix = (cms.hero_headline_prefix as string) ?? "Own Dubai's"
  const heroHeadlineGold   = (cms.hero_headline_gold as string)   ?? 'Future Skyline'
  const heroHeadlineSuffix = (cms.hero_headline_suffix as string) ?? 'First'
  const heroSubtext  = (cms.hero_subtext as string)  ?? "Pre-launch access to Dubai's most anticipated new developments. Entry pricing, structured payment plans, and capital appreciation that begins the moment you sign — before a single brick is laid."
  const heroCtaPrimary   = (cms.hero_cta_primary as string)   ?? 'View Developments'
  const heroCtaSecondary = (cms.hero_cta_secondary as string) ?? 'Book Private Briefing'

  const benefitsEyebrow  = (cms.benefits_eyebrow as string)  ?? 'Why Off-Plan'
  const benefitsHeadline = (cms.benefits_headline as string) ?? 'The Off-Plan Advantage'

  const developmentsEyebrow  = (cms.developments_eyebrow as string)  ?? 'Portfolio'
  const developmentsHeadline = (cms.developments_headline as string) ?? 'Current Developments'

  const processEyebrow  = (cms.process_eyebrow as string)  ?? 'The Process'
  const processHeadline = (cms.process_headline as string) ?? 'How It Works'

  const ctaEyebrow   = (cms.cta_eyebrow as string)   ?? 'Get Started'
  const ctaHeadline  = (cms.cta_headline as string)  ?? 'Reserve Your Off-Plan Unit'
  const ctaBody      = (cms.cta_body as string)      ?? "Speak with a dedicated off-plan advisor. We'll match you with the right development based on your budget, timeline, and investment goals — and guide you from reservation through to handover."
  const formTitle    = (cms.form_title as string)    ?? 'Book an Off-Plan Briefing'
  const formSubtitle = (cms.form_subtitle as string) ?? 'An advisor will contact you within 2 hours during office hours.'

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-brand-section relative overflow-hidden">
        <SectionBackground bgJson={settings.section_bg_hero_investments} opacity={14} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.08),transparent_55%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-gold" />
              <span className="text-gold text-xs tracking-[0.35em] uppercase">{heroEyebrow}</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              {heroHeadlinePrefix}{' '}
              <span className="text-gold-gradient">{heroHeadlineGold}</span>{' '}
              {heroHeadlineSuffix}
            </h1>
            <p className="text-muted text-lg max-w-2xl mb-10 leading-relaxed">
              {heroSubtext}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#developments"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
              >
                {heroCtaPrimary}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 px-8 py-4 border border-gold/50 text-white text-sm tracking-widest uppercase rounded-sm hover:border-gold hover:bg-gold/5 transition-all duration-300"
              >
                {heroCtaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-brand">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">{benefitsEyebrow}</span>
                <div className="h-px w-8 bg-gold" />
              </div>
              <h2 className="font-serif text-4xl font-bold text-white">
                {benefitsHeadline}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon
              return (
                <ScrollReveal key={b.title} delay={i * 0.08}>
                  <div className="p-6 border border-gold-border rounded-sm bg-brand-section/40 hover:border-gold/40 transition-colors h-full">
                    <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center mb-5">
                      <Icon size={18} className="text-gold" />
                    </div>
                    <h3 className="text-white font-semibold text-sm tracking-wide mb-3">{b.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{b.body}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Available Developments */}
      <section id="developments" className="py-20 bg-brand-section">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="h-px w-8 bg-gold" />
                  <span className="text-gold text-xs tracking-[0.3em] uppercase">{developmentsEyebrow}</span>
                </div>
                <h2 className="font-serif text-4xl font-bold text-white">
                  {developmentsHeadline}
                </h2>
              </div>
              <Link
                href="/properties?operation=off-plan"
                className="hidden sm:flex items-center gap-1.5 text-gold hover:text-gold-light text-xs tracking-widest uppercase transition-colors"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
          </ScrollReveal>

          <OffPlanGrid properties={properties} />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-brand">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">{processEyebrow}</span>
                <div className="h-px w-8 bg-gold" />
              </div>
              <h2 className="font-serif text-4xl font-bold text-white">{processHeadline}</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop only */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 0.1}>
                <div className="relative text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm border border-gold-border bg-gold/5 mb-6 relative">
                    <span className="font-serif text-2xl font-bold text-gold">{step.step}</span>
                  </div>
                  <h3 className="text-white font-semibold text-base mb-3">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{step.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Lead Form */}
      <section className="py-20 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,168,76,0.05),transparent_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <ScrollReveal>
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">{ctaEyebrow}</span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-white mb-5">
                {ctaHeadline}
              </h2>
              <p className="text-muted leading-relaxed mb-8">
                {ctaBody}
              </p>
              <ul className="space-y-3">
                {[
                  'Pre-launch pricing secured before public release',
                  'Payment plan negotiated on your behalf',
                  'Full DLD registration and ESCROW management',
                  'Post-handover rental management available',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="p-8 border border-gold-border rounded-sm bg-brand/60">
                <LeadForm
                  title={formTitle}
                  subtitle={formSubtitle}
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  )
}
