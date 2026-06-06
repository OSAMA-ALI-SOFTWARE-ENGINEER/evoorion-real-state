import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { AuthProvider } from '@/context/AuthContext'

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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand text-white antialiased">
        {/* React 19 hoists these to <head>; precedence required for stylesheets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
          precedence="default"
        />
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  )
}
