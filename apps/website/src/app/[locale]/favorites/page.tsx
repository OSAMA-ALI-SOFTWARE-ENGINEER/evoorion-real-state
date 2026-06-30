'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { getFavorites, removeFavorite } from '@/lib/api'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { useAuth } from '@/context/AuthContext'
import type { PropertySummary } from '@/types'

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/properties')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    getFavorites()
      .then((res) => {
        setProperties(res.data)
        setFavoriteIds(new Set(res.data.map((p) => p.id)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  async function toggleFavorite(property: PropertySummary) {
    const isFav = favoriteIds.has(property.id)
    if (!isFav) return // on this page, we only unfavorite

    setFavoriteIds((prev) => {
      const next = new Set(prev)
      next.delete(property.id)
      return next
    })
    setProperties((prev) => prev.filter((p) => p.id !== property.id))

    try {
      await removeFavorite(property.slug)
    } catch {
      // Revert
      setFavoriteIds((prev) => new Set([...prev, property.id]))
      setProperties((prev) => [property, ...prev])
    }
  }

  const isPageLoading = authLoading || (!!user && loading)

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Saved</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white mb-4">
            Your Favourites
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Properties you&apos;ve saved for later.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-brand min-h-[60vh]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {isPageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <Heart size={28} className="text-gold/50" />
              </div>
              <p className="text-white text-xl font-semibold mb-2">No saved properties yet</p>
              <p className="text-muted text-sm mb-8">
                Tap the heart on any property to save it here for easy access.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-brand text-sm font-semibold tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <>
              <p className="text-muted text-sm mb-8">
                {properties.length} saved {properties.length === 1 ? 'property' : 'properties'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    isFavorited={favoriteIds.has(p.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
