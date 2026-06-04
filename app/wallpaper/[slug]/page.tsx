import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import { breadcrumbSchema } from '@/lib/structured-data'
import type { Wallpaper } from '@/types'
import WallpaperDetailClient from './WallpaperDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export interface CollectionInfo {
  id: string
  name: string
  slug: string
  cover_image_url: string | null
}

export interface CategoryInfo {
  name: string
  slug: string
}

async function getWallpaper(slug: string): Promise<Wallpaper | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data as Wallpaper | null
}

const RELATED_SELECT = 'id, title, slug, thumbnail_url, is_premium, download_count, created_at'

async function getRelated(
  categoryId: number | null,
  currentId: number,
  tags: string[] | null,
): Promise<Wallpaper[]> {
  const supabase = createServerSupabaseClient()

  // Primary: same category, sorted by popularity
  let primary: Wallpaper[] = []
  if (categoryId) {
    const { data } = await supabase
      .from('wallpapers')
      .select(RELATED_SELECT)
      .eq('is_active', true)
      .neq('id', currentId)
      .eq('category_id', categoryId)
      .order('download_count', { ascending: false })
      .limit(12)
    primary = (data || []) as Wallpaper[]
  }

  // Secondary: fill remaining slots with tag-based matches
  if (primary.length < 8 && tags && tags.length > 0) {
    const primaryTag = tags[0]
    const excludeIds = [currentId, ...primary.map((w) => w.id)]
    const { data } = await supabase
      .from('wallpapers')
      .select(RELATED_SELECT)
      .eq('is_active', true)
      .contains('tags', [primaryTag])
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('download_count', { ascending: false })
      .limit(12 - primary.length)
    primary = [...primary, ...(data || []) as Wallpaper[]]
  }

  // Fallback: if still empty (no category, no tags) — show popular wallpapers
  if (primary.length === 0) {
    const { data } = await supabase
      .from('wallpapers')
      .select(RELATED_SELECT)
      .eq('is_active', true)
      .neq('id', currentId)
      .order('download_count', { ascending: false })
      .limit(12)
    primary = (data || []) as Wallpaper[]
  }

  return primary
}

async function getCategoryInfo(categoryId: number | null): Promise<CategoryInfo | null> {
  if (!categoryId) return null
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('id', categoryId)
    .single()
  if (error) return null
  return data as CategoryInfo | null
}

async function getWallpaperCollections(wallpaperId: number): Promise<CollectionInfo[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('collection_wallpapers')
    .select('collection:collections(id, name, slug, cover_image_url)')
    .eq('wallpaper_id', wallpaperId)
    .limit(3)
  if (!data?.length) return []
  return data.map((r: any) => r.collection).filter(Boolean) as CollectionInfo[]
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
  const [related, collections, categoryInfo] = await Promise.all([
    getRelated(wallpaper.category_id, wallpaper.id, wallpaper.tags),
    getWallpaperCollections(wallpaper.id),
    getCategoryInfo(wallpaper.category_id),
  ])

  // Build breadcrumb items: Home > Wallpapers > [Category?] > Title
  const breadcrumbItems = [
    { name: 'Home',       url: SITE_URL },
    { name: 'Wallpapers', url: `${SITE_URL}/wallpapers` },
    ...(categoryInfo ? [{ name: categoryInfo.name, url: `${SITE_URL}/category/${categoryInfo.slug}` }] : []),
    { name: wallpaper.title }, // no url = current page
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
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
      },
      breadcrumbSchema(breadcrumbItems),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <WallpaperDetailClient wallpaper={wallpaper} related={related} collections={collections} categoryInfo={categoryInfo} />
    </>
  )
}
