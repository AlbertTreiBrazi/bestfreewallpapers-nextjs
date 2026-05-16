import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { LiveWallpaper } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getLiveWallpaper(slug: string): Promise<LiveWallpaper | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpapers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .single()
  return data as LiveWallpaper | null
}

async function getRelated(currentId: number): Promise<LiveWallpaper[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('live_wallpapers')
    .select('id, title, slug, thumbnail_url, is_premium')
    .eq('is_active', true)
    .eq('is_published', true)
    .neq('id', currentId)
    .limit(6)
  return (data || []) as LiveWallpaper[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lw = await getLiveWallpaper(slug)
  if (!lw) return { title: 'Live Wallpaper not found' }

  const title = `${lw.title} — Free Live Wallpaper Download`
  const description =
    lw.description ||
    `Download ${lw.title} live wallpaper for free. Animated live wallpaper for iPhone and Android.`

  return {
    title,
    description,
    keywords: lw.tags?.join(', '),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/live-wallpaper/${slug}`,
      images: lw.thumbnail_url
        ? [{ url: lw.thumbnail_url, width: 1080, height: 1920, alt: lw.title }]
        : [],
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: lw.thumbnail_url ? [lw.thumbnail_url] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/live-wallpaper/${slug}`,
    },
  }
}

export const revalidate = 3600

export default async function LiveWallpaperDetailPage({ params }: Props) {
  const { slug } = await params
  const lw = await getLiveWallpaper(slug)
  if (!lw) notFound()

  const related = await getRelated(lw.id)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: lw.title,
    description: lw.description || lw.title,
    thumbnailUrl: lw.thumbnail_url || undefined,
    contentUrl: lw.video_url,
    embedUrl: `${SITE_URL}/live-wallpaper/${slug}`,
    uploadDate: lw.created_at,
    duration: lw.duration_seconds ? `PT${lw.duration_seconds}S` : undefined,
    url: `${SITE_URL}/live-wallpaper/${slug}`,
    keywords: lw.tags?.join(', '),
    license: `${SITE_URL}/license`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/live-wallpapers" className="hover:text-white">Live Wallpapers</Link>
          <span>/</span>
          <span className="text-gray-300 truncate">{lw.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Video preview */}
          <div className="relative aspect-[9/16] max-h-[70vh] w-full mx-auto rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
            <video
              src={lw.video_url}
              poster={lw.thumbnail_url || undefined}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Fallback thumbnail while video loads */}
            {lw.thumbnail_url && (
              <Image
                src={lw.thumbnail_url}
                alt={lw.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover -z-10"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{lw.title}</h1>
              {lw.description && (
                <p className="text-gray-400 mb-6 leading-relaxed">{lw.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                {lw.duration_seconds && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Duration</p>
                    <p className="text-white font-medium">{lw.duration_seconds}s</p>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Downloads</p>
                  <p className="text-white font-medium">{lw.downloads_count.toLocaleString()}</p>
                </div>
                {lw.category && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Category</p>
                    <p className="text-white font-medium">{lw.category}</p>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Format</p>
                  <p className="text-white font-medium">MP4 Video</p>
                </div>
              </div>

              {lw.tags && lw.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {lw.tags.slice(0, 8).map((tag) => (
                    <span key={tag} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Download */}
            <div className="space-y-3">
              <a
                href={lw.video_url}
                download={`${lw.slug}.mp4`}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl text-center block transition-colors text-lg"
              >
                ↓ Download Live Wallpaper
              </a>
              <p className="text-center text-xs text-gray-500">
                Free for personal use • No registration required
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-white mb-6">More Live Wallpapers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {related.map((w) => (
                <Link
                  key={w.id}
                  href={`/live-wallpaper/${w.slug}`}
                  className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-800 block"
                >
                  {w.thumbnail_url && (
                    <Image
                      src={w.thumbnail_url}
                      alt={w.title}
                      fill
                      sizes="16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="bg-black/60 rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {w.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
