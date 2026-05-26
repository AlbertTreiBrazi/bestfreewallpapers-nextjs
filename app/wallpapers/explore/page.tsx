import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Wallpaper } from '@/types'
import ExplorePageClient from './ExplorePageClient'

export const metadata: Metadata = {
  title: 'Explore Wallpapers — BestFreeWallpapers',
  description: 'Swipe through free HD wallpapers for iPhone and Android. Find your perfect wallpaper in full screen.',
  robots: { index: false }, // explore is a UX surface, not an SEO page
}

export const revalidate = 600

export default async function WallpaperExplorePage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('id, title, slug, image_url, thumbnail_url, download_count, is_premium, tags, category, category_id, width, height, description, is_active, is_featured, aspect_ratio, device_type, download_url, seo_title, seo_description, created_at, updated_at')
    .eq('is_active', true)
    .order('download_count', { ascending: false })
    .limit(60)

  const wallpapers = (data || []) as Wallpaper[]

  return <ExplorePageClient wallpapers={wallpapers} />
}
