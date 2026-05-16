import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Category, Wallpaper } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data as Category | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategory(slug)
  if (!cat) return { title: 'Category not found' }

  const title = cat.seo_title || `${cat.name} Wallpapers — Free HD Download`
  const description = cat.seo_description || cat.description ||
    `Download free ${cat.name} wallpapers in HD quality. Perfect for iPhone and Android.`

  return {
    title,
    description,
    keywords: cat.meta_keywords?.join(', '),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${slug}`,
      images: cat.preview_image ? [{ url: cat.preview_image, alt: cat.name }] : [],
    },
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
  }
}

export const revalidate = 3600

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const cat = await getCategory(slug)
  if (!cat) notFound()

  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('wallpapers')
    .select('id, title, slug, thumbnail_url, download_count, is_premium')
    .eq('is_active', true)
    .eq('category_id', cat.id)
    .order('download_count', { ascending: false })
    .limit(48)

  const wallpapers = (data || []) as Wallpaper[]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} Wallpapers`,
    description: cat.description || '',
    url: `${SITE_URL}/category/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-white">Categories</Link>
          <span>/</span>
          <span className="text-gray-300">{cat.name}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{cat.name} Wallpapers</h1>
          {cat.description && <p className="text-gray-400">{cat.description}</p>}
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
            </Link>
          ))}
        </div>

        {wallpapers.length === 0 && (
          <div className="text-center py-20 text-gray-500">No wallpapers in this category yet.</div>
        )}
      </div>
    </>
  )
}
