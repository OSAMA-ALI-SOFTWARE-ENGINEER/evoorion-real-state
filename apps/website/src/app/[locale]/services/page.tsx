import type { Metadata } from 'next'
import { Building2, Key, TrendingUp, FileText, ShieldCheck, Globe, Users, BarChart3 } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LeadForm } from '@/components/ui/LeadForm'

export const metadata: Metadata = {
  title: 'Our Services | Dubai Real Estate Advisory | EVOORION',
  description: 'Comprehensive real estate services in Dubai — buy, sell, rent, property management, investment advisory, and legal support.',
}

const SERVICES = [
  {
    icon: Building2,
    title: 'Property Sales',
    body: 'Whether buying or selling, our agents navigate every step from valuation and marketing through negotiation and DLD registration — maximising value at every stage.',
    items: ['Free market valuation', 'Professional listing & photography', 'Buyer / seller representation', 'DLD & NOC management'],
  },
  {
    icon: Key,
    title: 'Rental Services',
    body: 'End-to-end rental management for landlords and tenants. We source qualified tenants, handle EJARI registration, and manage the full leasing cycle.',
    items: ['Tenant sourcing & vetting', 'EJARI registration', 'Lease drafting & renewal', 'Maintenance coordination'],
  },
  {
    icon: TrendingUp,
    title: 'Investment Advisory',
    body: 'Data-driven investment guidance tailored to your goals. We identify high-yield opportunities across Dubai\'s most dynamic submarkets.',
    items: ['Portfolio assessment', 'ROI & yield analysis', 'Off-plan opportunities', 'Market timing guidance'],
  },
  {
    icon: BarChart3,
    title: 'Property Management',
    body: 'Leave the day-to-day to us. Our management service handles tenant relationships, maintenance, and financial reporting so you can invest passively.',
    items: ['Tenant communication', 'Maintenance & repairs', 'Rent collection', 'Monthly financial reports'],
  },
  {
    icon: FileText,
    title: 'Legal & Documentation',
    body: 'Expert guidance through Dubai\'s legal framework — from title deeds and MOU drafting to power of attorney and inheritance procedures.',
    items: ['Title deed transfer', 'MOU & SPA drafting', 'Power of attorney', 'Company formation (offshore/onshore)'],
  },
  {
    icon: Globe,
    title: 'International Relocation',
    body: 'Moving to Dubai? We help expatriates and investors settle seamlessly — from property search and school guidance to residency visa support.',
    items: ['Property shortlisting', 'Area familiarisation', 'Visa & Golden Visa guidance', 'School & lifestyle advisory'],
  },
  {
    icon: ShieldCheck,
    title: 'Due Diligence',
    body: 'Independent property checks before you commit. We verify title, outstanding service charges, developer credibility, and project milestones.',
    items: ['Title verification', 'Service charge audit', 'Developer track record', 'Snagging & handover inspection'],
  },
  {
    icon: Users,
    title: 'Corporate Services',
    body: 'Tailored real estate solutions for businesses — office space acquisition, corporate housing, and staff accommodation management.',
    items: ['Office space sourcing', 'Corporate housing portfolios', 'Staff accommodation', 'Lease negotiation'],
  },
]

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-brand text-white">
      {/* Hero */}
      <section className="pt-40 pb-24 px-4 bg-gradient-to-b from-brand-section to-brand">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">What We Offer</p>
            <h1 className="font-serif text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
              Full-Spectrum<br /><span className="text-gold">Real Estate Services</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              From your first property search to long-term portfolio management, EVOORION provides every service you need to invest with confidence in Dubai.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon
              return (
                <ScrollReveal key={svc.title} delay={i * 0.06}>
                  <div className="group bg-brand-section border border-gold-border rounded-sm p-7 hover:border-gold/40 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-sm bg-gold/10 border border-gold-border flex items-center justify-center group-hover:bg-gold/15 transition-colors shrink-0">
                        <Icon size={22} className="text-gold" />
                      </div>
                      <h2 className="text-white font-semibold text-lg group-hover:text-gold transition-colors">{svc.title}</h2>
                    </div>
                    <p className="text-muted text-sm leading-relaxed mb-5">{svc.body}</p>
                    <ul className="mt-auto space-y-2">
                      {svc.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-white/70 text-xs">
                          <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-section">
        <div className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-10">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Get in Touch</p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-white mb-3">
                  How Can We Help You?
                </h2>
                <p className="text-muted">
                  Tell us which service you need and a dedicated advisor will be in touch within 24 hours.
                </p>
              </div>
            </ScrollReveal>
            <LeadForm />
          </div>
        </div>
      </section>
    </main>
  )
}
