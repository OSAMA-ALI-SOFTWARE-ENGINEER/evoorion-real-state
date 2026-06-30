'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, BedDouble, Bath, TrendingUp, Heart, Check } from 'lucide-react'
import type { PropertySummary } from '@/types'
import { useCountry } from '@/context/CountryContext'

interface PropertyCardProps {
  property: PropertySummary
  isFavorited?: boolean
  onToggleFavorite?: (property: PropertySummary) => void
  isComparing?: boolean
  onToggleCompare?: (property: PropertySummary) => void
}

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80'

function getStatusBadge(status: string) {
  if (status === 'rented') return { label: 'RENTED', cls: 'bg-blue-500/80 text-white' }
  if (status === 'sold') return { label: 'SOLD', cls: 'bg-red-500/80 text-white' }
  return { label: 'READY', cls: 'bg-emerald-600/80 text-white' }
}

export function PropertyCard({
  property,
  isFavorited = false,
  onToggleFavorite,
  isComparing = false,
  onToggleCompare,
}: PropertyCardProps) {
  const { formatPrice } = useCountry()
  const primaryImage = property.images?.find((i) => i.is_primary)?.url ?? property.images?.[0]?.url
  const imageUrl = primaryImage ?? PLACEHOLDER
  const badge = getStatusBadge(property.status)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative h-full flex flex-col rounded-sm overflow-hidden border border-white/5 hover:border-gold-border bg-brand-section transition-colors duration-300"
    >
      {/* Heart button â€” sits above the Link so clicks don't navigate */}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(property) }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 ${
            isFavorited
              ? 'bg-red-500/90 text-white scale-110'
              : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'
          }`}
          aria-label={isFavorited ? 'Remove from saved' : 'Save property'}
        >
          <Heart size={13} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      )}

      <Link href={`/properties/${property.slug}`} className="flex-1 flex flex-col">
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

          {/* Status badge */}
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-sm ${badge.cls}`}
          >
            {badge.label}
          </span>

          {/* Price reduced badge */}
          {property.previous_price && parseFloat(property.previous_price) > parseFloat(property.price) && (
            <span className="absolute top-3 right-3 text-[10px] font-bold tracking-[0.12em] px-2.5 py-1 rounded-sm bg-red-500/90 text-white">
              Price Reduced
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1">
          <p className="text-gold text-[10px] tracking-[0.2em] uppercase mb-1 capitalize">{property.type}</p>
          <h3 className="font-serif text-white text-base font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">
            {property.title}
          </h3>

          {(property.area?.name || property.location) && (
            <div className="flex items-center gap-1.5 text-muted text-xs mb-3">
              <MapPin size={12} className="text-gold shrink-0" />
              <span>{property.area?.name ?? property.location}</span>
            </div>
          )}

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
              {property.previous_price && parseFloat(property.previous_price) > parseFloat(property.price) && (
                <p className="text-muted text-xs line-through mb-0.5">{formatPrice(property.previous_price)}</p>
              )}
              <p className="text-gold font-semibold text-lg leading-tight">
                {formatPrice(property.price)}
              </p>
            </div>
            {property.roi_min && property.roi_max && (
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <TrendingUp size={12} />
                <span>{property.roi_min}â€“{property.roi_max}% ROI</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5">
          <div className="w-full py-2.5 border border-gold-border text-center text-xs tracking-widest uppercase text-gold group-hover:bg-gold group-hover:text-brand transition-all duration-300 rounded-sm">
            View Details
          </div>
        </div>
      </Link>

      {/* Compare toggle â€” outside Link */}
      {onToggleCompare && (
        <button
          type="button"
          onClick={() => onToggleCompare(property)}
          className={`w-full flex items-center gap-2 px-5 py-2.5 text-xs border-t transition-colors duration-200 ${
            isComparing
              ? 'border-gold/30 bg-gold/5 text-gold'
              : 'border-white/5 text-muted hover:text-white'
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
              isComparing ? 'bg-gold border-gold text-brand' : 'border-muted/40'
            }`}
          >
            {isComparing && <Check size={9} strokeWidth={3} />}
          </div>
          {isComparing ? 'Added to comparison' : 'Compare'}
        </button>
      )}
    </motion.div>
  )
}

