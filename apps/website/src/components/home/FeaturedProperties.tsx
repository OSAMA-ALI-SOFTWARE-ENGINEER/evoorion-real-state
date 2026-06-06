'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getProperties } from '@/lib/api'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { PropertySummary } from '@/types'

const FALLBACK_PROPERTIES: PropertySummary[] = [
  {
    id: 1,
    title: 'Signature Penthouse — Palm Jumeirah',
    slug: 'signature-penthouse-palm-jumeirah',
    type: 'penthouse',
    price: '8500000',
    currency: 'AED',
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: '6200',
    status: 'available',
    is_featured: true,
    roi_min: '7',
    roi_max: '9',
    views_count: 0,
    area: { id: 1, name: 'Palm Jumeirah' },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Ultra-Luxury Villa — Emirates Hills',
    slug: 'ultra-luxury-villa-emirates-hills',
    type: 'villa',
    price: '15000000',
    currency: 'AED',
    bedrooms: 6,
    bathrooms: 7,
    area_sqft: '12000',
    status: 'available',
    is_featured: true,
    roi_min: '6',
    roi_max: '8',
    views_count: 0,
    area: { id: 2, name: 'Emirates Hills' },
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Sky Residences — Downtown Dubai',
    slug: 'sky-residences-downtown-dubai',
    type: 'apartment',
    price: '3200000',
    currency: 'AED',
    bedrooms: 2,
    bathrooms: 3,
    area_sqft: '2400',
    status: 'available',
    is_featured: true,
    roi_min: '8',
    roi_max: '12',
    views_count: 0,
    area: { id: 3, name: 'Downtown Dubai' },
    created_at: new Date().toISOString(),
  },
]

export function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProperties({ featured: true, per_page: 3 })
      .then((res) => {
        setProperties(res.data.length > 0 ? res.data : FALLBACK_PROPERTIES)
      })
      .catch(() => {
        setProperties(FALLBACK_PROPERTIES)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-24 bg-brand-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-10 bg-gold" />
                <span className="text-gold text-xs tracking-[0.3em] uppercase">Featured</span>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
                Curated Properties.
                <br />
                <span className="text-gold-gradient italic">Exclusive Access.</span>
              </h2>
            </div>
            <Link
              href="/properties"
              className="group flex items-center gap-2 text-gold text-sm tracking-wider hover:gap-3 transition-all duration-300 shrink-0"
            >
              View All Properties
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : properties.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.1}>
                  <PropertyCard property={p} />
                </ScrollReveal>
              ))}
        </div>
      </div>
    </section>
  )
}
