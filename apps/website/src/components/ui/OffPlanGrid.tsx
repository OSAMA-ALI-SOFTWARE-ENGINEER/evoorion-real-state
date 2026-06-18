'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { AuthModal } from '@/components/ui/AuthModal'
import { addFavorite, removeFavorite } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { PropertySummary } from '@/types'

interface OffPlanGridProps {
  properties: PropertySummary[]
}

export function OffPlanGrid({ properties }: OffPlanGridProps) {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [showAuth, setShowAuth] = useState(false)

  async function toggleFavorite(property: PropertySummary) {
    if (!user) { setShowAuth(true); return }
    const isFav = favoriteIds.has(property.id)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isFav) next.delete(property.id)
      else next.add(property.id)
      return next
    })
    try {
      if (isFav) await removeFavorite(property.slug)
      else await addFavorite(property.slug)
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFav) next.add(property.id)
        else next.delete(property.id)
        return next
      })
    }
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-6">No off-plan developments listed yet. Check back soon.</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm tracking-widest uppercase transition-colors"
        >
          Register Interest <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 0.06} className="h-full">
            <PropertyCard
              property={p}
              isFavorited={favoriteIds.has(p.id)}
              onToggleFavorite={toggleFavorite}
            />
          </ScrollReveal>
        ))}
      </div>

      {properties.length >= 6 && (
        <div className="text-center mt-12">
          <Link
            href="/properties?operation=off-plan"
            className="inline-flex items-center gap-2.5 px-8 py-4 border border-gold/50 text-white text-sm tracking-widest uppercase rounded-sm hover:border-gold hover:bg-gold/5 transition-all duration-300"
          >
            View All Off-Plan <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
