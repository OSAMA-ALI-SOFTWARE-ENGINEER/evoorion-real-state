'use client'

import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { Building2, MapPin } from 'lucide-react'

interface AreaMapProps {
  lat: number
  lng: number
  name: string
  propertyCount?: number
  zoom?: number
  apiKey?: string
}

export function AreaMap({ lat, lng, name, propertyCount, zoom = 14, apiKey: apiKeyProp }: AreaMapProps) {
  const apiKey = apiKeyProp ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'satellite'>('roadmap')

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
      <div className="relative isolate rounded-sm overflow-hidden border border-white/5 h-[340px]">
        <Map
          defaultCenter={{ lat, lng }}
          defaultZoom={zoom}
          mapTypeId={mapStyle}
          disableDefaultUI
          zoomControl
          gestureHandling="cooperative"
          className="w-full h-full"
          mapId="DEMO_MAP_ID"
        >
          <AdvancedMarker position={{ lat, lng }}>
            <div className="group relative flex flex-col items-center cursor-pointer select-none">
              {/* Pin Body */}
              <div className="p-2 rounded-full border shadow-lg transition-all duration-200 bg-brand/90 text-gold border-gold/50 backdrop-blur-sm hover:scale-110 hover:border-gold hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <MapPin size={16} fill="none" className="transition-transform duration-200" />
              </div>
              {/* Pin Tip */}
              <div className="w-1.5 h-1.5 rotate-45 -mt-[3px] bg-gold/50" />

              {/* Hover Tooltip */}
              <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[1000] min-w-[150px]">
                <div className="bg-brand/95 backdrop-blur-sm border border-gold/45 text-white p-2 rounded-sm shadow-xl text-center">
                  <p className="font-serif font-bold text-xs text-gold truncate">{name}</p>
                  {propertyCount != null && propertyCount > 0 ? (
                    <p className="text-[9px] text-white/60 mt-0.5 whitespace-nowrap">
                      {propertyCount} {propertyCount === 1 ? 'property' : 'properties'} here
                    </p>
                  ) : (
                    <p className="text-[9px] text-white/60 mt-0.5 whitespace-nowrap">This location</p>
                  )}
                </div>
                {/* Tooltip Arrow */}
                <div className="w-1.5 h-1.5 bg-brand border-r border-b border-gold/45 rotate-45 mx-auto -mt-[4px]" />
              </div>
            </div>
          </AdvancedMarker>
        </Map>

        {/* Satellite / Map toggle */}
        <div className="absolute top-3 right-3 z-[500] flex rounded-sm overflow-hidden border border-gold/40 shadow-lg">
          {(['roadmap', 'satellite'] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setMapStyle(style)}
              className={`px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                mapStyle === style
                  ? 'bg-gold text-brand'
                  : 'bg-brand/90 text-white/60 hover:text-white'
              }`}
            >
              {style === 'roadmap' ? 'Map' : 'Satellite'}
            </button>
          ))}
        </div>

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
