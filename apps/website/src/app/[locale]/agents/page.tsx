import type { Metadata } from 'next'
import Image from 'next/image'
import { Phone, Mail, MessageCircle, Building2, LayoutGrid } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LeadForm } from '@/components/ui/LeadForm'
import { getAgents, getCmsContent, type PublicAgent } from '@/lib/api'

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsContent('agents')
  return {
    title:       (cms?.meta_title as string)       ?? 'Our Agents | Expert Dubai Property Advisors | EVOORION',
    description: (cms?.meta_description as string) ?? 'Meet our team of licensed Dubai property advisors. Each agent brings deep market knowledge and a dedicated commitment to finding your perfect investment.',
  }
}

export const revalidate = 3600

function AgentCard({ agent }: { agent: PublicAgent }) {
  const initials = agent.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="group bg-brand-section border border-gold-border rounded-sm overflow-hidden hover:border-gold/40 transition-all duration-300 flex flex-col">
      {/* Avatar */}
      <div className="relative h-56 bg-brand overflow-hidden">
        {agent.avatar_url ? (
          <Image
            src={agent.avatar_url}
            alt={agent.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gold/10">
            <span className="font-serif text-4xl text-gold/60 font-light">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand/60 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-white font-semibold text-base mb-0.5 group-hover:text-gold transition-colors">{agent.name}</h3>
        {agent.agency && (
          <p className="text-muted text-xs tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Building2 size={11} />
            {agent.agency.name}
          </p>
        )}

        {agent.listings > 0 && (
          <p className="text-muted text-xs mb-4 flex items-center gap-1.5">
            <LayoutGrid size={11} className="text-gold" />
            {agent.listings} active listing{agent.listings !== 1 ? 's' : ''}
          </p>
        )}

        <div className="mt-auto flex gap-2">
          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-white/10 rounded-sm text-muted hover:text-white hover:border-white/30 text-xs transition-colors"
              aria-label={`Call ${agent.name}`}
            >
              <Phone size={12} />
              Call
            </a>
          )}
          {agent.whatsapp && (
            <a
              href={`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-white/10 rounded-sm text-muted hover:text-white hover:border-white/30 text-xs transition-colors"
              aria-label={`WhatsApp ${agent.name}`}
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          )}
          {agent.email && (
            <a
              href={`mailto:${agent.email}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-white/10 rounded-sm text-muted hover:text-white hover:border-white/30 text-xs transition-colors"
              aria-label={`Email ${agent.name}`}
            >
              <Mail size={12} />
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function AgentsPage() {
  let agents: PublicAgent[] = []
  try {
    agents = await getAgents()
  } catch {
    agents = []
  }
  const cms = await getCmsContent('agents')

  const heroEyebrow        = (cms.hero_eyebrow as string)        ?? 'Our Team'
  const heroHeadlinePrefix = (cms.hero_headline_prefix as string) ?? 'Expert Property'
  const heroHeadlineGold   = (cms.hero_headline_gold as string)   ?? 'Advisors'
  const heroSubtext        = (cms.hero_subtext as string)        ?? 'Licensed, market-tested professionals committed to finding your perfect Dubai property investment.'

  const emptyStateText = (cms.empty_state_text as string) ?? 'Our team profiles are coming soon.'

  const ctaEyebrow   = (cms.cta_eyebrow as string)   ?? 'Work With Us'
  const ctaHeadline  = (cms.cta_headline as string)  ?? 'Speak to an Agent'
  const ctaBody      = (cms.cta_body as string)      ?? "Tell us what you're looking for and we'll match you with the right advisor."

  return (
    <main className="min-h-screen bg-brand text-white">
      {/* Hero */}
      <section className="pt-40 pb-20 px-4 bg-gradient-to-b from-brand-section to-brand">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">{heroEyebrow}</p>
            <h1 className="font-serif text-5xl md:text-6xl font-light text-white mb-6">
              {heroHeadlinePrefix}<br /><span className="text-gold">{heroHeadlineGold}</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              {heroSubtext}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Agents grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {agents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, i) => (
                <ScrollReveal key={agent.id} delay={i * 0.06}>
                  <AgentCard agent={agent} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted text-sm">{emptyStateText}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-section">
        <div className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-10">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">{ctaEyebrow}</p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-white mb-3">
                  {ctaHeadline}
                </h2>
                <p className="text-muted">{ctaBody}</p>
              </div>
            </ScrollReveal>
            <LeadForm />
          </div>
        </div>
      </section>
    </main>
  )
}
