import type { Metadata } from 'next'
import { CheckCircle2, TrendingUp, Eye, FileText, Users, Clock } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LeadForm } from '@/components/ui/LeadForm'

export const metadata: Metadata = {
  title: 'Sell Your Property in Dubai | List With Us | EVOORION',
  description: 'List your Dubai property with EVOORION and reach thousands of qualified buyers. Free valuation, professional photography, and full-service representation.',
}

const STATS = [
  { value: '94%', label: 'Asking Price Achieved' },
  { value: '28', label: 'Avg. Days to Sale' },
  { value: '4,800+', label: 'Qualified Buyer Pool' },
  { value: '100%', label: 'Free Valuation' },
]

const STEPS = [
  {
    icon: FileText,
    step: '01',
    title: 'Free Valuation',
    body: 'Our experts analyse comparable sales, current demand, and your property\'s unique features to provide an accurate market valuation — at no cost.',
  },
  {
    icon: Eye,
    step: '02',
    title: 'Premium Listing',
    body: 'Professional photography, 3D floor plans, and compelling copy ensure your listing stands out across all major portals and our private buyer network.',
  },
  {
    icon: Users,
    step: '03',
    title: 'Targeted Outreach',
    body: 'We match your property to pre-qualified buyers from our database of 4,800+ active investors — many transactions close before the property goes public.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Expert Negotiation',
    body: 'Our agents negotiate on your behalf, protecting your interests at every stage and working to achieve the best possible price in the shortest time.',
  },
  {
    icon: Clock,
    step: '05',
    title: 'Smooth Completion',
    body: 'We manage the paperwork, DLD registration, and NOC process end-to-end so you can close with confidence and minimal hassle.',
  },
]

const INCLUSIONS = [
  'Professional photography & videography',
  'Listing on Bayut, Property Finder & Dubizzle',
  'Dedicated listing agent',
  'Buyer qualification & viewings',
  'Negotiation support',
  'DLD & NOC paperwork management',
  'Market pricing analysis',
  'Regular progress updates',
]

export default function SellPage() {
  return (
    <main className="min-h-screen bg-brand text-white">
      {/* Hero */}
      <section className="relative pt-40 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-brand-section" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--color-gold-rgb,200,160,80),0.08),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Sell with Confidence</p>
            <h1 className="font-serif text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
              List Your Property<br />
              <span className="text-gold">With EVOORION</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto mb-10">
              Get a free valuation, professional marketing, and access to our exclusive network of 4,800+ qualified buyers — all with zero upfront fees.
            </p>
            <a
              href="#sell-form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors"
            >
              Get Free Valuation
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-section">
        <div className="py-10 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((s) => (
              <ScrollReveal key={s.label}>
                <div className="text-center">
                  <p className="font-serif text-3xl md:text-4xl text-gold font-light mb-1">{s.value}</p>
                  <p className="text-muted text-xs tracking-wider uppercase">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">The Process</p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-white">How We Sell Your Property</h2>
            </div>
          </ScrollReveal>

          <div className="space-y-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <ScrollReveal key={step.step} delay={i * 0.08}>
                  <div className="flex gap-6 items-start group">
                    <div className="shrink-0 w-14 h-14 rounded-sm bg-gold/10 border border-gold-border flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                      <Icon size={22} className="text-gold" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-gold/40 text-xs font-mono tracking-widest">{step.step}</span>
                        <h3 className="text-white font-semibold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-muted leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-brand-section">
        <div className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Full Service</p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-white">Everything Included</h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
              {INCLUSIONS.map((item, i) => (
                <ScrollReveal key={item} delay={i * 0.05}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-gold shrink-0" />
                    <span className="text-white/80 text-sm">{item}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section id="sell-form" className="py-20 px-4 scroll-mt-24">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Get Started</p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-white mb-3">
                Request Your Free Valuation
              </h2>
              <p className="text-muted">
                Leave your details and a senior agent will contact you within 24 hours.
              </p>
            </div>
          </ScrollReveal>
          <LeadForm />
        </div>
      </section>
    </main>
  )
}
