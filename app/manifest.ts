import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BestFreeWallpapers',
    short_name: 'Wallpapers',
    description: 'Free HD wallpapers, live wallpapers & ringtones for iPhone and Android',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#15803d',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
      },
    ],
    categories: ['entertainment', 'lifestyle', 'photo'],
    shortcuts: [
      {
        name: 'Live Wallpapers',
        url: '/live-wallpapers',
        description: 'Browse animated live wallpapers',
      },
      {
        name: 'Ringtones',
        url: '/ringtones',
        description: 'Browse free ringtones',
      },
    ],
  }
}
