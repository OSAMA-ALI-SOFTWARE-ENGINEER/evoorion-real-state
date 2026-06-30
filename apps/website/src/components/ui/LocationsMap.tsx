'use client'

import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import Link from 'next/link'
import { ArrowRight, MapPin, X } from 'lucide-react'
import type { Area } from '@/types'

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 }

function AreaPin({ name, selected }: { name: string; selected: boolean }) {
  return (
    <div className={`flex flex-col items-center cursor-pointer select-none transition-all duration-200 ${selected ? 'scale-125' : 'hover:scale-110'}`}>
      <div className={`px-2 py-0.5 rounded-[3px] text-[11px] font-bold tracking-[0.04em] whitespace-nowrap border shadow-lg ${
        selected
          ? 'bg-gold text-brand border-gold shadow-[0_4px_16px_rgba(201,168,76,0.45)]'
          : 'bg-brand/90 text-gold border-gold/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.5)]'
      }`}>
        {name}
      </div>
      <div className={`w-2 h-2 rotate-45 -mt-1 ${selected ? 'bg-gold' : 'bg-gold/50'}`} />
    </div>
  )
}

export function LocationsMap({ areas, apiKey: apiKeyProp }: { areas: Area[]; apiKey?: string }) {
  const apiKey = apiKeyProp ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)

  const areasWithCoords = areas.filter(
    (a) => a.latitude != null && a.longitude != null,
  )

  if (!apiKey) {
    return (
      <div className="w-full h-72 flex items-center justify-center bg-brand-section rounded-sm border border-white/5">
        <div className="text-center">
          <MapPin size={28} className="text-gold/30 mx-auto mb-2" />
          <p className="text-muted text-sm">Google Maps key not configured.</p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative isolate w-full h-[420px] sm:h-[500px] rounded-sm overflow-hidden border border-white/5">
        <Map
          defaultCenter={DUBAI_CENTER}
          defaultZoom={11}
          mapTypeId="roadmap"
          disableDefaultUI
          zoomControl
          gestureHandling="cooperative"
          className="w-full h-full"
        >
          {areasWithCoords.map((area) => (
            <AdvancedMarker
              key={area.id}
              position={{ lat: area.latitude!, lng: area.longitude! }}
              onClick={() =>
                setSelectedArea((prev) => (prev?.id === area.id ? null : area))
              }
            >
              <AreaPin name={area.name} selected={selectedArea?.id === area.id} />
            </AdvancedMarker>
          ))}
        </Map>

        {/* Hint pill */}
        {!selectedArea && areasWithCoords.length > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-brand/80 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 pointer-events-none">
            <MapPin size={11} className="text-gold" />
            <span className="text-white/60 text-[11px] tracking-wide whitespace-nowrap">
              Tap a location to explore
            </span>
          </div>
        )}

        {/* Selected area info card */}
        {selectedArea && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 bg-brand/95 backdrop-blur-md border border-gold/30 rounded-sm shadow-2xl p-4 z-10">
            <button
              type="button"
              onClick={() => setSelectedArea(null)}
              aria-label="Close"
              className="absolute top-3 right-3 text-muted hover:text-white transition-colors"
            >
              <X size={14} />
            </button>

            <h3 className="font-serif text-white font-bold text-lg mb-2 pr-6">
              {selectedArea.name}
            </h3>

            {(selectedArea.long_term_roi || selectedArea.appreciation || selectedArea.off_plan_discount) && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedArea.long_term_roi && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    {selectedArea.long_term_roi} yield
                  </span>
                )}
                {selectedArea.appreciation && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">
                    {selectedArea.appreciation} growth
                  </span>
                )}
                {selectedArea.off_plan_discount && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                    {selectedArea.off_plan_discount} off-plan
                  </span>
                )}
              </div>
            )}

            {selectedArea.description && (
              <p className="text-muted text-xs leading-relaxed line-clamp-2 mb-3">
                {selectedArea.description}
              </p>
            )}

            <Link
              href={`/locations/${selectedArea.slug}`}
              className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold tracking-wider uppercase hover:gap-3 transition-all duration-200"
            >
              Explore Area <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </APIProvider>
  )
}

