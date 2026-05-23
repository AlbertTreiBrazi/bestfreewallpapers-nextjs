import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Wallpaper, LiveWallpaper, Ringtone } from '@/types'

interface Props { params: Promise<{ tag: string }> }

function decodeTag(raw: string) {
  return decodeURIComponent(raw).toLowerCase().replace(/-/g, ' ')
}

async function getWallpapers(tag: string): Promise<Wallpaper[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('id, title, slug, thumbnail_url, image_url, is_premium')
    .eq('is_active', true)
    .contains('tags', [tag])
    .order('download_count', { ascending: false })
    .limit(12)
  return (data || []) as Wallpaper[]
}

async function getLiveWallpapers(tag: string): Promise<LiveWallpaper[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpapers')
    .select('id, title, slug, thumbnail_url, video_url, is_premium, duration_seconds, is_active, is_published, views_count, downloads_count, category, tags, description, created_at, updated_at')
    .eq('is_active', true)
    .eq('is_published', true)
    .contains('tags', [tag])
    .order('downloads_count', { ascending: false })
    .limit(12)
  return (data || []) as LiveWallpaper[]
}

async function getRingtones(tag: string): Promise<Ringtone[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('ringtones')
    .select('id, title, slug, cover_image_url, audio_url, duration_seconds, downloads_count, is_premium, tags, is_active, is_published, description, file_size_bytes, plays_count, creator_name, seo_title, seo_description, meta_keywords, m4r_url, created_at, updated_at')
    .eq('is_active', true)
    .eq('is_published', true)
    .contains('tags', [tag])
    .order('downloads_count', { ascending: false })
    .limit(12)
  return (data || []) as Ringtone[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: rawTag } = await params
  const tag = decodeTag(rawTag)
  const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1)

  const title = `${displayTag} Wallpapers & Ringtones — Free Download`
  const description = `Download free ${displayTag} wallpapers, live wallpapers and ringtones. High quality ${displayTag} content for iPhone and Android — no sign-up required.`

  return {
    title,
    description,
    openGraph: {
      title, description,
      url: `${SITE_URL}/tag/${rawTag}`,
    },
    alternates: { canonical: `${SITE_URL}/tag/${rawTag}` },
  }
}

export const revalidate = 3600

export default async function TagPage({ params }: Props) {
  const { tag: rawTag } = await params
  const tag = decodeTag(rawTag)
  const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1)

  const [wallpapers, liveWallpapers, ringtones] = await Promise.all([
    getWallpapers(tag),
    getLiveWallpapers(tag),
    getRingtones(tag),
  ])

  const total = wallpapers.length + liveWallpapers.length + ringtones.length
  if (total === 0) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-gray-300">#{tag}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">#{displayTag}</h1>
        <p className="text-gray-400 text-sm">
          {total} free {wallpapers.length > 0 ? 'wallpapers' : ''}{liveWallpapers.length > 0 && wallpapers.length > 0 ? ', ' : ''}{liveWallpapers.length > 0 ? 'live wallpapers' : ''}{ringtones.length > 0 && (wallpapers.length > 0 || liveWallpapers.length > 0) ? ' & ' : ''}{ringtones.length > 0 ? 'ringtones' : ''} tagged #{tag}
        </p>
      </div>

      {/* Wallpapers section */}
      {wallpapers.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Wallpapers</h2>
            <Link href="/wallpapers" className="text-green-400 hover:text-green-300 text-sm">Browse all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wallpapers.map((w) => (
              <Link key={w.id} href={`/wallpaper/${w.slug}`} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-800 block">
                {(w.thumbnail_url || w.image_url) && (
                  <Image
                    src={w.thumbnail_url || w.image_url}
                    alt={w.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {w.is_premium && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium z-10">PRO</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">{w.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Live Wallpapers section */}
      {liveWallpapers.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Wallpapers</h2>
            <Link href="/live-wallpapers" className="text-green-400 hover:text-green-300 text-sm">Browse all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {liveWallpapers.map((lw) => (
              <Link key={lw.id} href={`/live-wallpaper/${lw.slug}`} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 block">
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
                  <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium z-10">PRO</span>
                )}
                {lw.duration_seconds && (
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium z-10">{lw.duration_seconds}s</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs font-medium line-clamp-1">{lw.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Ringtones section */}
      {ringtones.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Ringtones</h2>
            <Link href="/ringtones" className="text-green-400 hover:text-green-300 text-sm">Browse all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {ringtones.map((r) => (
              <Link key={r.id} href={`/ringtone/${r.slug}`} className="group bg-gray-800 hover:bg-gray-750 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all block">
                <div className="relative w-full aspect-square bg-gray-700">
                  {r.cover_image_url ? (
                    <Image
                      src={r.cover_image_url}
                      alt={r.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  {r.is_premium && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium z-10">PRO</span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-white text-xs font-medium line-clamp-1">{r.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">⬇ {r.downloads_count.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tag SEO content */}
      <section className="border-t border-gray-800 pt-8 mt-4">
        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
          Browse free {tag} wallpapers, animated live wallpapers and ringtones. All content is free to download for personal use on iPhone, Android, and Samsung Galaxy devices. No sign-up or account required.
        </p>
      </section>
    </div>
  )
}
