'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { getAdminProperty } from '@/lib/api'
import type { Property } from '@/types'
import { PropertyForm } from '@/components/ui/PropertyForm'

export default function EditPropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    getAdminProperty(slug)
      .then(res => setProperty(res.data))
      .catch(err => setError(err instanceof Error ? err.message : 'Not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 bg-slate-100 rounded w-64 animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 h-96 animate-pulse" />
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />
            <div className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || 'Property not found'}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-800">Edit Property</h1>
        <p className="text-sm text-slate-500 mt-0.5 font-mono">{property.slug}</p>
      </div>
      <PropertyForm property={property} />
    </div>
  )
}
