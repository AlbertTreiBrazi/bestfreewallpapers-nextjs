import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Ringtone } from '@/types'

export const metadata: Metadata = {
  title: 'Free Ringtones — Download MP3 & M4R for iPhone & Android',
  description: 'Download free ringtones for iPhone and Android. MP3 and M4R formats available. No registration required.',
  alternates: { canonical: 'https://bestfreewallpapers.com/ringtones' },
}

export const revalidate = 600

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default async function RingtonesPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('ringtones')
    .select('id, title, slug, cover_image_url, duration_seconds, downloads_count, is_premium, tags')
    .eq('is_active', true)
    .eq('is_published', true)
    .order('downloads_count', { ascending: false })
    .limit(50)

  const ringtones = (data || []) as Ringtone[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Free Ringtones</h1>
        <p className="text-gray-400">Download free ringtones for iPhone (M4R) and Android (MP3). No registration required.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ringtones.map((r) => (
          <Link
            key={r.id}
            href={`/ringtone/${r.slug}`}
            className="group bg-gray-800 hover:bg-gray-750 rounded-xl p-3 flex flex-col gap-3 transition-colors border border-gray-700 hover:border-gray-600"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-700">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="bg-green-600 rounded-full p-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-medium line-clamp-2 mb-1">{r.title}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                {r.duration_seconds && <span>⏱ {formatDuration(r.duration_seconds)}</span>}
                <span>⬇ {r.downloads_count}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {ringtones.length === 0 && (
        <div className="text-center py-20 text-gray-500">No ringtones found.</div>
      )}
    </div>
  )
}
