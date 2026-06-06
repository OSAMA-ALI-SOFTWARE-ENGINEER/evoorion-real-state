import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'
import { SocialIcon } from '@/components/ui/SocialIcon'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const INVESTMENT_LINKS = [
  { label: 'Off-Plan Properties', href: '/investments' },
  { label: 'Ready Properties', href: '/investments' },
  { label: 'Private Advisory', href: '/investments' },
  { label: 'Browse All', href: '/properties' },
]

const SOCIALS: { label: string; name: 'instagram' | 'linkedin' | 'twitter' | 'facebook'; href: string }[] = [
  { label: 'Instagram', name: 'instagram', href: '#' },
  { label: 'LinkedIn', name: 'linkedin', href: '#' },
  { label: 'Twitter', name: 'twitter', href: '#' },
  { label: 'Facebook', name: 'facebook', href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-brand-section border-t border-gold-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-white">
                EVOORION
              </span>
              <span className="block text-gold text-xs tracking-[0.3em] font-light mt-0.5">
                REAL ESTATE
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs mb-6">
              Your gateway to exclusive Dubai real estate. We connect discerning investors with
              the finest luxury properties, delivering exceptional returns and a seamless
              acquisition experience.
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
              Quick Links
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
              Investments
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
              Contact Us
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
              <h5 className="text-white/60 text-xs tracking-wider uppercase mb-1">Office Hours</h5>
              <p className="text-muted text-sm">Mon – Sat: 9:00 AM – 7:00 PM</p>
            </div>
          </div>
        </div>

        {/* Locations strip */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted text-xs tracking-widest uppercase">
              Serving: Palm Jumeirah · Downtown · Marina · Business Bay · JVC · Creek Harbour
            </p>
            <p className="text-muted/60 text-xs">
              © {new Date().getFullYear()} EVOORION Real Estate. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
