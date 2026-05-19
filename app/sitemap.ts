import { MetadataRoute } from 'next'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()

  const [wallpapersRes, ringtonesRes, liveRes, categoriesRes, collectionsRes, ringtoneCatsRes] = await Promise.all([
    supabase.from('wallpapers').select('slug, updated_at').eq('is_active', true),
    supabase.from('ringtones').select('slug, updated_at').eq('is_active', true).eq('is_published', true),
    supabase.from('live_wallpapers').select('slug, updated_at').eq('is_active', true).eq('is_published', true),
    supabase.from('categories').select('slug, updated_at').eq('is_active', true),
    supabase.from('collections').select('slug, updated_at').eq('is_active', true),
    supabase.from('ringtone_categories').select('slug, updated_at').eq('is_active', true),
  ])

  const wallpaperUrls = (wallpapersRes.data || []).map((w) => ({
    url: `${SITE_URL}/wallpaper/${w.slug}`,
    lastModified: new Date(w.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const ringtoneUrls = (ringtonesRes.data || []).map((r) => ({
    url: `${SITE_URL}/ringtone/${r.slug}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const liveUrls = (liveRes.data || []).map((lw) => ({
    url: `${SITE_URL}/live-wallpaper/${lw.slug}`,
    lastModified: new Date(lw.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const categoryUrls = (categoriesRes.data || []).map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  const collectionUrls = (collectionsRes.data || []).map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const ringtoneCatUrls = (ringtoneCatsRes.data || []).map((c) => ({
    url: `${SITE_URL}/ringtones/category/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/wallpapers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/ringtones`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/live-wallpapers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/free-wallpapers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/mobile-wallpapers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/ai-wallpapers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/collections/iphone-wallpapers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/collections/android-wallpapers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/collections/samsung-galaxy-wallpapers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/collections/ipad-wallpapers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/ringtones/how-to-set`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/license`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/dmca`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [
    ...staticUrls,
    ...wallpaperUrls,
    ...ringtoneUrls,
    ...liveUrls,
    ...categoryUrls,
    ...collectionUrls,
    ...ringtoneCatUrls,
  ]
}
