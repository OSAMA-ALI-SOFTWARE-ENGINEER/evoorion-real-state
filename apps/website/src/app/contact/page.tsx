import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { LeadForm } from '@/components/ui/LeadForm'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ContactAddressMap } from '@/components/ui/ContactAddressMap'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with EVOORION\'s investment advisors. Book a private consultation or send an enquiry.',
}

type ContactSettings = {
  contact_address?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  contact_whatsapp?: string | null
  contact_hours_weekdays?: string | null
  contact_hours_sunday?: string | null
  social_facebook?: string | null
  social_instagram?: string | null
  social_twitter?: string | null
  social_linkedin?: string | null
  social_youtube?: string | null
}

async function getContactSettings(): Promise<ContactSettings> {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  try {
    const res = await fetch(`${api}/settings`, { next: { revalidate: 60 } })
    if (!res.ok) return {}
    const json = await res.json()
    return (json.data ?? {}) as ContactSettings
  } catch {
    return {}
  }
}

export default async function ContactPage() {
  const s = await getContactSettings()

  const address     = s.contact_address        ?? 'Office 2402, Burj Al Salam Tower, Sheikh Zayed Road, Dubai, UAE'
  const phone       = s.contact_phone          ?? '+971 00 000 0000'
  const email       = s.contact_email          ?? 'invest@evoorion.com'
  const hoursWeek   = s.contact_hours_weekdays ?? 'Monday – Saturday: 9:00 AM – 7:00 PM'
  const hoursSun    = s.contact_hours_sunday   ?? 'Sunday: By Appointment'

  const socials = [
    { name: 'instagram' as const, label: 'Instagram', href: s.social_instagram ?? '#' },
    { name: 'linkedin'  as const, label: 'LinkedIn',  href: s.social_linkedin  ?? '#' },
    ...(s.social_facebook ? [{ name: 'facebook' as const, label: 'Facebook', href: s.social_facebook }] : []),
    ...(s.social_twitter  ? [{ name: 'twitter'  as const, label: 'Twitter',  href: s.social_twitter  }] : []),
  ]

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
            {/* Left: Contact info + map */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="space-y-8">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs tracking-wider uppercase mb-1">Office Address</p>
                      <p className="text-muted text-sm">{address}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs tracking-wider uppercase mb-1">Phone</p>
                      <a href={`tel:${phone.replace(/\s/g, '')}`} className="block text-white hover:text-gold transition-colors text-sm">
                        {phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs tracking-wider uppercase mb-1">Email</p>
                      <a href={`mailto:${email}`} className="block text-white hover:text-gold transition-colors text-sm">
                        {email}
                      </a>
                    </div>
                  </div>

                  {/* Working hours */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs tracking-wider uppercase mb-1">Office Hours</p>
                      <p className="text-muted text-sm">{hoursWeek}</p>
                      {hoursSun && <p className="text-muted text-sm">{hoursSun}</p>}
                    </div>
                  </div>

                  {/* Social */}
                  <div>
                    <p className="text-white/40 text-xs tracking-wider uppercase mb-3">Follow Us</p>
                    <div className="flex gap-3">
                      {socials.map(({ name, label, href }) => (
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

              {/* Map */}
              <ScrollReveal delay={0.2}>
                <ContactAddressMap address={address} />
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
