import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Wallpaper Collections — Curated Sets for Every Device',
  description: 'Browse curated wallpaper collections for iPhone, Android, Samsung, iPad and desktop. Each collection features matching wallpapers designed for specific devices and styles.',
  alternates: { canonical: `${SITE_URL}/collections` },
  openGraph: {
    title: 'Wallpaper Collections — Curated Sets for Every Device',
    description: 'Browse curated wallpaper collections for iPhone, Android, Samsung, iPad and desktop.',
    url: `${SITE_URL}/collections`,
  },
}

export const revalidate = 3600

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_image_url: string | null
  is_featured: boolean
  is_seasonal: boolean
  wallpaper_count: number
  view_count: number
  sort_order: number
  color_theme: { primary: string; secondary: string } | null
}

// Device collections hardcoded (exist ca rute fixe în proiectul vechi)
const deviceCollections = [
  {
    slug: 'iphone-wallpapers',
    name: 'iPhone Wallpapers',
    description: 'Optimized for iPhone 15, 14, 13, 12 and all models',
    icon: '📱',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    slug: 'android-wallpapers',
    name: 'Android Wallpapers',
    description: 'Perfect for Samsung, Pixel, OnePlus and all Android devices',
    icon: '🤖',
    color: 'from-green-600 to-emerald-700',
  },
  {
    slug: 'samsung-galaxy-wallpapers',
    name: 'Samsung Galaxy',
    description: 'Designed for Galaxy S24, S23, S22, Note and A series',
    icon: '📲',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    slug: 'ipad-wallpapers',
    name: 'iPad Wallpapers',
    description: 'High resolution wallpapers for all iPad models',
    icon: '💻',
    color: 'from-purple-600 to-violet-700',
  },
]

export default async function CollectionsPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('collections')
    .select('id, name, slug, description, cover_image_url, is_featured, is_seasonal, wallpaper_count, view_count, sort_order, color_theme')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(50)

  const collections = (data || []) as Collection[]
  const featured = collections.filter((c) => c.is_featured)
  const regular = collections.filter((c) => !c.is_featured)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Wallpaper Collections',
    description: 'Curated wallpaper collections for every device',
    url: `${SITE_URL}/collections`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-gray-300">Collections</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Wallpaper Collections</h1>
          <p className="text-gray-400">Curated sets of wallpapers organized by device, theme and style.</p>
        </div>

        {/* Device Collections */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-5">By Device</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deviceCollections.map((dc) => (
              <Link
                key={dc.slug}
                href={`/collections/${dc.slug}`}
                className={`group relative rounded-2xl bg-gradient-to-br ${dc.color} p-6 flex flex-col gap-2 hover:scale-[1.02] transition-transform`}
              >
                <span className="text-3xl">{dc.icon}</span>
                <h3 className="text-white font-semibold">{dc.name}</h3>
                <p className="text-white/70 text-xs leading-relaxed">{dc.description}</p>
                <span className="mt-auto text-white/80 text-xs font-medium group-hover:text-white transition-colors">
                  Browse →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Collections */}
        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-5">Featured Collections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-gray-800 aspect-video block"
                >
                  {col.cover_image_url ? (
                    <Image
                      src={col.cover_image_url}
                      alt={col.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: col.color_theme
                          ? `linear-gradient(135deg, ${col.color_theme.primary}, ${col.color_theme.secondary})`
                          : 'linear-gradient(135deg, #1f2937, #374151)',
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-medium">Featured</span>
                      {col.is_seasonal && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">Seasonal</span>}
                    </div>
                    <h3 className="text-white font-semibold text-lg">{col.name}</h3>
                    {col.description && <p className="text-gray-300 text-xs mt-1 line-clamp-2">{col.description}</p>}
                    <p className="text-gray-400 text-xs mt-2">{col.wallpaper_count} wallpapers</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Collections */}
        {regular.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-white mb-5">All Collections</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {regular.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-gray-800 aspect-square block"
                >
                  {col.cover_image_url ? (
                    <Image
                      src={col.cover_image_url}
                      alt={col.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: col.color_theme
                          ? `linear-gradient(135deg, ${col.color_theme.primary}, ${col.color_theme.secondary})`
                          : 'linear-gradient(135deg, #1f2937, #374151)',
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-medium text-sm line-clamp-2">{col.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{col.wallpaper_count} wallpapers</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {collections.length === 0 && (
          <div className="text-center py-20 text-gray-500">No collections found.</div>
        )}
      </div>
    </>
  )
}
