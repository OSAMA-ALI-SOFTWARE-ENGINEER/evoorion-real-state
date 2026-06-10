'use client'

interface ContactAddressMapProps {
  address: string
}

export function ContactAddressMap({ address }: ContactAddressMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  const q = encodeURIComponent(address)

  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}`
    : `https://maps.google.com/maps?q=${q}&output=embed`

  return (
    <div className="mt-10 aspect-[4/3] rounded-sm overflow-hidden border border-white/5">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Office Location"
      />
    </div>
  )
}
