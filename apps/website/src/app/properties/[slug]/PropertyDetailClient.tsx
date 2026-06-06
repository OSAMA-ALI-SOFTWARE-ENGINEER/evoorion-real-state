'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin, BedDouble, Bath, Maximize2, TrendingUp,
  ChevronLeft, ChevronRight, MessageCircle, ArrowLeft,
} from 'lucide-react'
import { LeadForm } from '@/components/ui/LeadForm'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Property } from '@/types'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80'

function formatPrice(price: string, currency: string) {
  const num = parseFloat(price)
  if (num >= 1_000_000) return `${currency} ${(num / 1_000_000).toFixed(2)}M`
  return `${currency} ${num.toLocaleString()}`
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    off_plan: 'bg-gold text-brand',
    sold: 'bg-red-500 text-white',
    available: 'bg-emerald-600 text-white',
  }
  const labels: Record<string, string> = {
    off_plan: 'Off-Plan',
    sold: 'Sold',
    available: 'Ready',
  }
  return (
    <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm ${map[status] ?? 'bg-white/10 text-white'}`}>
      {labels[status] ?? status}
    </span>
  )
}

interface Props {
  property: Property
}

export function PropertyDetailClient({ property }: Props) {
  const images: typeof property.images = property.images ?? []
  const primaryIndex = images.findIndex((i) => i.is_primary)
  const [activeIdx, setActiveIdx] = useState(primaryIndex >= 0 ? primaryIndex : 0)

  const currentImage = images[activeIdx]?.url ?? PLACEHOLDER
  const wa = `https://wa.me/971000000000?text=${encodeURIComponent(
    `Hi, I'm interested in: ${property.title} (${window?.location?.href ?? ''})`,
  )}`

  const prev = () => setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <>
      {/* Back breadcrumb */}
      <div className="pt-24 pb-6 bg-brand-section border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-muted text-sm hover:text-gold transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Properties
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <section className="bg-brand-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main image */}
            <div className="lg:col-span-2 relative aspect-[4/3] rounded-sm overflow-hidden group">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image
                  src={currentImage}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </motion.div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand/80 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand/80 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-brand/70 text-white/70 text-xs px-2 py-1 rounded-sm backdrop-blur-sm">
                    {activeIdx + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:max-h-[inherit] overflow-auto">
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    aria-label={`View image ${i + 1}`}
                    onClick={() => setActiveIdx(i)}
                    className={`relative aspect-[4/3] lg:aspect-[3/2] rounded-sm overflow-hidden border-2 transition-colors ${
                      activeIdx === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Image ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Details + Form */}
      <section className="py-12 bg-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: property info */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <StatusBadge status={property.status} />
                  <span className="text-xs text-white/40 tracking-wider uppercase border border-white/10 px-2 py-1 rounded-sm">
                    {property.type}
                  </span>
                  {property.operation_type && (
                    <span className="text-xs text-white/40 tracking-wider uppercase border border-white/10 px-2 py-1 rounded-sm">
                      {property.operation_type.name}
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                  {property.title}
                </h1>

                {(property.area?.name || property.location) && (
                  <div className="flex items-center gap-2 text-muted mb-6">
                    <MapPin size={15} className="text-gold" />
                    <span>{property.area?.name ?? property.location}</span>
                    {property.developer && (
                      <span className="text-white/20 mx-2">·</span>
                    )}
                    {property.developer && (
                      <span>{property.developer.name}</span>
                    )}
                  </div>
                )}

                {/* Key stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                    <p className="text-gold font-serif text-2xl font-bold leading-none mb-1">
                      {property.bedrooms}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-muted text-xs">
                      <BedDouble size={12} />
                      Bedrooms
                    </div>
                  </div>
                  <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                    <p className="text-gold font-serif text-2xl font-bold leading-none mb-1">
                      {property.bathrooms}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-muted text-xs">
                      <Bath size={12} />
                      Bathrooms
                    </div>
                  </div>
                  <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                    <p className="text-gold font-serif text-lg font-bold leading-none mb-1">
                      {parseFloat(property.area_sqft).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-muted text-xs">
                      <Maximize2 size={12} />
                      Sq Ft
                    </div>
                  </div>
                  {property.roi_min && property.roi_max && (
                    <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                      <p className="text-emerald-400 font-serif text-lg font-bold leading-none mb-1">
                        {property.roi_min}–{property.roi_max}%
                      </p>
                      <div className="flex items-center justify-center gap-1 text-muted text-xs">
                        <TrendingUp size={12} />
                        ROI
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-white/5">
                  <span className="font-serif text-4xl font-bold text-gold">
                    {formatPrice(property.price, property.currency ?? 'AED')}
                  </span>
                  <span className="text-muted text-sm">Starting Price</span>
                </div>

                {/* Description */}
                {property.description && (
                  <div className="mb-8">
                    <h2 className="text-white font-semibold mb-3 tracking-wide">About This Property</h2>
                    <p className="text-muted leading-relaxed whitespace-pre-line">{property.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {property.amenities?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-white font-semibold mb-4 tracking-wide">Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {property.amenities.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-2 py-2 px-3 border border-white/5 rounded-sm bg-brand-section/30 text-muted text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                          {a.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp CTA */}
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#25D366] text-white font-semibold text-sm tracking-wide rounded-sm hover:bg-[#20bf5b] transition-colors"
                >
                  <MessageCircle size={18} className="fill-white" />
                  Enquire on WhatsApp
                </a>
              </ScrollReveal>
            </div>

            {/* Right: Lead form */}
            <div className="lg:col-span-1">
              <ScrollReveal delay={0.2}>
                <div className="sticky top-28 p-6 border border-gold-border rounded-sm bg-brand-section/50 backdrop-blur-sm">
                  <LeadForm
                    propertyId={property.id}
                    title="Request Information"
                    subtitle="Our advisor will contact you within 2 hours."
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
