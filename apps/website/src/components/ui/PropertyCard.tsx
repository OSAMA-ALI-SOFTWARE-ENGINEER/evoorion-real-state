'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, BedDouble, Bath, TrendingUp } from 'lucide-react'
import type { PropertySummary } from '@/types'

interface PropertyCardProps {
  property: PropertySummary
}

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80'

function formatPrice(price: string, currency: string) {
  const num = parseFloat(price)
  if (num >= 1_000_000) return `${currency} ${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${currency} ${(num / 1_000).toFixed(0)}K`
  return `${currency} ${num.toLocaleString()}`
}

function getStatusBadge(status: string) {
  if (status === 'off_plan') return { label: 'OFF-PLAN', cls: 'bg-gold text-brand' }
  if (status === 'sold') return { label: 'SOLD', cls: 'bg-red-500/80 text-white' }
  return { label: 'READY', cls: 'bg-emerald-600/80 text-white' }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.images?.find((i) => i.is_primary)?.url ?? property.images?.[0]?.url
  const imageUrl = primaryImage ?? PLACEHOLDER
  const badge = getStatusBadge(property.status)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative rounded-sm overflow-hidden border border-white/5 hover:border-gold-border bg-[#0d1526] transition-colors duration-300"
    >
      <Link href={`/properties/${property.slug}`} className="block">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/60 via-transparent to-transparent" />

          {/* Badge */}
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-sm ${badge.cls}`}
          >
            {badge.label}
          </span>

          {/* Type */}
          <span className="absolute top-3 right-3 text-[10px] text-white/70 tracking-wider uppercase bg-black/40 backdrop-blur-sm px-2 py-1 rounded-sm">
            {property.type}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-white text-base font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">
            {property.title}
          </h3>

          {(property.area?.name || property.location) && (
            <div className="flex items-center gap-1.5 text-muted text-xs mb-3">
              <MapPin size={12} className="text-gold shrink-0" />
              <span>{property.area?.name ?? property.location}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-muted text-xs mb-4">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <BedDouble size={12} />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath size={12} />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-gold font-semibold text-lg leading-tight">
                {formatPrice(property.price, property.currency ?? 'AED')}
              </p>
            </div>
            {property.roi_min && property.roi_max && (
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <TrendingUp size={12} />
                <span>{property.roi_min}–{property.roi_max}% ROI</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="px-5 pb-5">
          <div className="w-full py-2.5 border border-gold-border text-center text-xs tracking-widest uppercase text-gold group-hover:bg-gold group-hover:text-brand transition-all duration-300 rounded-sm">
            View Details
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
