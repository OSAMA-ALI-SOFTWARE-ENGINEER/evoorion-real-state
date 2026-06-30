'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, BedDouble, Bath, Maximize2, TrendingUp,
  MessageCircle, ArrowLeft, X, ChevronLeft, ChevronRight,
  Play, FileText, Download, Images,
} from 'lucide-react'
import { LeadForm } from '@/components/ui/LeadForm'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { useCountry } from '@/context/CountryContext'
import type { Property, PropertyImage } from '@/types'

function PropertyLocationMap({ location, apiKey }: { location: string; apiKey: string }) {
  const q = encodeURIComponent(location)
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}`
    : `https://maps.google.com/maps?q=${q}&output=embed`

  return (
    <div className="relative isolate rounded-sm overflow-hidden border border-white/5 h-64">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Property Location"
      />
    </div>
  )
}

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    rented: 'bg-blue-500 text-white',
    sold: 'bg-red-500 text-white',
    available: 'bg-emerald-600 text-white',
  }
  const labels: Record<string, string> = { rented: 'Rented', sold: 'Sold', available: 'Ready' }
  return (
    <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm ${map[status] ?? 'bg-white/10 text-white'}`}>
      {labels[status] ?? status}
    </span>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: PropertyImage[]
  startIndex: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIndex)
  const current = images[idx]

  const prev = () => setIdx((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setIdx((i) => (i === images.length - 1 ? 0 : i + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {idx + 1} / {images.length}
      </div>

      {/* Prev */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl mx-16 aspect-[16/10]"
        >
          <Image
            src={current.url}
            alt={current.caption ?? `Photo ${idx + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
          {current.caption && (
            <p className="absolute bottom-0 left-0 right-0 text-center text-white/60 text-sm py-3 bg-gradient-to-t from-black/60 to-transparent">
              {current.caption}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={22} />
      </button>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto px-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`relative w-14 h-10 shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${
                i === idx ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-75'
              }`}
              aria-label={`Go to photo ${i + 1}`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Hero gallery grid ─────────────────────────────────────────────────────────

function HeroGallery({
  images,
  onOpenLightbox,
}: {
  images: PropertyImage[]
  onOpenLightbox: (index: number) => void
}) {
  const primary = images.find((i) => i.is_primary) ?? images[0]
  const primaryIdx = images.indexOf(primary)
  const rest = images.filter((_, i) => i !== primaryIdx).slice(0, 4)
  const total = images.length

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] rounded-sm overflow-hidden">
        <Image src={PLACEHOLDER} alt="Property" fill className="object-cover" priority sizes="100vw" />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpenLightbox(0)}
        className="relative w-full aspect-[16/9] rounded-sm overflow-hidden group cursor-zoom-in"
        aria-label="View photo"
      >
        <Image src={primary?.url ?? PLACEHOLDER} alt={primary?.caption ?? 'Property'} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority sizes="100vw" />
      </button>
    )
  }

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-1.5 h-[480px] sm:h-[540px] rounded-sm overflow-hidden">
      {/* Primary — spans 2 cols + 2 rows */}
      <button
        type="button"
        onClick={() => onOpenLightbox(primaryIdx)}
        className="col-span-2 row-span-2 relative overflow-hidden group cursor-zoom-in"
        aria-label="View primary photo"
      >
        <Image
          src={primary?.url ?? PLACEHOLDER}
          alt={primary?.caption ?? 'Property'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </button>

      {/* Side thumbnails */}
      {rest.map((img, i) => {
        const isLast = i === rest.length - 1 && total > 5
        const originalIdx = images.indexOf(img)
        return (
          <button
            key={img.id}
            type="button"
            onClick={() => onOpenLightbox(isLast ? 0 : originalIdx)}
            className="relative overflow-hidden group cursor-zoom-in"
            aria-label={isLast ? `View all ${total} photos` : `View photo ${i + 2}`}
          >
            <Image
              src={img.url}
              alt={img.caption ?? `Photo ${i + 2}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            {isLast && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                <Images size={20} className="text-white" />
                <span className="text-white text-sm font-semibold">+{total - 5} more</span>
              </div>
            )}
          </button>
        )
      })}

      {/* See all button overlay on primary */}
      {total > 1 && (
        <button
          type="button"
          onClick={() => onOpenLightbox(0)}
          className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 hover:bg-white text-brand text-xs font-semibold px-3 py-2 rounded-sm transition-colors shadow-lg"
          aria-label="See all photos"
        >
          <Images size={14} />
          See all {total} photos
        </button>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  property: Property
}

// Parse admin-authored rich-text HTML and reconstruct it using only
// allowlisted tags — no innerHTML on any rendered element, no script execution.
// DOMParser.parseFromString never runs scripts in the parsed document.
const SAFE_TAGS = new Set(['p','br','strong','b','em','i','h2','h3','ul','ol','li','div','span'])

function buildSafe(source: Node, target: Node) {
  for (const child of Array.from(source.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(child.textContent ?? ''))
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = (child as Element).tagName.toLowerCase()
      if (SAFE_TAGS.has(tag)) {
        const el = document.createElement(tag)
        buildSafe(child, el)
        target.appendChild(el)
      } else {
        buildSafe(child, target) // unwrap disallowed tag, keep its children
      }
    }
    // comments, processing instructions, etc. are silently dropped
  }
}

function useSafeHtml(html: string | undefined) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.replaceChildren()
    if (!html) return
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    buildSafe(parsed.body, el)
  }, [html])
  return ref
}

export function PropertyDetailClient({ property }: Props) {
  const { formatPrice } = useCountry()
  const [mapsKey, setMapsKey] = useState('')
  const allMedia   = property.images ?? []

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
    fetch(`${api}/settings`).then(r => r.json()).then(j => setMapsKey(j?.data?.google_maps_key ?? '')).catch(() => {})
  }, [])
  const imageMedia = allMedia.filter((m) => !m.type || m.type === 'image')
  const videoMedia = allMedia.filter((m) => m.type === 'video')
  const fileMedia  = allMedia.filter((m) => m.type === 'file')

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const descRef = useSafeHtml(property.description)

  const wa = `https://wa.me/971000000000?text=${encodeURIComponent(
    `Hi, I'm interested in: ${property.title}`,
  )}`

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-24 pb-6 bg-brand-section border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/properties" className="inline-flex items-center gap-2 text-muted text-sm hover:text-gold transition-colors">
            <ArrowLeft size={15} />
            Back to Properties
          </Link>
        </div>
      </div>

      {/* Hero gallery */}
      <section className="bg-brand-section">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
          <HeroGallery images={imageMedia} onOpenLightbox={setLightboxIdx} />
        </div>
      </section>

      {/* Details + Form */}
      <section className="py-12 bg-brand">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left: property info */}
            <div className="lg:col-span-2 space-y-10">
              <ScrollReveal>
                {/* Badges */}
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
                    {property.developer && <span className="text-white/20 mx-2">·</span>}
                    {property.developer && <span>{property.developer.name}</span>}
                  </div>
                )}

                {/* Key stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                    <p className="text-gold font-serif text-2xl font-bold leading-none mb-1">{property.bedrooms}</p>
                    <div className="flex items-center justify-center gap-1 text-muted text-xs"><BedDouble size={12} /> Bedrooms</div>
                  </div>
                  <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                    <p className="text-gold font-serif text-2xl font-bold leading-none mb-1">{property.bathrooms}</p>
                    <div className="flex items-center justify-center gap-1 text-muted text-xs"><Bath size={12} /> Bathrooms</div>
                  </div>
                  <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                    <p className="text-gold font-serif text-lg font-bold leading-none mb-1">{parseFloat(property.area_sqft).toLocaleString()}</p>
                    <div className="flex items-center justify-center gap-1 text-muted text-xs"><Maximize2 size={12} /> Sq Ft</div>
                  </div>
                  {property.roi_min && property.roi_max && (
                    <div className="p-4 border border-white/5 rounded-sm bg-brand-section/50 text-center">
                      <p className="text-emerald-400 font-serif text-lg font-bold leading-none mb-1">{property.roi_min}–{property.roi_max}%</p>
                      <div className="flex items-center justify-center gap-1 text-muted text-xs"><TrendingUp size={12} /> ROI</div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-white/5">
                  <span className="font-serif text-4xl font-bold text-gold">{formatPrice(property.price)}</span>
                  <span className="text-muted text-sm">Starting Price</span>
                </div>

                {/* Description — safe DOM reconstruction from admin-authored rich text */}
                {property.description && (
                  <div>
                    <h2 className="text-white font-semibold mb-3 tracking-wide">About This Property</h2>
                    <div
                      ref={descRef}
                      className="text-muted leading-relaxed
                        [&_h2]:text-white [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-5 [&_h2]:mb-2
                        [&_h3]:text-white/80 [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-1.5
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1
                        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1
                        [&_strong]:text-white/90 [&_strong]:font-semibold
                        [&_em]:italic [&_p]:mb-2 last:[&_p]:mb-0"
                    />
                  </div>
                )}
              </ScrollReveal>

              {/* Location map */}
              {(property.area?.name || property.location) && (
                <ScrollReveal>
                  <h2 className="text-white font-semibold mb-3 tracking-wide">Location</h2>
                  <PropertyLocationMap
                    location={[property.area?.name, property.location].filter(Boolean).join(', ') + ', Dubai, UAE'}
                    apiKey={mapsKey}
                  />
                </ScrollReveal>
              )}

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <ScrollReveal>
                  <h2 className="text-white font-semibold mb-4 tracking-wide">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 py-2 px-3 border border-white/5 rounded-sm bg-brand-section/30 text-muted text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {a.amenity}
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {/* Videos */}
              {videoMedia.length > 0 && (
                <ScrollReveal>
                  <h2 className="text-white font-semibold mb-4 tracking-wide flex items-center gap-2">
                    <Play size={16} className="text-gold" />
                    Property Videos
                  </h2>
                  <div className="space-y-4">
                    {videoMedia.map((v) => (
                      <div key={v.id} className="rounded-sm overflow-hidden border border-white/5">
                        <div className="relative w-full aspect-video bg-black">
                          <iframe
                            src={v.url}
                            title={v.caption ?? 'Property Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>
                        {v.caption && (
                          <p className="px-4 py-2.5 text-muted text-sm border-t border-white/5">{v.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {/* Documents */}
              {fileMedia.length > 0 && (
                <ScrollReveal>
                  <h2 className="text-white font-semibold mb-4 tracking-wide flex items-center gap-2">
                    <FileText size={16} className="text-gold" />
                    Documents
                  </h2>
                  <div className="space-y-2">
                    {fileMedia.map((f) => (
                      <a
                        key={f.id}
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-3.5 border border-white/10 rounded-sm bg-brand-section/30 hover:border-gold-border hover:bg-brand-section/60 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-sm bg-gold/10 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-gold" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium group-hover:text-gold transition-colors">
                              {f.caption ?? f.file_name ?? 'Document'}
                            </p>
                            {f.file_name && f.caption && (
                              <p className="text-muted text-xs">{f.file_name}</p>
                            )}
                          </div>
                        </div>
                        <Download size={15} className="text-muted group-hover:text-gold transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {/* WhatsApp CTA */}
              <ScrollReveal>
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

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Lightbox
              images={imageMedia}
              startIndex={lightboxIdx}
              onClose={() => setLightboxIdx(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
