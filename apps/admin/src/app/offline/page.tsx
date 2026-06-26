export default function OfflinePage() {
  return (
    <html>
      <body style={{ margin: 0, background: '#0F172A', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>EVOORION Admin</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>You're Offline</h1>
        <p style={{ color: '#64748B', maxWidth: '320px', lineHeight: 1.7, marginBottom: '2rem' }}>
          No internet connection. Please check your network and try again.
        </p>
        <a
          href="/dashboard"
          style={{ padding: '0.75rem 2rem', background: '#C9A84C', color: '#0F172A', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '4px' }}
        >
          Try Again
        </a>
      </body>
    </html>
  )
}
