import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EVOORION â€” Luxury Dubai Real Estate',
    short_name: 'EVOORION',
    description: 'Exclusive luxury real estate investment in Dubai.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0F1E',
    theme_color: '#C9A84C',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/logos/logomark.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logos/logomark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['real estate', 'property', 'investment'],
  }
}

