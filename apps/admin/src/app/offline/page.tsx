export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 bg-sidebar text-white">
      <p className="text-gold font-bold text-xl mb-2">EVOORION Admin</p>
      <h1 className="text-2xl font-bold mb-3">You&apos;re Offline</h1>
      <p className="text-muted max-w-xs leading-relaxed mb-8">
        No internet connection. Please check your network and try again.
      </p>
      <a
        href="/dashboard"
        className="px-8 py-3 bg-gold text-sidebar text-xs font-semibold tracking-widest uppercase rounded hover:bg-gold-light transition-colors"
      >
        Try Again
      </a>
    </div>
  )
}
