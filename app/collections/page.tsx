import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import CollectionsClient from './CollectionsClient'

export const metadata: Metadata = {
  title: 'Wallpaper Collections — Curated Sets for Every Device',
  description: 'Browse curated wallpaper collections for iPhone, Android, Samsung, iPad and desktop. Each collection features matching wallpapers designed for specific devices and styles.',
  alternates: { canonical: `${SITE_URL}/collections` },
  openGraph: {
    title: 'Wallpaper Collections — Curated Sets for Every Device',
    description: 'Browse curated wallpaper collections for iPhone, Android, Samsung, iPad and desktop.',
    url: `${SITE_URL}/collections`,
  },
}

export const revalidate = 3600

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  is_featured: boolean
  is_seasonal: boolean
  wallpaper_count: number
  view_count: number
  sort_order: number
  color_theme: { primary: string; secondary: string } | null
}

export default async function CollectionsPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('collections')
    .select('id, name, slug, description, cover_image_url, is_featured, is_seasonal, wallpaper_count, view_count, sort_order, color_theme')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(50)

  const collections = (data || []) as Collection[]
  const featured = collections.filter((c) => c.is_featured)
  const regular = collections.filter((c) => !c.is_featured)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Wallpaper Collections',
    description: 'Curated wallpaper collections for every device',
    url: `${SITE_URL}/collections`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-gray-300">Collections</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Wallpaper Collections</h1>
          <p className="text-gray-400">Curated sets of wallpapers organized by device, theme and style.</p>
        </div>

        <CollectionsClient featured={featured} regular={regular} />
      </div>
    </>
  )
}
