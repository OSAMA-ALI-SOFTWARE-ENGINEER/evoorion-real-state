'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Star } from 'lucide-react'
import { compareProperties } from '@/lib/api'
import type { ComparisonResult, Property } from '@/types'
import { useCountry } from '@/context/CountryContext'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80'

function WinBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25">
      <Star size={8} fill="currentColor" />
      {label}
    </span>
  )
}

function CompareTable({ result }: { result: ComparisonResult }) {
  const { formatPrice } = useCountry()
  const { properties, summary } = result

  const rows: { label: string; render: (p: Property) => React.ReactNode }[] = [
    { label: 'Location', render: (p) => p.area?.name ?? p.location ?? '—' },
    {
      label: 'Type',
      render: (p) => <span className="capitalize">{p.type}</span>,
    },
    {
      label: 'Status',
      render: (p) => <span className="capitalize">{p.status}</span>,
    },
    {
      label: 'Price',
      render: (p) => (
        <div className="space-y-1">
          <p className="text-gold font-semibold">{formatPrice(p.price)}</p>
          {p.slug === summary.cheapest && <WinBadge label="Cheapest" />}
        </div>
      ),
    },
    {
      label: 'Bedrooms',
      render: (p) => (
        <div className="space-y-1">
          <p>{p.bedrooms ?? '—'}</p>
          {p.slug === summary.most_bedrooms && <WinBadge label="Most Bedrooms" />}
        </div>
      ),
    },
    { label: 'Bathrooms', render: (p) => p.bathrooms ?? '—' },
    {
      label: 'Floor Area',
      render: (p) => (
        <div className="space-y-1">
          <p>{p.area_sqft ? `${Number(p.area_sqft).toLocaleString()} sqft` : '—'}</p>
          {p.slug === summary.largest && <WinBadge label="Largest" />}
        </div>
      ),
    },
    {
      label: 'ROI',
      render: (p) =>
        p.roi_min && p.roi_max ? (
          <span className="text-emerald-400">{p.roi_min}–{p.roi_max}%</span>
        ) : '—',
    },
    { label: 'Developer', render: (p) => p.developer?.name ?? '—' },
    { label: 'Operation', render: (p) => p.operation_type?.name ?? '—' },
    {
      label: 'Amenities',
      render: (p) => {
        if (!p.amenities?.length) return '—'
        const shown = p.amenities.slice(0, 4).map((a) => a.amenity).join(', ')
        return p.amenities.length > 4 ? `${shown} +${p.amenities.length - 4} more` : shown
      },
    },
  ]

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-5 py-4 w-36 text-xs font-semibold text-muted uppercase tracking-wider bg-brand-section" />
            {properties.map((p) => {
              const img = p.images?.find((i) => i.is_primary)?.url ?? p.images?.[0]?.url ?? PLACEHOLDER
              return (
                <th key={p.id} className="px-5 py-4 bg-brand-section border-l border-white/5 text-left">
                  <div className="relative h-28 rounded-sm overflow-hidden mb-3">
                    <Image src={img} alt={p.title} fill className="object-cover" sizes="200px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand/50 to-transparent" />
                  </div>
                  <Link
                    href={`/properties/${p.slug}`}
                    className="text-white text-sm font-semibold hover:text-gold transition-colors line-clamp-2 leading-snug"
                  >
                    {p.title}
                  </Link>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={row.label}
              className={`border-b border-white/5 ${ri % 2 === 0 ? 'bg-brand' : 'bg-brand-section/40'}`}
            >
              <td className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                {row.label}
              </td>
              {properties.map((p) => (
                <td key={p.id} className="px-5 py-4 text-white border-l border-white/5">
                  {row.render(p as Property)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-brand-section/60">
            <td className="px-5 py-4" />
            {properties.map((p) => (
              <td key={p.id} className="px-5 py-4 border-l border-white/5">
                <Link
                  href={`/properties/${p.slug}`}
                  className="inline-flex items-center justify-center w-full py-2.5 border border-gold-border text-gold text-xs tracking-widest uppercase hover:bg-gold hover:text-brand transition-all duration-300 rounded-sm"
                >
                  View Property
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const slugsParam = searchParams.get('slugs') ?? ''
  const slugs = slugsParam.split(',').filter(Boolean)

  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slugs.length < 2) {
      setError('Select at least 2 properties to compare.')
      setLoading(false)
      return
    }
    compareProperties(slugs)
      .then((res) => setResult(res.data))
      .catch((err) => setError(err?.message ?? 'Failed to load comparison'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsParam])

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted text-lg mb-6">{error || 'No comparison data.'}</p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
        >
          <ArrowLeft size={16} /> Back to Properties
        </Link>
      </div>
    )
  }

  return <CompareTable result={result} />
}

export default function ComparePage() {
  return (
    <>
      <section className="pt-32 pb-10 bg-brand-section relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.06),transparent_60%)]" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="flex w-fit items-center gap-2 text-muted hover:text-white text-sm transition-colors mb-10"
          >
            <ArrowLeft size={15} /> Back to Properties
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase">Side by Side</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
            Property Comparison
          </h1>
        </div>
      </section>

      <section className="py-12 bg-brand min-h-[60vh]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="py-24 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <CompareContent />
          </Suspense>
        </div>
      </section>
    </>
  )
}
