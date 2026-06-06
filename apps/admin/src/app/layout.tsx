import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'EVOORION Admin',
  description: 'EVOORION real estate admin panel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          precedence="default"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
          precedence="default"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          precedence="default"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
