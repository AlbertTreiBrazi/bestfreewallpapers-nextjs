import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Wallpaper, Ringtone, LiveWallpaper } from '@/types'

export const metadata: Metadata = {
  title: 'Best Free Wallpapers — HD Wallpapers, Live Wallpapers & Ringtones',
  description:
    'Download free HD wallpapers, live wallpapers and ringtones for iPhone and Android. Thousands of high quality images updated daily.',
}

// Revalidate every 10 minutes
export const revalidate = 600

async function getHomepageData() {
  const supabase = createServerSupabaseClient()

  const [wallpapersRes, ringtonesRes, liveRes] = await Promise.all([
    supabase
      .from('wallpapers')
      .select('id, title, slug, thumbnail_url, image_url, download_count, is_premium, category')
      .eq('is_active', true)
      .order('download_count', { ascending: false })
      .limit(12),
    supabase
      .from('ringtones')
      .select('id, title, slug, cover_image_url, duration_seconds, downloads_count, is_premium')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('downloads_count', { ascending: false })
      .limit(10),
    supabase
      .from('live_wallpapers')
      .select('id, title, slug, thumbnail_url, video_url, downloads_count, is_premium')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('downloads_count', { ascending: false })
      .limit(6),
  ])

  return {
    wallpapers: (wallpapersRes.data || []) as Wallpaper[],
    ringtones: (ringtonesRes.data || []) as Ringtone[],
    liveWallpapers: (liveRes.data || []) as LiveWallpaper[],
  }
}

export default async function HomePage() {
  const { wallpapers, ringtones, liveWallpapers } = await getHomepageData()

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Free HD Wallpapers
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Download high quality wallpapers, live wallpapers and ringtones for
          iPhone and Android — completely free.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/wallpapers"
            className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Wallpapers
          </Link>
          <Link
            href="/ringtones"
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Ringtones
          </Link>
          <Link
            href="/live-wallpapers"
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Live Wallpapers
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">

        {/* Popular Wallpapers */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Popular Wallpapers</h2>
            <Link href="/wallpapers" className="text-sm text-green-400 hover:text-green-300">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wallpapers.map((w) => (
              <Link
                key={w.id}
                href={`/wallpaper/${w.slug}`}
                className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] block"
              >
                {w.thumbnail_url && (
                  <Image
                    src={w.thumbnail_url}
                    alt={w.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-medium line-clamp-2">{w.title}</p>
                </div>
                {w.is_premium && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">
                    PRO
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Live Wallpapers */}
        {liveWallpapers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Live Wallpapers</h2>
              <Link href="/live-wallpapers" className="text-sm text-green-400 hover:text-green-300">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {liveWallpapers.map((lw) => (
                <Link
                  key={lw.id}
                  href={`/live-wallpaper/${lw.slug}`}
                  className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] block"
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
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
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

        {/* Ringtones */}
        {ringtones.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Popular Ringtones</h2>
              <Link href="/ringtones" className="text-sm text-green-400 hover:text-green-300">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ringtones.map((r) => (
                <Link
                  key={r.id}
                  href={`/ringtone/${r.slug}`}
                  className="group bg-gray-800 hover:bg-gray-750 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors border border-gray-700 hover:border-gray-600"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-700">
                    {r.cover_image_url ? (
                      <Image
                        src={r.cover_image_url}
                        alt={r.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium text-center line-clamp-2">{r.title}</p>
                  {r.duration_seconds && (
                    <span className="text-gray-400 text-xs">
                      {Math.floor(r.duration_seconds / 60)}:{String(r.duration_seconds % 60).padStart(2, '0')}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'BestFreeWallpapers',
            url: 'https://bestfreewallpapers.com',
            description: 'Free HD wallpapers, live wallpapers and ringtones',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://bestfreewallpapers.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </>
  )
}
