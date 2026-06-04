import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bestfreewallpapers.com',
      },
      {
        protocol: 'https',
        hostname: 'eocgtrggcalfptqhgxer.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.suno.ai',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Security headers — applied to every response including static assets
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Prevent Cloudflare from caching HTML pages and RSC payloads.
        // Cloudflare ignores Vary headers, so without no-store it caches the RSC
        // text/x-component response and serves it to direct HTML requests too.
        // Excludes /_next/static (immutable hashed JS/CSS bundles) and
        // /_next/image (optimized image endpoint) — those should stay cached.
        source: '/((?!_next/static|_next/image).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
