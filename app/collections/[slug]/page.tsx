import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Wallpaper } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

const deviceMeta: Record<string, { seoTitle: string; seoDescription: string; icon: string; gradient: string; resolutions: string[]; longDescription: string }> = {
  'iphone-wallpapers': {
    seoTitle: 'iPhone Wallpapers — Best Free HD Backgrounds for iPhone 2026',
    seoDescription: 'Download stunning iPhone wallpapers optimized for iPhone 15, 14, 13, 12, 11 and X. HD backgrounds perfect for all iPhone models.',
    icon: '📱', gradient: 'from-blue-600 to-indigo-700',
    resolutions: ['1170×2532 (iPhone 14)', '1290×2796 (iPhone 15 Pro Max)', '1125×2436 (iPhone X)'],
    longDescription: 'Stunning wallpapers optimized for all iPhone models in the perfect 19.5:9 aspect ratio.',
  },
  'android-wallpapers': {
    seoTitle: 'Android Wallpapers — HD Backgrounds for All Android Devices 2026',
    seoDescription: 'Best Android wallpapers for Samsung, Google Pixel, OnePlus, Xiaomi. HD backgrounds optimized for all Android phones.',
    icon: '🤖', gradient: 'from-green-600 to-emerald-700',
    resolutions: ['1080×1920 (FHD)', '1440×2560 (QHD)', '1080×2400 (20:9)'],
    longDescription: 'Perfect wallpapers for Samsung Galaxy, Google Pixel, OnePlus, Xiaomi and every Android device.',
  },
  'samsung-galaxy-wallpapers': {
    seoTitle: 'Samsung Galaxy Wallpapers — Free HD Backgrounds for Galaxy Phones',
    seoDescription: 'Best Samsung Galaxy wallpapers for Galaxy S24, S23, S22, Note 20 and all Samsung phones. AMOLED-optimized HD backgrounds.',
    icon: '📲', gradient: 'from-blue-500 to-cyan-600',
    resolutions: ['1440×3200 (Galaxy S24 Ultra)', '1080×2340 (Galaxy A54)', '1440×2960 (Galaxy S10)'],
    longDescription: 'Premium AMOLED-optimized wallpapers for Samsung Galaxy S24, S23, S22, Note and A series.',
  },
  'ipad-wallpapers': {
    seoTitle: 'iPad Wallpapers — Free HD Backgrounds for iPad Pro, Air & mini',
    seoDescription: 'Download stunning iPad wallpapers for iPad Pro, iPad Air, iPad mini. Ultra-high resolution backgrounds for Retina display.',
    icon: '💻', gradient: 'from-purple-600 to-violet-700',
    resolutions: ['2048×2732 (iPad Pro 12.9")', '1668×2388 (iPad Pro 11")', '1640×2360 (iPad Air)'],
    longDescription: 'Ultra-high resolution wallpapers for iPad Pro, iPad Air, and iPad mini Retina displays.',
  },
}

interface Collection {
  id: string; name: string; slug: string; description: string | null
  cover_image_url: string | null; is_featured: boolean; is_seasonal: boolean
  wallpaper_count: number; view_count: number
  color_theme: { primary: string; secondary: string; accent: string } | null
}

async function getCollection(slug: string): Promise<Collection | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('collections').select('*').eq('slug', slug).eq('is_active', true).single()
  return data as Collection | null
}

async function getCollectionWallpapers(collectionId: string): Promise<Wallpaper[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('collection_wallpapers')
    .select('wallpaper:wallpapers(id, title, slug, thumbnail_url, download_count, is_premium)')
    .eq('collection_id', collectionId).limit(48)
  if (data && data.length > 0) return data.map((r: any) => r.wallpaper).filter(Boolean) as Wallpaper[]
  const { data: w } = await supabase.from('wallpapers').select('id, title, slug, thumbnail_url, download_count, is_premium').eq('is_active', true).order('download_count', { ascending: false }).limit(48)
  return (w || []) as Wallpaper[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const dm = deviceMeta[slug]
  if (dm) return { title: dm.seoTitle, description: dm.seoDescription, alternates: { canonical: `${SITE_URL}/collections/${slug}` }, openGraph: { title: dm.seoTitle, description: dm.seoDescription, url: `${SITE_URL}/collections/${slug}` } }
  const col = await getCollection(slug)
  if (!col) return { title: 'Collection not found' }
  const title = `${col.name} — Free HD Wallpaper Collection`
  const description = col.description || `Download free wallpapers from the ${col.name} collection.`
  return { title, description, openGraph: { title, description, url: `${SITE_URL}/collections/${slug}`, images: col.cover_image_url ? [{ url: col.cover_image_url, alt: col.name }] : [] }, alternates: { canonical: `${SITE_URL}/collections/${slug}` } }
}

export const revalidate = 3600

const WallpaperGrid = ({ wallpapers }: { wallpapers: Wallpaper[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
    {wallpapers.map((w) => (
      <Link key={w.id} href={`/wallpaper/${w.slug}`} className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] block">
        {w.thumbnail_url && <Image src={w.thumbnail_url} alt={w.title} fill sizes="16vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">{w.title}</p>
        {w.is_premium && <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>}
      </Link>
    ))}
  </div>
)

export default async function CollectionSlugPage({ params }: Props) {
  const { slug } = await params
  const dm = deviceMeta[slug]

  if (dm) {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.from('wallpapers').select('id, title, slug, thumbnail_url, download_count, is_premium').eq('is_active', true).order('download_count', { ascending: false }).limit(48)
    const wallpapers = (data || []) as Wallpaper[]
    return (
      <>
        <div className={`bg-gradient-to-br ${dm.gradient} py-14 px-4`}>
          <div className="max-w-7xl mx-auto">
            <nav className="text-sm text-white/60 mb-6 flex items-center gap-2">
              <Link href="/" className="hover:text-white">Home</Link><span>/</span>
              <Link href="/collections" className="hover:text-white">Collections</Link><span>/</span>
              <span className="text-white/90">{dm.seoTitle.split('—')[0].trim()}</span>
            </nav>
            <div className="flex items-center gap-4 mb-3"><span className="text-5xl">{dm.icon}</span><h1 className="text-3xl md:text-4xl font-bold text-white">{dm.seoTitle.split('—')[0].trim()}</h1></div>
            <p className="text-white/70 max-w-2xl leading-relaxed">{dm.longDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">{dm.resolutions.map((r) => <span key={r} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{r}</span>)}</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8"><WallpaperGrid wallpapers={wallpapers} /></div>
      </>
    )
  }

  const col = await getCollection(slug)
  if (!col) notFound()
  const wallpapers = await getCollectionWallpapers(col.id)
  const bgStyle = col.color_theme ? { background: `linear-gradient(135deg, ${col.color_theme.primary}33, ${col.color_theme.secondary}22)` } : {}

  return (
    <>
      <div className="relative overflow-hidden" style={bgStyle}>
        {col.cover_image_url && <Image src={col.cover_image_url} alt={col.name} fill priority sizes="100vw" className="object-cover opacity-20" />}
        <div className="relative max-w-7xl mx-auto px-4 py-14">
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link><span>/</span>
            <Link href="/collections" className="hover:text-white">Collections</Link><span>/</span>
            <span className="text-gray-300">{col.name}</span>
          </nav>
          <div className="flex gap-3 mb-2 flex-wrap">
            {col.is_featured && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-medium">Featured</span>}
            {col.is_seasonal && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">Seasonal</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{col.name}</h1>
          {col.description && <p className="text-gray-300 max-w-2xl leading-relaxed">{col.description}</p>}
          <p className="text-gray-400 text-sm mt-3">{col.wallpaper_count} wallpapers · {col.view_count.toLocaleString()} views</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {wallpapers.length > 0 ? <WallpaperGrid wallpapers={wallpapers} /> : <p className="text-center py-20 text-gray-500">No wallpapers yet.</p>}
      </div>
    </>
  )
}
