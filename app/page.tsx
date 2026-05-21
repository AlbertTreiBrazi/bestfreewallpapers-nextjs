import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import HomeHero from '@/components/home/HomeHero'
import HomeRingtoneCard from '@/components/home/HomeRingtoneCard'
import HomeLiveCard from '@/components/home/HomeLiveCard'
import WallpaperCard from '@/components/wallpapers/WallpaperCard'

export const metadata: Metadata = {
  title: 'Best Free Wallpapers — HD Wallpapers for iPhone & Android',
  description: 'Download free HD wallpapers, live wallpapers and ringtones for iPhone, Android, Samsung. Thousands of high quality images updated daily. No registration required.',
  keywords: ['free wallpapers', 'iphone wallpapers', 'android wallpapers', 'live wallpapers', 'free ringtones', 'HD wallpapers', 'mobile wallpapers'],
  alternates: { canonical: 'https://bestfreewallpapers.com' },
}

export const revalidate = 600

async function getHomepageData() {
  const supabase = createServerSupabaseClient()

  const [wallpapersRes, ringtonesRes, liveRes, categoriesRes, wallCountRes, ringCountRes, liveCountRes] = await Promise.all([
    supabase.from('wallpapers')
      .select('id, title, slug, thumbnail_url, image_url, download_count, is_premium, category')
      .eq('is_active', true)
      .order('download_count', { ascending: false })
      .limit(12),
    supabase.from('ringtones')
      .select('id, title, slug, cover_image_url, audio_url, duration_seconds, downloads_count, is_premium')
      .eq('is_active', true).eq('is_published', true)
      .order('downloads_count', { ascending: false })
      .limit(6),
    supabase.from('live_wallpapers')
      .select('id, title, slug, thumbnail_url, video_url, downloads_count, is_premium, duration_seconds')
      .eq('is_active', true).eq('is_published', true)
      .order('downloads_count', { ascending: false })
      .limit(6),
    supabase.from('categories')
      .select('id, name, slug, cover_image_url')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(8),
    supabase.from('wallpapers').select('id', { count: 'estimated', head: true }).eq('is_active', true),
    supabase.from('ringtones').select('id', { count: 'estimated', head: true }).eq('is_active', true).eq('is_published', true),
    supabase.from('live_wallpapers').select('id', { count: 'estimated', head: true }).eq('is_active', true).eq('is_published', true),
  ])

  return {
    wallpapers: wallpapersRes.data || [],
    ringtones: ringtonesRes.data || [],
    liveWallpapers: liveRes.data || [],
    categories: categoriesRes.data || [],
    stats: {
      wallpapers: wallCountRes.count || 0,
      ringtones: ringCountRes.count || 0,
      live: liveCountRes.count || 0,
    },
  }
}

const DEVICE_COLLECTIONS = [
  { name: 'iPhone Wallpapers', slug: 'iphone', gradient: 'from-blue-600 to-purple-600' },
  { name: 'Android Wallpapers', slug: 'android', gradient: 'from-green-600 to-emerald-600' },
  { name: 'Samsung Galaxy', slug: 'samsung', gradient: 'from-purple-600 to-pink-600' },
  { name: 'iPad Wallpapers', slug: 'ipad', gradient: 'from-cyan-600 to-blue-600' },
]

export default async function HomePage() {
  const { wallpapers, ringtones, liveWallpapers, categories, stats } = await getHomepageData()

  return (
    <>
      {/* Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'BestFreeWallpapers',
          url: 'https://bestfreewallpapers.com',
          description: 'Free HD wallpapers, live wallpapers and ringtones for iPhone and Android',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://bestfreewallpapers.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }),
      }} />

      {/* 1. HERO */}
      <HomeHero stats={stats} />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">

        {/* 2. TRENDING WALLPAPERS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Trending Wallpapers</h2>
              <p className="text-gray-400 text-sm">Most downloaded HD wallpapers this week</p>
            </div>
            <Link href="/wallpapers" className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wallpapers.map((w: any) => (
              <WallpaperCard
                key={w.id}
                id={w.id}
                title={w.title}
                slug={w.slug}
                thumbnail_url={w.thumbnail_url}
                is_premium={w.is_premium}
                download_count={w.download_count}
              />
            ))}
          </div>
        </section>

        {/* 3. RINGTONES */}
        {ringtones.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Free Ringtones</h2>
                <p className="text-gray-400 text-sm">MP3 & M4R ringtones for iPhone and Android · click ▶ to preview</p>
              </div>
              <Link href="/ringtones" className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {ringtones.map((r: any) => <HomeRingtoneCard key={r.id} ringtone={r} />)}
            </div>
          </section>
        )}

        {/* 4. LIVE WALLPAPERS */}
        {liveWallpapers.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Live Wallpapers</h2>
                <p className="text-gray-400 text-sm">Animated wallpapers for iPhone & Android · hover to preview</p>
              </div>
              <Link href="/live-wallpapers" className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {liveWallpapers.map((lw: any) => <HomeLiveCard key={lw.id} lw={lw} />)}
            </div>
          </section>
        )}

        {/* 5. CATEGORIES */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Explore by Category</h2>
                <p className="text-gray-400 text-sm">Browse wallpapers by style and theme</p>
              </div>
              <Link href="/categories" className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap">
                All categories →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-800 hover:scale-[1.02] transition-transform"
                >
                  {cat.cover_image_url ? (
                    <Image src={cat.cover_image_url} alt={cat.name} fill sizes="25vw" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-4">
                    <h3 className="text-white text-lg font-bold">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. DEVICE COLLECTIONS */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Wallpapers for Your Device</h2>
            <p className="text-gray-400 text-sm">Optimized wallpapers for every phone and tablet</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DEVICE_COLLECTIONS.map((col) => (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}-wallpapers`}
                className={`group relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${col.gradient} hover:scale-[1.02] transition-transform`}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                  <div>
                    <p className="text-white text-base md:text-lg font-bold">{col.name}</p>
                    <p className="text-white/80 text-xs mt-1">Browse collection →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. SEO TEXT BLOCK */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">About BestFreeWallpapers</h2>
          <div className="text-gray-400 text-sm leading-relaxed space-y-3">
            <p>
              <strong className="text-gray-200">BestFreeWallpapers</strong> is your destination for downloading high-quality free wallpapers, live animated wallpapers, and ringtones for iPhone, Android, Samsung Galaxy, and iPad devices. Our collection features {stats.wallpapers}+ HD mobile wallpapers across categories like aesthetic, dark, nature, anime, space, abstract, and minimal designs.
            </p>
            <p>
              Whether you&apos;re looking for <Link href="/category/aesthetic" className="text-green-400 hover:underline">aesthetic wallpapers</Link>, <Link href="/category/dark" className="text-green-400 hover:underline">dark themes</Link>, or stunning <Link href="/live-wallpapers" className="text-green-400 hover:underline">live wallpapers</Link>, we&apos;ve got you covered. All our content is 100% free to download — no registration required, no watermarks, no hidden costs. Premium wallpapers offer ad-free downloads and exclusive 4K resolution.
            </p>
            <p>
              In addition to wallpapers, we offer free <Link href="/ringtones" className="text-green-400 hover:underline">MP3 and M4R ringtones</Link> for your smartphone — perfect for personalizing your iPhone calls, Android notifications, and alarm sounds. New wallpapers and ringtones added weekly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.wallpapers}+</div>
              <div className="text-gray-500 text-xs mt-1">Wallpapers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.ringtones}+</div>
              <div className="text-gray-500 text-xs mt-1">Ringtones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.live}+</div>
              <div className="text-gray-500 text-xs mt-1">Live Wallpapers</div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
