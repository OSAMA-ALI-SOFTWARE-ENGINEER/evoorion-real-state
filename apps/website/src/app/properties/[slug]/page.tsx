import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProperty } from '@/lib/api'
import { PropertyDetailClient } from './PropertyDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await getProperty(slug)
    const p = res.data
    return {
      title: p.meta_title ?? p.title,
      description: p.meta_description ?? p.description?.slice(0, 160),
    }
  } catch {
    return { title: 'Property Not Found' }
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params

  let property
  try {
    const res = await getProperty(slug)
    property = res.data
  } catch {
    notFound()
  }

  return <PropertyDetailClient property={property} />
}
