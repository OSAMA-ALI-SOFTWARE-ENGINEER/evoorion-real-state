'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'
import type { PropertySummary, Area } from '@/types'
import { useCountry } from '@/context/CountryContext'

interface PropertyMapViewProps {
  properties: PropertySummary[]
  areas: Area[]
}

// Dubai city centre as default
const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708]
const DEFAULT_ZOOM = 11

function buildMarkerHtml(count: number, price: string): string {
  return `
    <div style="
      position:relative;
      display:flex;
      flex-direction:column;
      align-items:center;
    ">
      <div style="
        background:var(--color-gold,#C9A84C);
        color:var(--color-brand,#0A0F1E);
        font-weight:700;
        font-size:11px;
        letter-spacing:0.05em;
        padding:4px 9px;
        border-radius:2px;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        line-height:1.4;
        text-align:center;
      ">
        ${count > 1 ? `${count} properties` : price}
      </div>
      <div style="
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-top:6px solid var(--color-gold,#C9A84C);
      "></div>
    </div>
  `
}

export function PropertyMapView({ properties, areas }: PropertyMapViewProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { formatPrice } = useCountry()

  useEffect(() => {
    if (!containerRef.current) return
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
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
        html: buildMarkerHtml(props.length, formatPrice(cheapest.price)),
        className: '',
        iconAnchor: [0, 36],
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
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
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
        more.target = '_blank'
        more.rel = 'noopener noreferrer'
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
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-[60vh] min-h-[420px] rounded-sm overflow-hidden border border-gold-border"
      />
    </>
  )
}
