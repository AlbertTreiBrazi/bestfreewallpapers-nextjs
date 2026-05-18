import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Wallpaper } from '@/types'
import WallpaperDetailClient from './WallpaperDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

async function getWallpaper(slug: string): Promise<Wallpaper | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Wallpaper | null
}

async function getRelated(categoryId: number | null, currentId: number): Promise<Wallpaper[]> {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('wallpapers')
    .select('id, title, slug, thumbnail_url, is_premium')
    .eq('is_active', true)
    .neq('id', currentId)
    .limit(6)
  if (categoryId) query = query.eq('category_id', categoryId)
  const { data } = await query
  return (data || []) as Wallpaper[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const w = await getWallpaper(slug)
  if (!w) return { title: 'Wallpaper not found' }
  const title = w.seo_title || `${w.title} — Free HD Wallpaper Download`
  const description = w.seo_description || w.description || `Download ${w.title} wallpaper for free. High quality HD wallpaper for iPhone and Android.`
  const imageUrl = w.thumbnail_url || w.image_url
  return {
    title, description,
    keywords: w.tags?.join(', '),
    openGraph: { title, description, url: `${SITE_URL}/wallpaper/${slug}`, images: imageUrl ? [{ url: imageUrl, width: w.width, height: w.height, alt: w.title }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: imageUrl ? [imageUrl] : [] },
    alternates: { canonical: `${SITE_URL}/wallpaper/${slug}` },
  }
}

export const revalidate = 3600

export default async function WallpaperDetailPage({ params }: Props) {
  const { slug } = await params
  const wallpaper = await getWallpaper(slug)
  if (!wallpaper) notFound()
  const related = await getRelated(wallpaper.category_id, wallpaper.id)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: wallpaper.title,
    description: wallpaper.description || '',
    contentUrl: wallpaper.image_url,
    thumbnailUrl: wallpaper.thumbnail_url || wallpaper.image_url,
    url: `${SITE_URL}/wallpaper/${slug}`,
    width: wallpaper.width,
    height: wallpaper.height,
    encodingFormat: 'image/jpeg',
    license: `${SITE_URL}/license`,
    creditText: 'BestFreeWallpapers.com',
    copyrightNotice: '© BestFreeWallpapers.com — Free for personal use',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <WallpaperDetailClient wallpaper={wallpaper} related={related} />
    </>
  )
}
