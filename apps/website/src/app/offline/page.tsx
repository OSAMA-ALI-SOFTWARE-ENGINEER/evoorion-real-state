import Image from 'next/image'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <html>
      <body style={{ margin: 0, background: '#0A0F1E', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <Image src="/logos/primary-logo.png" alt="EVOORION" width={180} height={40} style={{ objectFit: 'contain', marginBottom: '2.5rem' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C', marginBottom: '0.75rem' }}>You're Offline</h1>
        <p style={{ color: '#A0ABBB', maxWidth: '360px', lineHeight: 1.7, marginBottom: '2rem' }}>
          No internet connection. Please check your network and try again.
        </p>
        <Link
          href="/"
          style={{ padding: '0.75rem 2rem', background: '#C9A84C', color: '#0A0F1E', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px' }}
        >
          Try Again
        </Link>
      </body>
    </html>
  )
}
