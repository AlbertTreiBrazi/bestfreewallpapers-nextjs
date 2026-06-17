import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Wallpaper } from '@/types'

export const metadata: Metadata = {
  title: 'Free Wallpapers — Download HD Backgrounds for Free',
  description: 'Download thousands of free wallpapers in HD and 4K quality. Free backgrounds for iPhone, Android, and desktop. No sign up required. Updated daily.',
  keywords: ['free wallpapers', 'free backgrounds', 'free HD wallpapers', 'free 4K wallpapers', 'download wallpapers free'],
  alternates: { canonical: `${SITE_URL}/free-wallpapers` },
  openGraph: {
    title: 'Free Wallpapers — Download HD Backgrounds for Free',
    description: 'Download thousands of free wallpapers in HD and 4K quality. No sign up required.',
    url: `${SITE_URL}/free-wallpapers`,
  },
}

export const revalidate = 600

const features = [
  { icon: '🆓', title: '100% Free', description: 'Every wallpaper is completely free to download. No hidden fees or subscriptions.' },
  { icon: '📱', title: 'All Devices', description: 'Optimized for iPhone, Android, iPad, desktop and all screen sizes.' },
  { icon: '🖼', title: 'HD & 4K Quality', description: 'High resolution wallpapers from 1080p up to 4K and 8K quality.' },
  { icon: '✅', title: 'No Registration', description: 'Download instantly without creating an account or providing an email.' },
  { icon: '🔄', title: 'Daily Updates', description: 'New wallpapers added every day to keep your screen fresh and unique.' },
  { icon: '🎨', title: '100K+ Wallpapers', description: 'Massive collection covering nature, abstract, space, anime and more.' },
]

export default async function FreeWallpapersPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('id, title, slug, thumbnail_url, download_count, is_premium, category')
    .eq('is_active', true)
    .eq('is_premium', false)
    .order('download_count', { ascending: false })
    .limit(48)

  const wallpapers = (data || []) as Wallpaper[]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free Wallpapers',
    description: 'Download thousands of free wallpapers in HD and 4K quality',
    url: `${SITE_URL}/free-wallpapers`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Free Wallpapers', item: `${SITE_URL}/free-wallpapers` },
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-green-900/30 to-gray-950 py-16 px-4 text-center border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-green-700/30 text-green-400 text-sm px-4 py-1.5 rounded-full mb-4 border border-green-700/50">
            100% Free — No Registration
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Free Wallpapers</h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Download high quality free wallpapers for your phone and desktop. HD and 4K backgrounds
            available — completely free, no sign up required.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/wallpapers" className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Browse All Wallpapers
            </Link>
            <Link href="/categories" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Browse by Category
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-14">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="text-white font-medium text-sm mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Wallpapers grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Most Downloaded Free Wallpapers</h2>
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
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {w.title}
              </p>
            </Link>
          ))}
        </div>

        {/* SEO content */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Why Choose Our Free Wallpapers?</h2>
            <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
              <p>Our collection features thousands of carefully curated wallpapers that are completely free to download. Unlike other sites, we don&apos;t hide wallpapers behind paywalls or require registration.</p>
              <p>All wallpapers are available in high resolution — perfect for modern smartphone displays including iPhone 15 Pro Max, Samsung Galaxy S24 Ultra, and desktop monitors.</p>
              <p>Categories include nature, abstract art, space, animals, architecture, anime, and much more — with new wallpapers added every day.</p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">How to Download</h2>
            <div className="space-y-4">
              {['Find a wallpaper you love from our collection', 'Click on it to open the full detail page', 'Click the Download button — no account needed', 'Set it as your wallpaper directly from your phone'].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-gray-400 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
