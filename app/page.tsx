import { Metadata } from 'next'
import Link from 'next/link'
import { CfImage } from '@/components/ui/CfImage'
import { createServerSupabaseClient } from '@/lib/supabase'
import HomeHero from '@/components/home/HomeHero'
import HomeRingtoneCard from '@/components/home/HomeRingtoneCard'
import HomeTrendingSection from '@/components/home/HomeTrendingSection'
import HomeLiveSection from '@/components/home/HomeLiveSection'
import RecentlyViewedStrip from '@/components/home/RecentlyViewedStrip'

export const metadata: Metadata = {
  title: 'Free HD Wallpapers Download — iPhone, Android, Live Wallpapers & Ringtones',
  description: 'Download free 4K & HD wallpapers for iPhone lock screen, Android, Samsung. Aesthetic, dark, anime & nature designs. Plus live wallpapers & free ringtones. No sign-up.',
  keywords: [
    'free wallpapers download',
    'HD wallpapers',
    '4K wallpapers',
    'iPhone wallpapers',
    'iPhone lock screen wallpapers',
    'aesthetic wallpapers',
    'Android wallpapers',
    'Samsung Galaxy wallpapers',
    'live wallpapers',
    'live wallpaper iPhone',
    'free ringtones',
    'cute wallpapers',
    'anime wallpapers',
    'dark wallpapers',
  ],
  alternates: { canonical: 'https://bestfreewallpapers.com' },
}

export const revalidate = 600

async function getHomepageData() {
  const supabase = createServerSupabaseClient()

  const wallSelect = 'id, title, slug, thumbnail_url, download_count, is_premium, created_at'
  const liveSelect = 'id, title, slug, thumbnail_url, video_url, downloads_count, is_premium, duration_seconds, created_at'

  const [
    wallTrendingRes, wallNewestRes,
    liveTrendingRes, liveNewestRes,
    ringtonesRes,
    categoriesRes,
    wallCountRes, ringCountRes, liveCountRes,
  ] = await Promise.all([
    // Wallpapers: trending
    supabase.from('wallpapers').select(wallSelect)
      .eq('is_active', true).order('download_count', { ascending: false }).limit(8),
    // Wallpapers: newest
    supabase.from('wallpapers').select(wallSelect)
      .eq('is_active', true).order('created_at', { ascending: false }).limit(8),
    // Live: trending
    supabase.from('live_wallpapers').select(liveSelect)
      .eq('is_active', true).eq('is_published', true)
      .order('downloads_count', { ascending: false }).limit(6),
    // Live: newest
    supabase.from('live_wallpapers').select(liveSelect)
      .eq('is_active', true).eq('is_published', true)
      .order('created_at', { ascending: false }).limit(6),
    // Ringtones: trending only
    supabase.from('ringtones')
      .select('id, title, slug, cover_image_url, audio_url, duration_seconds, downloads_count, is_premium, created_at')
      .eq('is_active', true).eq('is_published', true)
      .order('downloads_count', { ascending: false }).limit(6),
    // Categories
    supabase.from('categories').select('id, name, slug, preview_image, preview_thumbnail')
      .eq('is_active', true).order('sort_order', { ascending: true }).limit(8),
    // Counts
    supabase.from('wallpapers').select('id', { count: 'estimated', head: true }).eq('is_active', true),
    supabase.from('ringtones').select('id', { count: 'estimated', head: true }).eq('is_active', true).eq('is_published', true),
    supabase.from('live_wallpapers').select('id', { count: 'estimated', head: true }).eq('is_active', true).eq('is_published', true),
  ])

  return {
    wallTrending:  wallTrendingRes.data || [],
    wallNewest:    wallNewestRes.data || [],
    liveTrending:  liveTrendingRes.data || [],
    liveNewest:    liveNewestRes.data || [],
    ringtones:     ringtonesRes.data || [],
    categories:    categoriesRes.data || [],
    stats: {
      wallpapers: wallCountRes.count || 0,
      ringtones:  ringCountRes.count || 0,
      live:       liveCountRes.count || 0,
    },
  }
}

export default async function HomePage() {
  const { wallTrending, wallNewest, liveTrending, liveNewest, ringtones, categories, stats } = await getHomepageData()

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

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">

        {/* 2. RECENTLY VIEWED — client-side, localStorage */}
        <RecentlyViewedStrip />

        {/* 3. TRENDING / NEW WALLPAPERS */}
        <HomeTrendingSection trending={wallTrending} newest={wallNewest} />

        {/* 4. LIVE WALLPAPERS */}
        <HomeLiveSection trending={liveTrending} newest={liveNewest} />

        {/* 5. RINGTONES */}
        {ringtones.length > 0 && (
          <section id="ringtones">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Free Ringtones</h2>
                <p className="text-gray-400 text-sm">MP3 &amp; M4R ringtones for iPhone and Android · click ▶ to preview</p>
              </div>
              <Link href="/ringtones" className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ringtones.map((r: any) => <HomeRingtoneCard key={r.id} ringtone={r} />)}
            </div>
          </section>
        )}

        {/* 6. CATEGORIES */}
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
                  {(cat.preview_thumbnail || cat.preview_image) ? (
                    <CfImage src={cat.preview_thumbnail || cat.preview_image} alt={cat.name} fill sizes="25vw" className="object-cover" />
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

        {/* 7. SEO TEXT BLOCK */}
        <section className="border-t border-gray-800 pt-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">About BestFreeWallpapers</h2>
          <div className="text-gray-400 text-sm leading-relaxed space-y-3">
            <p>
              <strong className="text-gray-200">BestFreeWallpapers</strong> is your destination for downloading high-quality free wallpapers, live animated wallpapers, and ringtones for iPhone, Android, Samsung Galaxy, and iPad devices. Our collection features {stats.wallpapers}+ HD mobile wallpapers across categories like aesthetic, dark, nature, anime, space, abstract, and minimal designs.
            </p>
            <p>
              Whether you&apos;re looking for <Link href="/category/aesthetic" className="text-green-400 underline decoration-green-400/60 hover:decoration-green-300">aesthetic wallpapers</Link>, <Link href="/category/dark" className="text-green-400 underline decoration-green-400/60 hover:decoration-green-300">dark themes</Link>, or stunning <Link href="/live-wallpapers" className="text-green-400 underline decoration-green-400/60 hover:decoration-green-300">live wallpapers</Link>, we&apos;ve got you covered. All our content is 100% free to download — no registration required, no watermarks, no hidden costs. Premium wallpapers offer ad-free downloads and exclusive 4K resolution.
            </p>
            <p>
              All wallpapers are available in mobile-optimized resolutions — including <strong className="text-gray-200">iPhone lock screen</strong> (1170×2532 for iPhone 14/15), full HD Android (1080×1920), and <strong className="text-gray-200">4K desktop</strong> backgrounds, ensuring sharp, pixel-perfect results on any screen.
            </p>
            <p>
              In addition to wallpapers, we offer free <Link href="/ringtones" className="text-green-400 underline decoration-green-400/60 hover:decoration-green-300">MP3 and M4R ringtones</Link> for your smartphone — perfect for personalizing your iPhone calls, Android notifications, and alarm sounds. New wallpapers and ringtones added weekly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.wallpapers}+</div>
              <div className="text-gray-400 text-xs mt-1">Wallpapers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.ringtones}+</div>
              <div className="text-gray-400 text-xs mt-1">Ringtones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.live}+</div>
              <div className="text-gray-400 text-xs mt-1">Live Wallpapers</div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
