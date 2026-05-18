import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Wallpaper } from '@/types'

export const metadata: Metadata = {
  title: 'Mobile Wallpapers — Free HD Phone Backgrounds for iPhone & Android',
  description: 'Download free mobile wallpapers optimized for iPhone and Android screens. HD phone backgrounds in perfect portrait orientation — 9:16 aspect ratio. Free download.',
  keywords: ['mobile wallpapers', 'phone wallpapers', 'phone backgrounds', 'smartphone wallpapers', 'portrait wallpapers', 'vertical wallpapers'],
  alternates: { canonical: `${SITE_URL}/mobile-wallpapers` },
  openGraph: {
    title: 'Mobile Wallpapers — Free HD Phone Backgrounds',
    description: 'Download free mobile wallpapers optimized for iPhone and Android.',
    url: `${SITE_URL}/mobile-wallpapers`,
  },
}

export const revalidate = 600

const deviceLinks = [
  { href: '/collections/iphone-wallpapers', label: 'iPhone Wallpapers', icon: '📱' },
  { href: '/collections/android-wallpapers', label: 'Android Wallpapers', icon: '🤖' },
  { href: '/collections/samsung-galaxy-wallpapers', label: 'Samsung Galaxy', icon: '📲' },
  { href: '/collections/ipad-wallpapers', label: 'iPad Wallpapers', icon: '💻' },
]

export default async function MobileWallpapersPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('id, title, slug, thumbnail_url, download_count, is_premium, device_type, aspect_ratio')
    .eq('is_active', true)
    .order('download_count', { ascending: false })
    .limit(48)

  const wallpapers = (data || []) as Wallpaper[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-gray-300">Mobile Wallpapers</span>
      </nav>

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Mobile Wallpapers</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Free HD phone backgrounds optimized for iPhone and Android screens.
          Portrait orientation, perfect 9:16 aspect ratio for all smartphones.
        </p>
      </div>

      {/* Device quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {deviceLinks.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-colors"
          >
            <span className="text-2xl">{d.icon}</span>
            <span className="text-white text-sm font-medium">{d.label}</span>
          </Link>
        ))}
      </div>

      {/* Wallpapers */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Popular Mobile Wallpapers</h2>
        <Link href="/wallpapers" className="text-sm text-green-400 hover:text-green-300">View all →</Link>
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
                sizes="(max-width: 640px) 50vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {w.title}
            </p>
            {w.is_premium && (
              <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
            )}
          </Link>
        ))}
      </div>

      {/* SEO text */}
      <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">About Our Mobile Wallpaper Collection</h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-400 text-sm leading-relaxed">
          <p>All our mobile wallpapers are crafted specifically for smartphone screens in portrait orientation. The 9:16 aspect ratio ensures your wallpaper fills the screen perfectly on any phone model.</p>
          <p>From nature landscapes and abstract designs to anime art and minimalist patterns — browse thousands of mobile backgrounds all optimized for modern smartphone displays including AMOLED and OLED screens.</p>
        </div>
      </div>
    </div>
  )
}
