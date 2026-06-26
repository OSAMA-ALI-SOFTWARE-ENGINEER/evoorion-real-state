import Image from 'next/image'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 bg-brand">
      <Image
        src="/logos/primary-logo.png"
        alt="EVOORION"
        width={180}
        height={40}
        style={{ objectFit: 'contain', marginBottom: '2.5rem' }}
      />
      <h1 className="text-xl font-bold text-gold mb-3">You&apos;re Offline</h1>
      <p className="text-muted max-w-sm leading-relaxed mb-8">
        No internet connection. Please check your network and try again.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-gold text-brand text-xs font-semibold tracking-widest uppercase rounded-sm hover:bg-gold-light transition-colors"
      >
        Try Again
      </Link>
    </div>
  )
}
