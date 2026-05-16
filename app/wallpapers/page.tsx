import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Wallpaper } from '@/types'

export const metadata: Metadata = {
  title: 'Free HD Wallpapers — Download for iPhone & Android',
  description: 'Browse thousands of free HD wallpapers. Download high quality wallpapers for iPhone, Android, and desktop. Updated daily.',
  alternates: { canonical: 'https://bestfreewallpapers.com/wallpapers' },
}

export const revalidate = 600

export default async function WallpapersPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('id, title, slug, thumbnail_url, image_url, download_count, is_premium, category')
    .eq('is_active', true)
    .order('download_count', { ascending: false })
    .limit(48)

  const wallpapers = (data || []) as Wallpaper[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Free HD Wallpapers</h1>
        <p className="text-gray-400">Download high quality wallpapers for iPhone, Android and desktop — completely free.</p>
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
              <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
            )}
          </Link>
        ))}
      </div>

      {wallpapers.length === 0 && (
        <div className="text-center py-20 text-gray-500">No wallpapers found.</div>
      )}
    </div>
  )
}
