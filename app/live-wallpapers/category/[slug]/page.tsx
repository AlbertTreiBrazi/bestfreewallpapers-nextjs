import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { LiveWallpaper } from '@/types'

interface LiveCategory {
  id: number; name: string; slug: string; description: string | null
  preview_image: string | null; seo_title: string | null; seo_description: string | null
}

interface Props { params: Promise<{ slug: string }> }

async function getCategory(slug: string): Promise<LiveCategory | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpaper_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as LiveCategory | null
}

async function getWallpapers(categorySlug: string): Promise<LiveWallpaper[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpapers')
    .select('id, title, slug, thumbnail_url, video_url, downloads_count, is_premium, duration_seconds, is_active, is_published, views_count, category, tags, description, created_at, updated_at')
    .eq('is_active', true)
    .eq('is_published', true)
    .eq('category', categorySlug)
    .order('downloads_count', { ascending: false })
    .limit(48)
  return (data || []) as LiveWallpaper[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategory(slug)
  if (!cat) return { title: 'Category not found' }

  const title = cat.seo_title || `${cat.name} Live Wallpapers — Free Animated Wallpapers`
  const description = cat.seo_description || cat.description ||
    `Download free ${cat.name} live wallpapers for iPhone and Android. Animated MP4 wallpapers — no registration required.`

  return {
    title,
    description,
    openGraph: {
      title, description,
      url: `${SITE_URL}/live-wallpapers/category/${slug}`,
      images: cat.preview_image ? [{ url: cat.preview_image, alt: cat.name }] : [],
    },
    alternates: { canonical: `${SITE_URL}/live-wallpapers/category/${slug}` },
  }
}

export const revalidate = 3600

export default async function LiveCategoryPage({ params }: Props) {
  const { slug } = await params
  const cat = await getCategory(slug)
  if (!cat) notFound()

  const wallpapers = await getWallpapers(slug)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/live-wallpapers" className="hover:text-white">Live Wallpapers</Link>
        <span>/</span>
        <span className="text-gray-300">{cat.name}</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-10 border border-gray-700">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-green-700/30 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{cat.name} Live Wallpapers</h1>
            <p className="text-gray-400 text-sm mt-1">{wallpapers.length} wallpapers available</p>
          </div>
        </div>
        {cat.description && <p className="text-gray-300 leading-relaxed">{cat.description}</p>}
        <div className="flex flex-wrap gap-3 mt-5">
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ Free Download</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ MP4 Format</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ iPhone & Android</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ No registration</span>
        </div>
      </div>

      {wallpapers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No live wallpapers in this category yet.</p>
          <Link href="/live-wallpapers" className="text-green-400 hover:text-green-300 text-sm">Browse all live wallpapers →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {wallpapers.map((lw) => (
            <Link
              key={lw.id}
              href={`/live-wallpaper/${lw.slug}`}
              className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-[9/16] block"
            >
              {lw.thumbnail_url && (
                <Image
                  src={lw.thumbnail_url}
                  alt={lw.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              {lw.is_premium && (
                <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-xs font-medium line-clamp-2">{lw.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
