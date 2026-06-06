import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { LeadForm } from '@/components/ui/LeadForm'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with EVOORION\'s investment advisors. Book a private consultation or send an enquiry.',
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Office Address',
    lines: ['Office 2402, Burj Al Salam Tower', 'Sheikh Zayed Road, Dubai, UAE'],
  },
  {
    icon: Phone,
    label: 'Phone',
    lines: ['+971 00 000 0000'],
    href: 'tel:+971000000000',
  },
  {
    icon: Mail,
    label: 'Email',
    lines: ['invest@evoorion.com'],
    href: 'mailto:invest@evoorion.com',
  },
  {
    icon: Clock,
    label: 'Office Hours',
    lines: ['Monday – Saturday: 9:00 AM – 7:00 PM', 'Sunday: By Appointment'],
  },
]

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Get in Touch</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-5">
            Start Your <span className="text-gold-gradient italic">Conversation</span>
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Our senior advisors are available for private consultations — in person, by phone,
            or via video call, wherever you are in the world.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-16 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Contact info */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="space-y-8">
                  {CONTACT_INFO.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex gap-4">
                        <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-gold" />
                        </div>
                        <div>
                          <p className="text-white/40 text-xs tracking-wider uppercase mb-1">
                            {item.label}
                          </p>
                          {item.lines.map((line) =>
                            item.href ? (
                              <a
                                key={line}
                                href={item.href}
                                className="block text-white hover:text-gold transition-colors text-sm"
                              >
                                {line}
                              </a>
                            ) : (
                              <p key={line} className="text-muted text-sm">
                                {line}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Social */}
                  <div>
                    <p className="text-white/40 text-xs tracking-wider uppercase mb-3">
                      Follow Us
                    </p>
                    <div className="flex gap-3">
                      {(
                      [
                        { name: 'instagram' as const, label: 'Instagram', href: '#' },
                        { name: 'linkedin' as const, label: 'LinkedIn', href: '#' },
                      ] as const
                    ).map(({ name, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        className="w-9 h-9 flex items-center justify-center border border-gold-border rounded-sm text-muted hover:text-gold hover:border-gold transition-colors"
                      >
                        <SocialIcon name={name} size={15} />
                      </a>
                    ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Map placeholder */}
              <ScrollReveal delay={0.2}>
                <div className="mt-10 aspect-[4/3] rounded-sm overflow-hidden border border-white/5 bg-brand-section/50 flex items-center justify-center">
                  <div className="text-center text-muted/40">
                    <MapPin size={32} className="mx-auto mb-2 text-gold/20" />
                    <p className="text-xs tracking-wider uppercase">Burj Al Salam Tower</p>
                    <p className="text-xs">Sheikh Zayed Road, Dubai</p>
                    <p className="text-xs mt-2 text-muted/30">Map integration coming soon</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={0.15}>
                <div className="p-8 border border-gold-border rounded-sm bg-brand-section/30">
                  <LeadForm
                    title="Book a Private Consultation"
                    subtitle="Complete the form and an advisor will be in touch within 2 hours during office hours."
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
