'use client'

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { Building2 } from 'lucide-react'

interface AreaMapProps {
  lat: number
  lng: number
  name: string
  propertyCount?: number
  zoom?: number
}

export function AreaMap({ lat, lng, name, propertyCount, zoom = 14 }: AreaMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''

  if (!apiKey) {
    return (
      <div className="relative rounded-sm overflow-hidden border border-white/5 h-80">
        <iframe
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`}
          width="100%"
          height="100%"
          className="border-0"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${name}`}
        />
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative rounded-sm overflow-hidden border border-white/5 h-[340px]">
        <Map
          defaultCenter={{ lat, lng }}
          defaultZoom={zoom}
          mapTypeId="roadmap"
          disableDefaultUI
          zoomControl
          gestureHandling="cooperative"
          className="w-full h-full"
        >
          <AdvancedMarker position={{ lat, lng }}>
            <div className="flex flex-col items-center select-none">
              <div className="flex flex-col items-center gap-0.5 bg-gold text-brand rounded px-3 py-1.5 font-bold text-xs tracking-[0.05em] shadow-[0_4px_20px_rgba(201,168,76,0.5)] whitespace-nowrap">
                <span>{name}</span>
                {propertyCount != null && propertyCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-medium opacity-75">
                    <Building2 size={10} />
                    {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
                  </span>
                )}
              </div>
              <div className="w-2.5 h-2.5 bg-gold rotate-45 -mt-[5px] shadow-[2px_2px_8px_rgba(201,168,76,0.3)]" />
            </div>
          </AdvancedMarker>
        </Map>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-brand/90 backdrop-blur-sm border border-white/10 rounded-sm px-2.5 py-1.5 text-[11px] text-white/70 hover:text-white transition-colors"
        >
          Open in Maps ↗
        </a>
      </div>
    </APIProvider>
  )
}
