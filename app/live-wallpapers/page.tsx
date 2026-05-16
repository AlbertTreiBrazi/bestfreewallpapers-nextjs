import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { LiveWallpaper } from '@/types'

export const metadata: Metadata = {
  title: 'Free Live Wallpapers — Animated Wallpapers for iPhone & Android',
  description: 'Download free live wallpapers and animated wallpapers for iPhone and Android. High quality MP4 video wallpapers.',
  alternates: { canonical: 'https://bestfreewallpapers.com/live-wallpapers' },
}

export const revalidate = 600

export default async function LiveWallpapersPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpapers')
    .select('id, title, slug, thumbnail_url, video_url, downloads_count, is_premium, category, duration_seconds')
    .eq('is_active', true)
    .eq('is_published', true)
    .order('downloads_count', { ascending: false })
    .limit(24)

  const wallpapers = (data || []) as LiveWallpaper[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Free Live Wallpapers</h1>
        <p className="text-gray-400">Download animated live wallpapers for iPhone and Android — completely free.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {wallpapers.map((lw) => (
          <Link
            key={lw.id}
            href={`/live-wallpaper/${lw.slug}`}
            className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] block"
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
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="bg-black/70 rounded-full p-3">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-xs font-medium line-clamp-2">{lw.title}</p>
              {lw.duration_seconds && (
                <p className="text-gray-300 text-xs mt-0.5">{lw.duration_seconds}s</p>
              )}
            </div>
            {lw.is_premium && (
              <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
            )}
          </Link>
        ))}
      </div>

      {wallpapers.length === 0 && (
        <div className="text-center py-20 text-gray-500">No live wallpapers found.</div>
      )}
    </div>
  )
}
