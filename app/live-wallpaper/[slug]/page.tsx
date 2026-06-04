import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import { breadcrumbSchema } from '@/lib/structured-data'
import type { LiveWallpaper } from '@/types'
import LiveWallpaperDetailClient from './LiveWallpaperDetailClient'

interface Props { params: Promise<{ slug: string }> }

async function getLiveWallpaper(slug: string): Promise<LiveWallpaper | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('live_wallpapers').select('*').eq('slug', slug).eq('is_active', true).eq('is_published', true).single()
  if (error) return null
  return data as LiveWallpaper | null
}

async function getRelated(currentId: number): Promise<LiveWallpaper[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('live_wallpapers').select('id, title, slug, thumbnail_url, is_premium, video_url, downloads_count, views_count, category, duration_seconds, tags, description, is_active, is_published, created_at, updated_at').eq('is_active', true).eq('is_published', true).neq('id', currentId).limit(6)
  return (data || []) as LiveWallpaper[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lw = await getLiveWallpaper(slug)
  if (!lw) return { title: 'Live Wallpaper not found' }
  const title = `${lw.title} — Free Live Wallpaper Download`
  const description = lw.description || `Download ${lw.title} live wallpaper free. Animated wallpaper for iPhone and Android.`
  return {
    title, description,
    keywords: lw.tags?.join(', '),
    openGraph: { title, description, url: `${SITE_URL}/live-wallpaper/${slug}`, images: lw.thumbnail_url ? [{ url: lw.thumbnail_url, alt: lw.title }] : [], type: 'video.other' },
    twitter: { card: 'summary_large_image', title, description, images: lw.thumbnail_url ? [lw.thumbnail_url] : [] },
    alternates: { canonical: `${SITE_URL}/live-wallpaper/${slug}` },
  }
}

export const revalidate = 3600

export default async function LiveWallpaperDetailPage({ params }: Props) {
  const { slug } = await params
  const lw = await getLiveWallpaper(slug)
  if (!lw) notFound()
  const related = await getRelated(lw.id)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoObject',
        name: lw.title,
        description: lw.description || lw.title,
        thumbnailUrl: lw.thumbnail_url || undefined,
        contentUrl: lw.video_url,
        embedUrl: `${SITE_URL}/live-wallpaper/${slug}`,
        uploadDate: lw.created_at,
        duration: lw.duration_seconds ? `PT${lw.duration_seconds}S` : undefined,
        url: `${SITE_URL}/live-wallpaper/${slug}`,
        license: `${SITE_URL}/license`,
      },
      breadcrumbSchema([
        { name: 'Home',            url: SITE_URL },
        { name: 'Live Wallpapers', url: `${SITE_URL}/live-wallpapers` },
        ...(lw.category ? [{ name: lw.category, url: `${SITE_URL}/live-wallpapers/category/${lw.category.toLowerCase().replace(/\s+/g, '-')}` }] : []),
        { name: lw.title },
      ]),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <LiveWallpaperDetailClient lw={lw} related={related} />
    </>
  )
}
