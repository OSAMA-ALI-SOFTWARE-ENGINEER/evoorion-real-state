import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { NewsletterSignup } from '@/components/ui/NewsletterSignup'

const SOCIALS: { label: string; name: 'instagram' | 'linkedin' | 'twitter' | 'facebook'; href: string }[] = [
  { label: 'Instagram', name: 'instagram', href: '#' },
  { label: 'LinkedIn', name: 'linkedin', href: '#' },
  { label: 'Twitter', name: 'twitter', href: '#' },
  { label: 'Facebook', name: 'facebook', href: '#' },
]

export async function Footer() {
  const t  = await getTranslations('footer')
  const tn = await getTranslations('nav')

  const QUICK_LINKS = [
    { label: tn('home'),    href: '/' },
    { label: tn('about'),   href: '/about' },
    { label: tn('contact'), href: '/contact' },
  ]

  const INVESTMENT_LINKS = [
    { label: t('offPlanProperties'), href: '/investments' },
    { label: t('readyProperties'),   href: '/investments' },
    { label: t('privateAdvisory'),   href: '/investments' },
    { label: t('browseAll'),         href: '/properties' },
  ]

  return (
    <footer className="bg-brand-section border-t border-gold-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="relative block h-12 w-52 mb-4">
              <Image
                src="/logos/primary-logo.png"
                alt="EVOORION Real Estate"
                fill
                className="object-contain object-left"
                sizes="208px"
              />
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs mb-6">
              {t('tagline')}
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ label, name, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center border border-gold-border rounded-sm text-muted hover:text-gold hover:border-gold transition-colors duration-300"
                >
                  <SocialIcon name={name} size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted text-sm hover:text-gold transition-colors duration-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Investments */}
          <div>
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">
              {t('investments')}
            </h4>
            <ul className="space-y-3">
              {INVESTMENT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-muted text-sm hover:text-gold transition-colors duration-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-5">
              {t('contactUs')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-gold mt-0.5 shrink-0" />
                <span className="text-muted text-sm leading-relaxed">
                  Office 2402, Burj Al Salam Tower<br />
                  Sheikh Zayed Road, Dubai, UAE
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-gold shrink-0" />
                <a href="tel:+971000000000" className="text-muted text-sm hover:text-gold transition-colors">
                  +971 00 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-gold shrink-0" />
                <a href="mailto:invest@evoorion.com" className="text-muted text-sm hover:text-gold transition-colors">
                  invest@evoorion.com
                </a>
              </li>
            </ul>
            <div className="mt-5">
              <h5 className="text-white/60 text-xs tracking-wider uppercase mb-1">{t('officeHours')}</h5>
              <p className="text-muted text-sm">Mon â€“ Sat: 9:00 AM â€“ 7:00 PM</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="max-w-md">
            <NewsletterSignup />
          </div>
        </div>

        {/* Locations strip */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted text-xs tracking-widest uppercase">
              {t('serving')}
            </p>
            <p className="text-muted/60 text-xs">
              Â© {new Date().getFullYear()} EVOORION Real Estate. {t('rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

