'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Map as LeafletMap, TileLayer } from 'leaflet'
import type { PropertySummary, Area } from '@/types'
import { useCountry } from '@/context/CountryContext'

interface PropertyMapViewProps {
  properties: PropertySummary[]
  areas: Area[]
}

type MapStyle = 'street' | 'satellite'

const TILE_LAYERS: Record<MapStyle, { url: string; attribution: string; maxZoom: number }> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
}

// Dubai city centre as default
const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708]
const DEFAULT_ZOOM = 11

function buildMarkerHtml(name: string): string {
  return `
    <div class="ev-pin-container">
      <!-- Pin Body -->
      <div class="ev-pin-body">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <!-- Pin Tip -->
      <div class="ev-pin-tip"></div>

      <!-- Hover Tooltip -->
      <div class="ev-pin-tooltip">
        <div class="ev-tooltip-content">
          <p class="ev-tooltip-title">${name}</p>
          <p class="ev-tooltip-sub">Click to see details</p>
        </div>
        <!-- Tooltip Arrow -->
        <div class="ev-tooltip-arrow"></div>
      </div>
    </div>
  `
}

export function PropertyMapView({ properties, areas }: PropertyMapViewProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const tileLayerRef = useRef<TileLayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapStyle, setMapStyle] = useState<MapStyle>('street')
  const { formatPrice } = useCountry()

  // Swap tile layer when style changes without rebuilding markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }
    const cfg = TILE_LAYERS[mapStyle]
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map)
  }, [mapStyle])

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
      tileLayerRef.current = null
    }

    // Fix default icon paths broken by webpack
    const proto = L.Icon.Default.prototype as unknown as Record<string, unknown>
    delete proto._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: false,
    })
    mapRef.current = map

    const cfg = TILE_LAYERS[mapStyle]
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map)

    // Build a map of area id → full area (for lat/lng lookup)
    const areaById = new Map<number, Area>()
    areas.forEach((a) => areaById.set(a.id, a))

    // Group properties by area id
    const grouped = new Map<number, { area: Area; props: PropertySummary[] }>()
    properties.forEach((p) => {
      if (!p.area?.id) return
      const fullArea = areaById.get(p.area.id)
      if (!fullArea?.latitude || !fullArea?.longitude) return
      const existing = grouped.get(p.area.id)
      if (existing) {
        existing.props.push(p)
      } else {
        grouped.set(p.area.id, { area: fullArea, props: [p] })
      }
    })

    const bounds: [number, number][] = []

    grouped.forEach(({ area, props }) => {
      const lat = area.latitude!
      const lng = area.longitude!
      bounds.push([lat, lng])

      const cheapest = props.reduce((min, p) =>
        parseFloat(p.price) < parseFloat(min.price) ? p : min, props[0])

      const icon = L.divIcon({
        html: buildMarkerHtml(area.name),
        className: '',
        iconAnchor: [17, 39],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(map)

      // Build popup as a real DOM tree — no HTML string interpolation,
      // so user-controlled values (title, slug, area name, image URLs)
      // are always assigned via textContent or validated attributes.
      const popup = document.createElement('div')
      Object.assign(popup.style, {
        background: '#0D1526', color: '#fff',
        padding: '12px', borderRadius: '2px',
        minWidth: '240px', maxWidth: '280px',
        fontFamily: 'inherit',
      })

      const areaLabel = document.createElement('div')
      Object.assign(areaLabel.style, {
        color: '#C9A84C', fontSize: '10px',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        marginBottom: '8px', fontWeight: '600',
      })
      areaLabel.textContent = area.name
      popup.appendChild(areaLabel)

      props.slice(0, 3).forEach((p, idx) => {
        const link = document.createElement('a')
        link.href = `/properties/${encodeURIComponent(p.slug)}`
        Object.assign(link.style, {
          display: 'flex', gap: '10px', alignItems: 'flex-start',
          padding: '8px 0',
          borderBottom: idx < Math.min(props.length, 3) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          textDecoration: 'none',
        })

        const rawImg = p.images?.[0]?.url ?? ''
        if (rawImg && /^https?:\/\//.test(rawImg)) {
          const img = document.createElement('img')
          img.src = rawImg          // validated scheme — safe as attribute value
          img.alt = ''
          Object.assign(img.style, {
            width: '52px', height: '40px',
            objectFit: 'cover', borderRadius: '2px', flexShrink: '0',
          })
          link.appendChild(img)
        }

        const info = document.createElement('div')
        info.style.minWidth = '0'

        const title = document.createElement('div')
        Object.assign(title.style, {
          color: '#fff', fontSize: '12px', fontWeight: '600',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px',
        })
        title.textContent = p.title
        info.appendChild(title)

        const price = document.createElement('div')
        Object.assign(price.style, { color: '#C9A84C', fontSize: '11px', marginTop: '2px' })
        price.textContent = formatPrice(p.price)
        info.appendChild(price)

        const meta = document.createElement('div')
        Object.assign(meta.style, {
          color: '#A0ABBB', fontSize: '10px', marginTop: '1px', textTransform: 'capitalize',
        })
        meta.textContent = `${p.type} · ${p.bedrooms ?? '—'} bed`
        info.appendChild(meta)

        link.appendChild(info)
        popup.appendChild(link)
      })

      if (props.length > 3) {
        const more = document.createElement('a')
        more.href = `/properties?area=${encodeURIComponent(area.slug)}`
        Object.assign(more.style, {
          display: 'block', marginTop: '8px',
          color: '#C9A84C', fontSize: '11px',
          textDecoration: 'none', letterSpacing: '0.05em',
        })
        more.textContent = `+${props.length - 3} more in ${area.name} →`
        popup.appendChild(more)
      }

      marker.bindPopup(popup, {
        closeButton: false,
        className: 'ev-popup',
        maxWidth: 300,
      })
    })

    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsLiteral, { padding: [60, 60], maxZoom: 13 })
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  // formatPrice is stable across renders; including it would loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, areas])

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      {/* Popup style override */}
      <style>{`
        .ev-popup .leaflet-popup-content-wrapper {
          background: transparent;
          border: 1px solid rgba(201,168,76,0.25);
          border-radius: 2px;
          padding: 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .ev-popup .leaflet-popup-content { margin: 0; }
        .ev-popup .leaflet-popup-tip-container { display: none; }

        .ev-pin-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .ev-pin-body {
          padding: 8px;
          border-radius: 9999px;
          border: 1px solid rgba(201,168,76,0.5);
          background-color: var(--color-brand, #0A0F1E);
          color: var(--color-gold, #C9A84C);
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          transition: all 0.2s ease;
        }
        .ev-pin-container:hover .ev-pin-body {
          transform: scale(1.1);
          border-color: var(--color-gold, #C9A84C);
          color: #fff;
        }
        .ev-pin-tip {
          width: 6px;
          height: 6px;
          background-color: rgba(201,168,76,0.5);
          transform: rotate(45deg);
          margin-top: -3px;
        }
        .ev-pin-container:hover .ev-pin-tip {
          background-color: var(--color-gold, #C9A84C);
        }
        .ev-pin-tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          min-width: 150px;
          z-index: 1000;
        }
        .ev-pin-container:hover .ev-pin-tooltip {
          opacity: 1;
        }
        .ev-tooltip-content {
          background-color: rgba(10,15,30,0.95);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(201,168,76,0.45);
          color: #fff;
          padding: 8px;
          border-radius: 2px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          text-align: center;
        }
        .ev-tooltip-title {
          font-family: serif;
          font-weight: bold;
          font-size: 12px;
          color: var(--color-gold, #C9A84C);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ev-tooltip-sub {
          font-size: 9px;
          color: rgba(255,255,255,0.6);
          margin: 2px 0 0 0;
          white-space: nowrap;
        }
        .ev-tooltip-arrow {
          width: 6px;
          height: 6px;
          background-color: rgb(10,15,30);
          border-right: 1px solid rgba(201,168,76,0.45);
          border-bottom: 1px solid rgba(201,168,76,0.45);
          transform: rotate(45deg);
          margin: -3px auto 0 auto;
        }
      `}</style>
      <div className="relative isolate">
        <div
          ref={containerRef}
          className="w-full h-[60vh] min-h-[420px] rounded-sm overflow-hidden border border-gold-border"
        />
        {/* Satellite / Street toggle */}
        <div className="absolute top-3 right-3 z-[500] flex rounded-sm overflow-hidden border border-gold/40 shadow-lg">
          {(['street', 'satellite'] as const).map((style) => (
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
              {style === 'street' ? 'Map' : 'Satellite'}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
