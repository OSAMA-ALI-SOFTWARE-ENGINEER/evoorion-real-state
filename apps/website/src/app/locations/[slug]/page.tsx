'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, TrendingUp, Home, Clock, Tag, ArrowRight } from 'lucide-react'
import { getArea, getProperties } from '@/lib/api'
import { AreaMap } from '@/components/ui/AreaMap'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { LeadForm } from '@/components/ui/LeadForm'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Area, PriceRange, PropertySummary } from '@/types'
import { useCountry } from '@/context/CountryContext'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80'

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="p-5 border border-white/5 rounded-sm bg-brand-section/50 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gold text-xs font-semibold tracking-wider uppercase">
        {icon}
        {label}
      </div>
      <p className="text-white text-2xl font-serif font-bold">{value}</p>
      {sub && <p className="text-muted text-xs">{sub}</p>}
    </div>
  )
}

function PriceRangesPanel({ ranges }: { ranges: PriceRange[] }) {
  const [active, setActive] = useState(0)
  const { formatPrice } = useCountry()
  const range = ranges[active]

  return (
    <div className="border border-white/5 rounded-sm bg-brand-section/50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {ranges.map((r, i) => (
          <button
            key={r.type}
            type="button"
            onClick={() => setActive(i)}
            className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors shrink-0 ${
              i === active
                ? 'bg-gold/10 text-gold border-b-2 border-gold'
                : 'text-muted hover:text-white'
            }`}
          >
            {r.type}
          </button>
        ))}
      </div>
      {/* Range */}
      <div className="p-6 grid grid-cols-2 gap-6">
        <div>
          <p className="text-muted text-xs uppercase tracking-wider mb-1">Starting from</p>
          <p className="text-gold font-serif text-2xl font-bold">{formatPrice(range.min)}</p>
        </div>
        <div>
          <p className="text-muted text-xs uppercase tracking-wider mb-1">Up to</p>
          <p className="text-white font-serif text-2xl font-bold">{formatPrice(range.max)}</p>
        </div>
        {/* Bar */}
        <div className="col-span-2">
          <div className="h-1.5 bg-white/5 rounded-full">
            <div className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full w-full" />
          </div>
          <div className="flex justify-between mt-1 text-muted text-[10px]">
            <span>{formatPrice(range.min)}</span>
            <span>{formatPrice(range.max)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LocationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [area, setArea] = useState<Area | null>(null)
  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [propsLoading, setPropsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getArea(slug)
      .then((res) => setArea(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!area) return
    getProperties({ area_id: area.id, per_page: 6 })
      .then((res) => setProperties(res.data))
      .catch(() => {})
      .finally(() => setPropsLoading(false))
  }, [area])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !area) {
    return (
      <div className="min-h-screen bg-brand flex flex-col items-center justify-center gap-6">
        <p className="text-muted text-lg">Location not found.</p>
        <Link href="/locations" className="text-gold hover:underline text-sm">← All Locations</Link>
      </div>
    )
  }

  const hasStats = area.long_term_roi || area.short_term_roi || area.appreciation || area.off_plan_discount

  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[420px] flex items-end overflow-hidden">
        <Image
          src={area.hero_image_url ?? PLACEHOLDER}
          alt={area.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <Link
            href="/locations"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> All Locations
          </Link>
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Dubai</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            {area.name}
          </h1>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left col */}
            <div className="lg:col-span-2 space-y-10">

              {/* Description */}
              {area.description && (
                <ScrollReveal>
                  <h2 className="font-serif text-2xl font-bold text-white mb-4">About {area.name}</h2>
                  <p className="text-muted leading-relaxed whitespace-pre-line">{area.description}</p>
                </ScrollReveal>
              )}

              {/* Map */}
              {area.latitude != null && area.longitude != null && (
                <ScrollReveal>
                  <h2 className="font-serif text-2xl font-bold text-white mb-4">Location</h2>
                  <AreaMap lat={area.latitude} lng={area.longitude} name={area.name} />
                </ScrollReveal>
              )}

              {/* Investment stats */}
              {hasStats && (
                <ScrollReveal>
                  <h2 className="font-serif text-2xl font-bold text-white mb-5">Investment Snapshot</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {area.long_term_roi && (
                      <StatCard
                        icon={<TrendingUp size={12} />}
                        label="Long-term ROI"
                        value={area.long_term_roi}
                        sub="Annual rental yield"
                      />
                    )}
                    {area.short_term_roi && (
                      <StatCard
                        icon={<Clock size={12} />}
                        label="Short-term ROI"
                        value={area.short_term_roi}
                        sub="Holiday let yield"
                      />
                    )}
                    {area.appreciation && (
                      <StatCard
                        icon={<TrendingUp size={12} />}
                        label="Appreciation"
                        value={area.appreciation}
                        sub="Annual capital growth"
                      />
                    )}
                    {area.off_plan_discount && (
                      <StatCard
                        icon={<Tag size={12} />}
                        label="Off-plan Discount"
                        value={area.off_plan_discount}
                        sub="vs ready market"
                      />
                    )}
                  </div>
                </ScrollReveal>
              )}

              {/* Price ranges */}
              {area.price_ranges && area.price_ranges.length > 0 && (
                <ScrollReveal>
                  <h2 className="font-serif text-2xl font-bold text-white mb-5">Price Ranges by Unit Type</h2>
                  <PriceRangesPanel ranges={area.price_ranges} />
                </ScrollReveal>
              )}

              {/* Properties in this area */}
              <ScrollReveal>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                    <Home size={20} className="text-gold" />
                    Properties in {area.name}
                  </h2>
                  <Link
                    href={`/properties?area_id=${area.id}`}
                    className="text-gold text-sm hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight size={13} />
                  </Link>
                </div>

                {propsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="py-10 text-center border border-white/5 rounded-sm">
                    <p className="text-muted text-sm">No properties listed in {area.name} yet.</p>
                    <Link href="/properties" className="text-gold text-sm hover:underline mt-2 inline-block">
                      Browse all properties
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {properties.map((p) => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                )}
              </ScrollReveal>
            </div>

            {/* Right col: lead form */}
            <div className="lg:col-span-1">
              <ScrollReveal delay={0.2}>
                <div className="sticky top-28 p-6 border border-gold-border rounded-sm bg-brand-section/50 backdrop-blur-sm">
                  <LeadForm
                    title={`Invest in ${area.name}`}
                    subtitle="Speak with an advisor who specialises in this area."
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
