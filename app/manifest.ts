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
