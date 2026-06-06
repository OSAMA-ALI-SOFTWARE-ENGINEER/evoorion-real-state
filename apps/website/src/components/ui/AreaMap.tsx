'use client'

interface AreaMapProps {
  lat: number
  lng: number
  name: string
  zoom?: number
}

export function AreaMap({ lat, lng, name, zoom = 14 }: AreaMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  // With an API key: Embed API v1 — satellite view, no UI chrome
  // Without: legacy embed URL — works without a key but shows full Maps UI
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(apiKey)}&center=${lat},${lng}&zoom=${zoom}&maptype=satellite`
    : `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`

  return (
    <div className="relative rounded-sm overflow-hidden border border-white/5 h-72">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map of ${name}`}
      />
    </div>
  )
}
