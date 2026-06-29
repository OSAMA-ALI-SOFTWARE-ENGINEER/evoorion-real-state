'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, TrendingUp, ArrowRight } from 'lucide-react'
import { getAreas } from '@/lib/api'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { SectionBackground } from '@/components/ui/SectionBackground'
import { LocationsMap } from '@/components/ui/LocationsMap'
import type { Area } from '@/types'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'

function AreaCard({ area, index }: { area: Area; index: number }) {
  return (
    <ScrollReveal delay={index * 0.07} className="h-full">
      <Link
        href={`/locations/${area.slug}`}
        className="group relative flex flex-col h-full rounded-sm overflow-hidden border border-white/5 hover:border-gold-border bg-brand-section transition-all duration-300"
      >
        {/* Hero image */}
        <div className="relative h-52 overflow-hidden shrink-0">
          <Image
            src={area.hero_image_url ?? PLACEHOLDER}
            alt={area.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-section via-brand-section/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-serif text-white text-xl font-bold group-hover:text-gold transition-colors">
              {area.name}
            </h3>
          </div>
        </div>

        {/* Stats */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          {/* Stat chips */}
          {(area.long_term_roi || area.appreciation || area.off_plan_discount) && (
            <div className="flex flex-wrap gap-2">
              {area.long_term_roi && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp size={10} />
                  {area.long_term_roi} LT yield
                </span>
              )}
              {area.appreciation && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                  {area.appreciation} appreciation
                </span>
              )}
              {area.off_plan_discount && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {area.off_plan_discount} off-plan discount
                </span>
              )}
            </div>
          )}

          {/* Description snippet */}
          {area.description && (
            <p className="text-muted text-xs leading-relaxed line-clamp-3 flex-1">
              {area.description}
            </p>
          )}

          {/* CTA */}
          <div className="flex items-center gap-1.5 text-gold text-xs font-semibold tracking-wider uppercase mt-auto group-hover:gap-2.5 transition-all">
            Explore Area <ArrowRight size={12} />
          </div>
        </div>
      </Link>
    </ScrollReveal>
  )
}

export default function LocationsPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [heroBg, setHeroBg] = useState<string | null>(null)

  useEffect(() => {
    getAreas()
      .then((res) => setAreas(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    fetch(`${api}/settings`).then(r => r.json()).then(j => setHeroBg(j?.data?.section_bg_hero_locations ?? null)).catch(() => {})
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-section relative overflow-hidden">
        <SectionBackground bgJson={heroBg} opacity={18} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Dubai</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-4">
            Prime Investment Locations
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            Explore Dubai&apos;s most prestigious neighbourhoods — compare rental yields,
            capital appreciation, and price ranges to find your ideal investment.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Areas Covered', value: areas.length > 0 ? `${areas.length}+` : '5+' },
              { label: 'Avg. Long-term Yield', value: '5–7%' },
              { label: 'Avg. Appreciation', value: '5–8%' },
              { label: 'Avg. Off-plan Discount', value: '20%+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-gold font-serif text-2xl font-bold">{s.value}</p>
                <p className="text-muted text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive map */}
      {!loading && areas.length > 0 && (
        <section className="bg-brand py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">Map View</span>
            </div>
            <LocationsMap areas={areas} />
          </div>
        </section>
      )}

      {/* Area cards grid */}
      <section className="py-16 bg-brand min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 rounded-sm bg-brand-section/50 animate-pulse" />
              ))}
            </div>
          ) : areas.length === 0 ? (
            <div className="text-center py-24">
              <MapPin size={40} className="text-gold/30 mx-auto mb-4" />
              <p className="text-muted">No locations available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area, i) => (
                <AreaCard key={area.id} area={area} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-brand-section border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              Not Sure Which Area Fits Your Goals?
            </h2>
            <p className="text-muted max-w-xl mx-auto mb-8">
              Our advisors specialise in matching investors with the right neighbourhood based on
              budget, risk appetite, and return expectations.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-brand font-semibold tracking-wider uppercase text-sm rounded-sm hover:bg-gold-light transition-colors"
            >
              Book a Free Consultation <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
