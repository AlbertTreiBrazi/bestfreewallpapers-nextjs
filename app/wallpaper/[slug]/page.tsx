import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Wallpaper } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getWallpaper(slug: string): Promise<Wallpaper | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Wallpaper | null
}

async function getRelated(categoryId: number | null, currentId: number): Promise<Wallpaper[]> {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('wallpapers')
    .select('id, title, slug, thumbnail_url, is_premium')
    .eq('is_active', true)
    .neq('id', currentId)
    .limit(6)
  if (categoryId) query = query.eq('category_id', categoryId)
  const { data } = await query
  return (data || []) as Wallpaper[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const wallpaper = await getWallpaper(slug)
  if (!wallpaper) return { title: 'Wallpaper not found' }

  const title = wallpaper.seo_title || `${wallpaper.title} — Free HD Wallpaper Download`
  const description =
    wallpaper.seo_description ||
    wallpaper.description ||
    `Download ${wallpaper.title} wallpaper for free. High quality HD wallpaper for iPhone and Android.`
  const imageUrl = wallpaper.thumbnail_url || wallpaper.image_url

  return {
    title,
    description,
    keywords: wallpaper.tags?.join(', '),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/wallpaper/${slug}`,
      images: imageUrl ? [{ url: imageUrl, width: wallpaper.width, height: wallpaper.height, alt: wallpaper.title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/wallpaper/${slug}`,
    },
  }
}

// ISR — revalidate every 1 hour
export const revalidate = 3600

export default async function WallpaperDetailPage({ params }: Props) {
  const { slug } = await params
  const wallpaper = await getWallpaper(slug)
  if (!wallpaper) notFound()

  const related = await getRelated(wallpaper.category_id, wallpaper.id)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: wallpaper.title,
    description: wallpaper.description || '',
    contentUrl: wallpaper.image_url,
    thumbnailUrl: wallpaper.thumbnail_url || wallpaper.image_url,
    url: `${SITE_URL}/wallpaper/${slug}`,
    width: wallpaper.width,
    height: wallpaper.height,
    encodingFormat: 'image/jpeg',
    license: `${SITE_URL}/license`,
    acquireLicensePage: `${SITE_URL}/license`,
    creditText: 'BestFreeWallpapers.com',
    copyrightNotice: '© BestFreeWallpapers.com — Free for personal use',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/wallpapers" className="hover:text-white">Wallpapers</Link>
          {wallpaper.category && (
            <>
              <span>/</span>
              <span className="text-gray-300">{wallpaper.category}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-300 truncate max-w-xs">{wallpaper.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-[9/16] max-h-[70vh] w-full mx-auto rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
            <Image
              src={wallpaper.image_url}
              alt={wallpaper.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {wallpaper.title}
              </h1>
              {wallpaper.description && (
                <p className="text-gray-400 mb-6 leading-relaxed">{wallpaper.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                {wallpaper.width && wallpaper.height && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Resolution</p>
                    <p className="text-white font-medium">{wallpaper.width} × {wallpaper.height}</p>
                  </div>
                )}
                {wallpaper.category && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Category</p>
                    <p className="text-white font-medium">{wallpaper.category}</p>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Downloads</p>
                  <p className="text-white font-medium">{wallpaper.download_count.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Type</p>
                  <p className="text-white font-medium">{wallpaper.device_type || 'All devices'}</p>
                </div>
              </div>

              {wallpaper.tags && wallpaper.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {wallpaper.tags.slice(0, 8).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="space-y-3">
              <a
                href={wallpaper.download_url}
                download
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl text-center block transition-colors text-lg"
              >
                ↓ Download Free
              </a>
              {wallpaper.is_premium && (
                <p className="text-center text-sm text-yellow-400">
                  ⭐ Premium quality — free for personal use
                </p>
              )}
              <p className="text-center text-xs text-gray-500">
                Free for personal use • No registration required
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-white mb-6">Related Wallpapers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {related.map((w) => (
                <Link
                  key={w.id}
                  href={`/wallpaper/${w.slug}`}
                  className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-800 block"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
