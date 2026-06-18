'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, ChevronDown, LogOut, User, Heart, Building2, MapPin, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/ui/AuthModal'
import { CountrySelector } from '@/components/ui/CountrySelector'
import { GlobalSearch, GlobalSearchButton } from '@/components/ui/GlobalSearch'

// Top-level nav links (Properties/Locations handled by dropdown)
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Investments', href: '/investments' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const PROPERTY_DROPDOWN = [
  { label: 'Browse Properties', href: '/properties', icon: Building2, desc: 'View all listings' },
  { label: 'Explore Locations', href: '/locations', icon: MapPin, desc: 'Dubai investment hotspots' },
]

// Mobile menu: all links flat
const MOBILE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Investments', href: '/investments' },
  { label: 'Properties', href: '/properties' },
  { label: 'Locations', href: '/locations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

function PropertyDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = pathname.startsWith('/properties') || pathname.startsWith('/locations')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-sm tracking-widest uppercase transition-colors duration-300 relative group ${
          isActive ? 'text-gold' : 'text-white/80 hover:text-white'
        }`}
      >
        Portfolio
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 min-w-[220px]"
          >
            <div className="bg-brand-section border border-gold-border rounded-sm shadow-2xl overflow-hidden">
              {PROPERTY_DROPDOWN.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 transition-colors group/item ${
                      active ? 'bg-gold/5 text-gold' : 'text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 transition-colors ${
                      active ? 'bg-gold/10' : 'bg-white/5 group-hover/item:bg-gold/10'
                    }`}>
                      <Icon size={14} className={active ? 'text-gold' : 'text-muted group-hover/item:text-gold'} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase">{item.label}</p>
                      <p className="text-[11px] text-muted/60 mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen]  = useState(false)
  const ref              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-gold-border hover:border-gold/50 transition-colors"
      >
        {user.avatar_url ? (
          <Image src={user.avatar_url} alt={user.name} width={28} height={28} className="rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-semibold">
            {initials}
          </div>
        )}
        <span className="text-white text-sm max-w-[100px] truncate hidden xl:block">{user.name}</span>
        <ChevronDown size={14} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-brand-section border border-gold-border rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-muted text-xs truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Heart size={15} />
                Saved Properties
              </Link>
              <button
                type="button"
                onClick={async () => { setOpen(false); await logout() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModal, setAuthModal]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, isLoading }         = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? 'bg-brand/95 backdrop-blur-md border-b border-gold-border shadow-lg shadow-black/30'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="relative block h-10 w-44 shrink-0">
              <Image
                src="/logos/primary-logo.png"
                alt="EVOORION Real Estate"
                fill
                className="object-contain object-left"
                priority
                sizes="176px"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {/* Home */}
              <Link
                href="/"
                className={`text-sm tracking-widest uppercase transition-colors duration-300 relative group ${
                  pathname === '/' ? 'text-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                Home
                <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>

              {/* Investments */}
              <Link
                href="/investments"
                className={`text-sm tracking-widest uppercase transition-colors duration-300 relative group ${
                  pathname.startsWith('/investments') ? 'text-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                Investments
                <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${pathname.startsWith('/investments') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>

              {/* Properties + Locations dropdown */}
              <PropertyDropdown pathname={pathname} />

              {/* Blog, About, Contact */}
              {NAV_LINKS.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase transition-colors duration-300 relative group ${
                    pathname === link.href || pathname.startsWith(link.href + '/') ? 'text-gold' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                    pathname === link.href || pathname.startsWith(link.href + '/') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Search button */}
            <GlobalSearchButton onClick={() => setSearchOpen(true)} />

            {/* Right: auth + CTA + hamburger */}
            <div className="flex items-center gap-3">
              {!isLoading && (
                user ? (
                  <UserMenu />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthModal(true)}
                    className="hidden lg:flex items-center gap-1.5 py-2 px-4 rounded-full border border-gold-border text-white/80 hover:text-white hover:border-gold/50 text-sm transition-colors"
                  >
                    <User size={14} />
                    Sign In
                  </button>
                )
              )}
              <CountrySelector />
              <Link
                href="/contact"
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gold text-brand text-sm font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
              >
                <Phone size={14} />
                Book Call
              </Link>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 left-0 right-0 z-40 bg-brand/98 backdrop-blur-md border-b border-gold-border lg:hidden"
          >
            <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1">
              {MOBILE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase py-3.5 border-b border-white/5 transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + '/') ? 'text-gold' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoading && !user && (
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); setAuthModal(true) }}
                  className="flex items-center gap-2 py-3.5 text-sm text-white/80 border-b border-white/5"
                >
                  <User size={15} />
                  Sign In / Register
                </button>
              )}
              <Link
                href="/contact"
                className="mt-3 flex items-center justify-center gap-2 px-5 py-3 bg-gold text-brand text-sm font-semibold tracking-wider uppercase rounded-sm"
              >
                <Phone size={14} />
                Book Private Call
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
