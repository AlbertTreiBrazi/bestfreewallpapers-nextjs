'use client'

import { useRouter } from 'next/navigation'
import WallpaperExplore from '@/components/wallpapers/WallpaperExplore'
import type { Wallpaper } from '@/types'

export default function ExplorePageClient({ wallpapers }: { wallpapers: Wallpaper[] }) {
  const router = useRouter()
  return (
    <WallpaperExplore
      wallpapers={wallpapers}
      onClose={() => router.push('/wallpapers')}
    />
  )
}
