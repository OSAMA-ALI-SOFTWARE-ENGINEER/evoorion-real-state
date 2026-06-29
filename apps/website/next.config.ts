import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.evoorionrealestate.com',
        pathname: '/**',
      },
      // Legacy: images uploaded before the domain migration still reference this host.
      // A DB migration replaces them, but this covers any that slip through.
      {
        protocol: 'https',
        hostname: 'evoorion-api.osama-ali.com',
        pathname: '/**',
      },
      // Only allow the local dev API server in development builds.
      // Keeping this in production would allow the image optimization
      // endpoint to proxy requests to localhost on the server (SSRF).
      ...(isDev
        ? [{ protocol: 'http' as const, hostname: 'localhost', port: '8000', pathname: '/**' }]
        : []),
    ],
  },
}

export default withNextIntl(nextConfig)
