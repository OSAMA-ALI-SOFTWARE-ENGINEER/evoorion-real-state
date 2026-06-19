'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, LogOut, User, Heart, ChevronRight, MapPin } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/ui/AuthModal'
import { CountrySelector } from '@/components/ui/CountrySelector'
import { GlobalSearch, GlobalSearchButton } from '@/components/ui/GlobalSearch'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

type OpType = { id: number; name: string; property_count: number }
type AreaItem = { id: number; name: string; slug: string; properties_count: number }

function opSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function opHref(op: OpType) {
  const key = opSlug(op.name)
  if (key === 'off-plan') return '/off-plan'
  return `/properties?operation=${key}`
}

const COMPANY_LINKS = [
  { label: 'Investments',  href: '/investments' },
  { label: 'Blog',         href: '/blog' },
  { label: 'About',        href: '/about' },
]

function DrawerLink({ href, label, pathname, onClick }: { href: string; label: string; pathname: string; onClick: () => void }) {
  const base   = href.split('?')[0]
  const active = pathname === base || (base !== '/' && pathname.startsWith(base + '/'))
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center justify-between py-3 border-b border-white/5 transition-colors duration-200 ${
        active ? 'text-gold' : 'text-white/70 hover:text-white'
      }`}
    >
      <span className="text-sm tracking-widest uppercase">{label}</span>
      <ChevronRight size={14} className={`transition-transform duration-200 group-hover:translate-x-1 ${active ? 'text-gold' : 'text-white/20'}`} />
    </Link>
  )
}

function OpLinkWithLocations({ op, pathname, onClose }: { op: OpType; pathname: string; onClose: () => void }) {
  const [hovered, setHovered]   = useState(false)
  const [areas, setAreas]       = useState<AreaItem[]>([])
  const [fetched, setFetched]   = useState(false)
  const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null)
  const href                    = opHref(op)
  const base                    = href.split('?')[0]
  const active                  = pathname === base || (base !== '/' && pathname.startsWith(base + '/'))

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => setHovered(true), 120)
    if (!fetched) {
      setFetched(true)
      fetch(`${API_BASE}/areas?operation_type_id=${op.id}`)
        .then(r => r.json())
        .then(d => setAreas((d.data ?? []).slice(0, 6)))
        .catch(() => {})
    }
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setHovered(false)
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link
        href={href}
        onClick={onClose}
        className={`group flex items-center justify-between py-3 border-b border-white/5 transition-colors duration-200 ${
          active ? 'text-gold' : 'text-white/70 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-2 text-sm tracking-widest uppercase">
          {op.name}
          <span className="text-[10px] text-muted/50 font-normal normal-case tracking-normal">
            {op.property_count}
          </span>
        </span>
        <ChevronRight size={14} className={`transition-transform duration-200 group-hover:translate-x-1 ${active ? 'text-gold' : 'text-white/20'}`} />
      </Link>

      {/* Nested locations flyout */}
      <AnimatePresence>
        {hovered && areas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-full top-0 mr-2 w-56 bg-brand-section border border-gold-border rounded-sm shadow-2xl overflow-hidden z-10"
          >
            <p className="px-3 pt-3 pb-1 text-[10px] text-gold/50 tracking-[0.2em] uppercase font-medium">Locations</p>
            {areas.map((area) => (
              <Link
                key={area.slug}
                href={`/properties?operation=${opSlug(op.name)}&location=${area.slug}`}
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/5 last:border-0 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <MapPin size={11} className="text-gold/60 shrink-0" />
                <span className="text-xs truncate">{area.name}</span>
                {area.properties_count > 0 && (
                  <span className="ml-auto text-[10px] text-muted/40 shrink-0">{area.properties_count}</span>
                )}
              </Link>
            ))}
            <Link
              href={href}
              onClick={onClose}
              className="flex items-center justify-center gap-1 px-3 py-2.5 text-gold text-xs hover:bg-gold/5 transition-colors"
            >
              View all <ChevronRight size={11} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [authModal, setAuthModal]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [opTypes, setOpTypes]       = useState<OpType[]>([])
  const { user, isLoading, logout } = useAuth()
  const pathname = usePathname()

  // Load operation types once for drawer
  useEffect(() => {
    fetch(`${API_BASE}/operation-types`)
      .then(r => r.json())
      .then(d => setOpTypes(d.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const initials = user ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() : ''

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || drawerOpen
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

            {/* Right cluster */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <GlobalSearchButton onClick={() => setSearchOpen(true)} />

              {/* Country */}
              <CountrySelector />

              {/* Book Call — hidden on small mobile */}
              <Link
                href="/contact"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gold text-brand text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
              >
                <Phone size={13} />
                Book Call
              </Link>

              {/* Hamburger */}
              <button
                type="button"
                onClick={() => setDrawerOpen((v) => !v)}
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                className="flex items-center justify-center w-10 h-10 rounded-sm border border-white/10 hover:border-gold/40 text-white/80 hover:text-white transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {drawerOpen ? (
                    <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={18} />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={18} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Drawer backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Side drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[90vw] bg-brand border-l border-gold-border flex flex-col shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <Link href="/" onClick={() => setDrawerOpen(false)} className="relative block h-8 w-36">
                <Image src="/logos/primary-logo.png" alt="EVOORION" fill className="object-contain object-left" sizes="144px" />
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 flex items-center justify-center text-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">

              {/* Properties — dynamic op types with nested location hover */}
              {opTypes.length > 0 && (
                <div className="mb-6">
                  <p className="text-gold/60 text-[10px] tracking-[0.25em] uppercase mb-1 font-medium">Properties</p>
                  {opTypes.map((op) => (
                    <OpLinkWithLocations key={op.id} op={op} pathname={pathname} onClose={() => setDrawerOpen(false)} />
                  ))}
                  <DrawerLink href="/properties" label="All Listings" pathname={pathname} onClick={() => setDrawerOpen(false)} />
                  <DrawerLink href="/locations"  label="Explore Locations" pathname={pathname} onClick={() => setDrawerOpen(false)} />
                </div>
              )}

              {/* Company links */}
              <div className="mb-6">
                <p className="text-gold/60 text-[10px] tracking-[0.25em] uppercase mb-1 font-medium">Company</p>
                {COMPANY_LINKS.map((link) => (
                  <DrawerLink key={link.href} {...link} pathname={pathname} onClick={() => setDrawerOpen(false)} />
                ))}
              </div>

              {/* Account section */}
              <div className="mb-6">
                <p className="text-gold/60 text-[10px] tracking-[0.25em] uppercase mb-1 font-medium">Account</p>
                {!isLoading && (
                  user ? (
                    <>
                      {/* User identity */}
                      <div className="flex items-center gap-3 py-3 border-b border-white/5">
                        <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-semibold shrink-0">
                          {user.avatar_url
                            ? <Image src={user.avatar_url} alt={user.name} width={36} height={36} className="rounded-full object-cover" />
                            : initials
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{user.name}</p>
                          <p className="text-muted text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/favorites"
                        onClick={() => setDrawerOpen(false)}
                        className="group flex items-center justify-between py-3 border-b border-white/5 text-white/70 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-2.5 text-sm tracking-widest uppercase">
                          <Heart size={13} className="text-gold" /> Saved Properties
                        </span>
                        <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <button
                        type="button"
                        onClick={async () => { setDrawerOpen(false); await logout() }}
                        className="group flex items-center justify-between w-full py-3 border-b border-white/5 text-white/70 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-2.5 text-sm tracking-widest uppercase">
                          <LogOut size={13} className="text-gold" /> Sign Out
                        </span>
                        <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setDrawerOpen(false); setAuthModal(true) }}
                      className="group flex items-center justify-between w-full py-3 border-b border-white/5 text-white/70 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2.5 text-sm tracking-widest uppercase">
                        <User size={13} className="text-gold" /> Sign In / Register
                      </span>
                      <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )
                )}
              </div>

            </div>

            {/* Drawer footer CTA */}
            <div className="px-6 py-5 border-t border-white/5">
              <Link
                href="/contact"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gold text-brand text-sm font-semibold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors"
              >
                <Phone size={14} />
                Book a Private Call
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
