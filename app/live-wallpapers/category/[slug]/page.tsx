import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { LiveWallpaper } from '@/types'

interface LiveCategory {
  id: number; name: string; slug: string; description: string | null
  preview_image: string | null; seo_title: string | null; seo_description: string | null
}

interface NavCategory { id: number; name: string; slug: string }

interface Props { params: Promise<{ slug: string }> }

async function getCategory(slug: string): Promise<LiveCategory> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpaper_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (data) return data as LiveCategory
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { id: 0, name, slug, description: null, preview_image: null, seo_title: null, seo_description: null }
}

async function getWallpapers(categorySlug: string): Promise<LiveWallpaper[]> {
  const supabase = createServerSupabaseClient()
  // slug is kebab-case ("animated-nature"); DB stores with spaces ("animated nature")
  const category = categorySlug.replace(/-/g, ' ')
  const { data } = await supabase
    .from('live_wallpapers')
    .select('id, title, slug, thumbnail_url, video_url, downloads_count, is_premium, duration_seconds, is_active, is_published, views_count, category, tags, description, created_at, updated_at')
    .eq('is_active', true)
    .eq('is_published', true)
    .eq('category', category)
    .order('downloads_count', { ascending: false })
    .limit(48)
  return (data || []) as LiveWallpaper[]
}

async function getAllCategories(): Promise<NavCategory[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpapers')
    .select('category')
    .eq('is_active', true)
    .eq('is_published', true)
    .not('category', 'is', null)
    .limit(200)
  const unique = [...new Set((data || []).map((d: any) => d.category).filter(Boolean))] as string[]
  return unique.map((name, i) => ({ id: i, name: name.charAt(0).toUpperCase() + name.slice(1), slug: name }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategory(slug)
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
  const [cat, wallpapers, allCats] = await Promise.all([
    getCategory(slug),
    getWallpapers(slug),
    getAllCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href="/live-wallpapers" className="hover:text-white">Live Wallpapers</Link>
        <span>/</span>
        <span className="text-gray-300">{cat.name}</span>
      </nav>

      {/* Hero — slimmed down */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 sm:p-6 mb-4 border border-gray-700">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{cat.name} Live Wallpapers</h1>
        <p className="text-gray-400 text-sm mb-3">{wallpapers.length} {wallpapers.length === 1 ? 'wallpaper' : 'wallpapers'} available</p>
        {cat.description && <p className="text-gray-300 text-sm leading-relaxed mb-4">{cat.description}</p>}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ Free Download</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ MP4 Format</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ iPhone &amp; Android</span>
          <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ No registration</span>
        </div>
      </div>

      {/* Category nav strip — active category highlighted */}
      {allCats.length > 0 && (
        <div className="relative mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {allCats.map((c) => (
              <Link
                key={c.id}
                href={`/live-wallpapers/category/${c.slug}`}
                className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 ${
                  c.slug === slug
                    ? 'bg-green-700 border-green-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-green-600 text-gray-300 hover:text-white'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
        </div>
      )}

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
              {lw.thumbnail_url ? (
                <Image
                  src={lw.thumbnail_url}
                  alt={lw.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
              )}
              {lw.is_premium && (
                <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium z-10">PRO</span>
              )}
              {lw.duration_seconds && (
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium z-10">
                  {lw.duration_seconds}s
                </span>
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
