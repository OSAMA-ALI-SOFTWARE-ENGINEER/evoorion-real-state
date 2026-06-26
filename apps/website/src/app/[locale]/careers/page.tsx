import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LeadForm } from '@/components/ui/LeadForm'
import { getJobs, type JobListing } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Careers | Join the EVOORION Team | Dubai Real Estate',
  description: 'Explore career opportunities at EVOORION. Join a growing team of property professionals redefining luxury real estate in Dubai.',
}

export const revalidate = 3600

const TYPE_LABELS: Record<JobListing['type'], string> = {
  full_time:   'Full-Time',
  part_time:   'Part-Time',
  contract:    'Contract',
  internship:  'Internship',
}

const VALUES = [
  { title: 'Excellence First', body: 'We set the bar high in everything we do — from client service to internal standards.' },
  { title: 'Data-Driven', body: 'Decisions are grounded in market intelligence, not gut feel.' },
  { title: 'Client Obsessed', body: 'Every transaction is built around creating exceptional outcomes for clients.' },
  { title: 'Growth Mindset', body: 'We invest in our team\'s development through training, mentorship, and opportunity.' },
]

function JobCard({ job }: { job: JobListing }) {
  return (
    <div className="group bg-brand-section border border-gold-border rounded-sm p-6 hover:border-gold/40 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-gold text-xs tracking-wider uppercase mb-1">{job.department}</p>
          <h3 className="text-white font-semibold text-base group-hover:text-gold transition-colors">{job.title}</h3>
        </div>
        <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm bg-gold/10 text-gold border border-gold-border">
          {TYPE_LABELS[job.type]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-muted text-xs mb-4">
        <span className="flex items-center gap-1.5">
          <MapPin size={11} className="text-gold" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase size={11} className="text-gold" />
          {job.department}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={11} className="text-gold" />
          {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <p className="text-muted text-sm leading-relaxed line-clamp-3 mb-4">{job.description}</p>

      <a
        href="#apply-form"
        className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-wider uppercase hover:gap-2.5 transition-all"
      >
        Apply Now <ChevronRight size={13} />
      </a>
    </div>
  )
}

export default async function CareersPage() {
  notFound()
  let jobs: JobListing[] = []
  try {
    jobs = await getJobs()
  } catch {
    jobs = []
  }

  return (
    <main className="min-h-screen bg-brand text-white">
      {/* Hero */}
      <section className="pt-40 pb-24 px-4 bg-gradient-to-b from-brand-section to-brand">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Join Our Team</p>
            <h1 className="font-serif text-5xl md:text-6xl font-light text-white mb-6">
              Build Your Career<br /><span className="text-gold">at EVOORION</span>
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              We&apos;re looking for ambitious professionals who want to shape the future of luxury real estate in Dubai.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-section">
        <div className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-10">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Our Culture</p>
                <h2 className="font-serif text-3xl font-light text-white">What We Stand For</h2>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((v, i) => (
                <ScrollReveal key={v.title} delay={i * 0.07}>
                  <div className="bg-brand border border-gold-border rounded-sm p-5 h-full">
                    <h3 className="text-gold text-sm font-semibold mb-2">{v.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{v.body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Opportunities</p>
              <h2 className="font-serif text-3xl md:text-4xl font-light text-white">Open Positions</h2>
            </div>
          </ScrollReveal>

          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <ScrollReveal key={job.id} delay={i * 0.07}>
                  <JobCard job={job} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-white/5 rounded-sm">
              <Briefcase size={32} className="text-gold/30 mx-auto mb-4" />
              <p className="text-muted text-sm">No open positions right now.</p>
              <p className="text-muted/60 text-xs mt-1">Send us your CV anyway — we&apos;re always interested in great talent.</p>
            </div>
          )}
        </div>
      </section>

      {/* Apply form */}
      <section className="bg-brand-section">
        <div id="apply-form" className="py-20 px-4 scroll-mt-24">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-10">
                <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Apply Now</p>
                <h2 className="font-serif text-3xl md:text-4xl font-light text-white mb-3">
                  Send Us Your Details
                </h2>
                <p className="text-muted">Mention the role you&apos;re interested in and attach your CV in the message.</p>
              </div>
            </ScrollReveal>
            <LeadForm defaultMessage="I'd like to apply for a position at EVOORION. Please find my details below." />
          </div>
        </div>
      </section>
    </main>
  )
}
