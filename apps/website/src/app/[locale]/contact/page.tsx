import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { getLocale } from 'next-intl/server'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { LeadForm } from '@/components/ui/LeadForm'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ContactAddressMap } from '@/components/ui/ContactAddressMap'
import { getCmsContent } from '@/lib/api'
import { SectionBackground } from '@/components/ui/SectionBackground'

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsContent('contact')
  return {
    title:       (cms?.meta_title as string)       ?? 'Contact Us',
    description: (cms?.meta_description as string) ?? "Get in touch with EVOORION's investment advisors. Book a private consultation or send an enquiry.",
  }
}

type ContactSettings = {
  contact_address?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  contact_whatsapp?: string | null
  contact_hours_weekdays?: string | null
  contact_hours_sunday?: string | null
  contact_phone_de?: string | null
  contact_email_de?: string | null
  contact_address_de?: string | null
  contact_hours_de?: string | null
  contact_phone_gb?: string | null
  contact_email_gb?: string | null
  contact_address_gb?: string | null
  contact_hours_gb?: string | null
  social_facebook?: string | null
  social_instagram?: string | null
  social_twitter?: string | null
  social_linkedin?: string | null
  social_youtube?: string | null
  section_bg_hero_contact?: string | null
  google_maps_key?: string | null
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

// Locale → office label and flag
const OFFICE_LABELS: Record<string, { label: string; flag: string }> = {
  de:    { label: 'Germany Office',      flag: '🇩🇪' },
  'en-gb': { label: 'United Kingdom Office', flag: '🇬🇧' },
}

export default async function ContactPage() {
  const [s, cms, locale] = await Promise.all([
    getContactSettings(),
    getCmsContent('contact'),
    getLocale(),
  ])

  // Locale-specific office fallbacks
  const suffix = locale === 'de' ? '_de' : locale === 'en-gb' ? '_gb' : ''

  const address   = (suffix && s[`contact_address${suffix}` as keyof ContactSettings]) || s.contact_address   || 'Office 2402, Burj Al Salam Tower, Sheikh Zayed Road, Dubai, UAE'
  const phone     = (suffix && s[`contact_phone${suffix}` as keyof ContactSettings])   || s.contact_phone     || '+971 00 000 0000'
  const email     = (suffix && s[`contact_email${suffix}` as keyof ContactSettings])   || s.contact_email     || 'invest@evoorion.com'
  const hours     = (suffix && s[`contact_hours${suffix}` as keyof ContactSettings])   || s.contact_hours_weekdays || 'Monday – Saturday: 9:00 AM – 7:00 PM'
  const hoursSun  = suffix ? null : (s.contact_hours_sunday ?? 'Sunday: By Appointment')

  const officeLabel = (suffix && OFFICE_LABELS[locale]?.label) ? OFFICE_LABELS[locale].label : 'Dubai Office'
  const officeFlag  = (suffix && OFFICE_LABELS[locale]?.flag)  ? OFFICE_LABELS[locale].flag  : '🇦🇪'

  // Show both offices when on a locale-specific office page and a UAE office also exists
  const showUaeOffice = !!suffix && !!(s.contact_phone || s.contact_address)

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
        <SectionBackground bgJson={s.section_bg_hero_contact} opacity={18} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">
              {(cms.hero_eyebrow as string) ?? 'Get in Touch'}
            </span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-5">
            {(cms.hero_headline as string) ?? 'Start Your Conversation'}
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            {(cms.hero_body as string) ?? 'Our senior advisors are available for private consultations — in person, by phone, or via video call, wherever you are in the world.'}
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-16 bg-brand">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Contact info + map */}
            <div className="lg:col-span-2 space-y-10">
              <ScrollReveal>
                {/* Office label */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-lg">{officeFlag}</span>
                  <span className="text-gold text-xs tracking-[0.2em] uppercase font-semibold">{officeLabel}</span>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs tracking-wider uppercase mb-1">Office Address</p>
                      <p className="text-muted text-sm">{address}</p>
                    </div>
                  </div>

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

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm border border-gold-border bg-gold/5 flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs tracking-wider uppercase mb-1">Office Hours</p>
                      <p className="text-muted text-sm">{hours}</p>
                      {hoursSun && <p className="text-muted text-sm">{hoursSun}</p>}
                    </div>
                  </div>

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

              {/* Also show UAE office if on a locale-specific page */}
              {showUaeOffice && (
                <ScrollReveal delay={0.1}>
                  <div className="p-5 border border-white/5 rounded-sm bg-brand-section/40">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🇦🇪</span>
                      <span className="text-gold text-xs tracking-[0.2em] uppercase font-semibold">Dubai HQ</span>
                    </div>
                    <p className="text-muted text-sm mb-2">{s.contact_address ?? 'Office 2402, Burj Al Salam Tower, Dubai, UAE'}</p>
                    {s.contact_phone && (
                      <a href={`tel:${s.contact_phone.replace(/\s/g, '')}`} className="text-white hover:text-gold text-sm transition-colors block">
                        {s.contact_phone}
                      </a>
                    )}
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal delay={0.2}>
                <ContactAddressMap address={address} apiKey={s.google_maps_key ?? undefined} />
              </ScrollReveal>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={0.15}>
                <div className="p-8 border border-gold-border rounded-sm bg-brand-section/30">
                  <LeadForm
                    title={(cms.form_title as string) ?? 'Book a Private Consultation'}
                    subtitle={(cms.form_subtitle as string) ?? 'Complete the form and an advisor will be in touch within 2 hours during office hours.'}
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
