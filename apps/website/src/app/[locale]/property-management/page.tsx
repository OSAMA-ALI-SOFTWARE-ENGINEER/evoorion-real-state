import type { Metadata } from 'next'
import { Wrench, BarChart3, Shield, Users, Clock, BadgePercent, CheckCircle2 } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LeadForm } from '@/components/ui/LeadForm'

export const metadata: Metadata = {
  title: 'Property Management Dubai | Hassle-Free Rental Management | EVOORION',
  description: 'Professional property management in Dubai. Tenant sourcing, rent collection, maintenance coordination, and financial reporting — all handled for you.',
}

const STATS = [
  { value: '98%', label: 'Occupancy Rate' },
  { value: '72h', label: 'Avg. Maintenance Response' },
  { value: '320+', label: 'Managed Units' },
  { value: '5%', label: 'Management Fee' },
]

const FEATURES = [
  {
    icon: Users,
    title: 'Tenant Sourcing & Screening',
    body: 'We market your property across all major portals and conduct thorough background checks — employment verification, credit history, and reference checks.',
  },
  {
    icon: BadgePercent,
    title: 'Rent Collection',
    body: 'Automated rent reminders, PDC management, and direct monthly transfers to your nominated account — always on time, always transparent.',
  },
  {
    icon: Wrench,
    title: 'Maintenance & Repairs',
    body: 'A vetted network of contractors handles all maintenance requests with same-day emergency response and a full audit trail for every job.',
  },
  {
    icon: BarChart3,
    title: 'Financial Reporting',
    body: 'Detailed monthly statements showing income, expenses, and net yield — accessible anytime through your dedicated owner dashboard.',
  },
  {
    icon: Shield,
    title: 'Legal & Compliance',
    body: 'EJARI registration, tenancy contract renewals, eviction proceedings, and RERA compliance — fully handled by our legal team.',
  },
  {
    icon: Clock,
    title: 'Handover & Snagging',
    body: 'Thorough move-in / move-out inspections with photographic documentation protect your asset and resolve disputes fairly and swiftly.',
  },
]

const INCLUSIONS = [
  'Property marketing & photography',
  'Tenant sourcing & qualification',
  'EJARI registration & renewal',
  'Rent collection & PDC management',
  'Maintenance coordination (24/7 emergency)',
  'Monthly financial statements',
  'Annual market rent review',
  'Vacant property security checks',
  'Legal & eviction support',
  'Owner portal access',
]

export default function PropertyManagementPage() {
  return (
    <main className="min-h-screen bg-brand text-white">
      {/* Hero */}
      <section className="relative pt-40 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-brand-section" />
        <div className="relative max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Passive Income, Perfected</p>
            <h1 className="font-serif text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
              Property Management<br /><span className="text-gold">Done Right</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto mb-10">
              We take care of everything — tenants, maintenance, rent, and compliance — so your Dubai investment earns passively while you focus on what matters.
            </p>
            <a
              href="#management-form"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors"
            >
              Get a Free Quote
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-section">
        <div className="py-10 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">What We Handle</p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-white">Everything, End to End</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <ScrollReveal key={f.title} delay={i * 0.07}>
                  <div className="group bg-brand-section border border-gold-border rounded-sm p-6 hover:border-gold/40 transition-all duration-300 h-full">
                    <div className="w-11 h-11 rounded-sm bg-gold/10 border border-gold-border flex items-center justify-center mb-4 group-hover:bg-gold/15 transition-colors">
                      <Icon size={20} className="text-gold" />
                    </div>
                    <h3 className="text-white font-semibold mb-2 group-hover:text-gold transition-colors">{f.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{f.body}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* All-inclusive list */}
      <section className="bg-brand-section">
        <div className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">All-Inclusive</p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-white">No Hidden Extras</h2>
                <p className="text-muted mt-3 max-w-xl mx-auto">Our flat 5% management fee covers everything listed below — no surprise charges.</p>
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
      <section id="management-form" className="py-20 px-4 scroll-mt-24">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Free Quote</p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-white mb-3">
                Hand Over the Keys
              </h2>
              <p className="text-muted">Tell us about your property and we&apos;ll prepare a tailored management proposal.</p>
            </div>
          </ScrollReveal>
          <LeadForm />
        </div>
      </section>
    </main>
  )
}
