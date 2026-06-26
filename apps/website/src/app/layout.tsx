import type { Metadata } from 'next'
import './globals.css'
import { getPublicSettings } from '@/lib/api'
import { ServiceWorkerRegister } from '@/components/ui/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: {
    default: 'EVOORION — Luxury Dubai Real Estate Investment',
    template: '%s | EVOORION',
  },
  description:
    'Exclusive off-market Dubai real estate opportunities. High returns. Full-service investment advisory. EVOORION connects you with the finest luxury properties in Dubai.',
  keywords: [
    'Dubai real estate',
    'luxury property investment',
    'off-plan Dubai',
    'Dubai villa',
    'real estate advisory Dubai',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: 'EVOORION',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EVOORION',
  },
  icons: {
    apple: '/logos/logomark.png',
  },
  formatDetection: { telephone: false },
}

// Strict hex-color whitelist — only #rgb, #rrggbb, #rrggbbaa forms allowed.
const HEX_RE = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?$/

function safeHex(v: string | null | undefined): string | null {
  if (!v) return null
  const trimmed = v.trim()
  return HEX_RE.test(trimmed) ? trimmed : null
}

function buildThemeCss(s: Record<string, string | null | undefined>): string {
  const pairs: string[] = []
  const add = (cssVar: string, key: string) => {
    const v = safeHex(s[key])
    if (v) pairs.push(`${cssVar}:${v}`)
  }
  add('--color-brand', 'color_brand')
  add('--color-brand-section', 'color_brand_section')
  add('--color-gold', 'color_gold')
  add('--color-gold-light', 'color_gold_light')
  add('--color-muted', 'color_muted')
  return pairs.length ? `:root{${pairs.join(';')}}` : ''
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings()
  const themeCss = buildThemeCss(settings)

  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-brand text-white antialiased">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,500;1,700&family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
          precedence="default"
        />
        {themeCss && (
          <style
            dangerouslySetInnerHTML={{ __html: themeCss }}
            precedence="high"
          />
        )}
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
