import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Ringtone, RingtoneCategory } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string): Promise<RingtoneCategory> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('ringtone_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (data) return data as RingtoneCategory
  // slug may be kebab-case ("sunny-beach") — convert to display name
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { id: 0, name, slug, description: null, preview_image: null, is_active: true, sort_order: 0, seo_title: null, seo_description: null }
}

async function getRingtones(categorySlug: string): Promise<Ringtone[]> {
  const supabase = createServerSupabaseClient()
  // slug is kebab-case ("sunny-beach"); DB tags use spaces ("sunny beach")
  const tag = categorySlug.replace(/-/g, ' ')
  const { data } = await supabase
    .from('ringtones')
    .select('id, title, slug, cover_image_url, duration_seconds, downloads_count, is_premium, audio_url, tags')
    .eq('is_active', true)
    .eq('is_published', true)
    .contains('tags', [tag])
    .order('downloads_count', { ascending: false })
    .limit(40)

  return (data || []) as Ringtone[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategory(slug)
  const title = cat.seo_title || `${cat.name} Ringtones — Free Download for iPhone & Android`
  const description = cat.seo_description || cat.description ||
    `Download free ${cat.name} ringtones for iPhone and Android. High quality MP3 and M4R ringtones — no registration required.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/ringtones/category/${slug}`,
      images: cat.preview_image ? [{ url: cat.preview_image, alt: cat.name }] : [],
    },
    alternates: { canonical: `${SITE_URL}/ringtones/category/${slug}` },
  }
}

export const revalidate = 3600

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default async function RingtoneCategoryPage({ params }: Props) {
  const { slug } = await params
  const cat = await getCategory(slug)
  const ringtones = await getRingtones(slug)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} Ringtones`,
    description: cat.description || `Free ${cat.name} ringtones`,
    url: `${SITE_URL}/ringtones/category/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Ringtones', item: `${SITE_URL}/ringtones` },
        { '@type': 'ListItem', position: 3, name: cat.name, item: `${SITE_URL}/ringtones/category/${slug}` },
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/ringtones" className="hover:text-white">Ringtones</Link>
          <span>/</span>
          <span className="text-gray-300">{cat.name}</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-10 border border-gray-700">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-green-700/30 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{cat.name} Ringtones</h1>
              <p className="text-gray-400 text-sm mt-1">{ringtones.length} ringtones available</p>
            </div>
          </div>
          {cat.description && <p className="text-gray-300 leading-relaxed">{cat.description}</p>}
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ Free Download</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ MP3 for Android</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ M4R for iPhone</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full">✓ No registration</span>
          </div>
        </div>

        {/* Grid */}
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
                    sizes="20vw"
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
          <div className="text-center py-20 text-gray-500">No ringtones in this category yet.</div>
        )}

        {/* SEO text */}
        <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">About {cat.name} Ringtones</h2>
          <p className="text-gray-400 leading-relaxed">
            Browse our collection of {cat.name.toLowerCase()} ringtones, all available for free download.
            Compatible with iPhone (M4R format) and Android (MP3 format). No registration required —
            simply click on any ringtone to preview and download it directly to your device.
          </p>
          <div className="mt-4 flex gap-4">
            <Link href="/ringtones/how-to-set" className="text-green-400 hover:text-green-300 text-sm">
              How to set a ringtone →
            </Link>
            <Link href="/ringtones" className="text-gray-400 hover:text-white text-sm">
              All ringtones →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
