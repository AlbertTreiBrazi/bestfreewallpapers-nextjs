import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Category } from '@/types'

export const metadata: Metadata = {
  title: 'Wallpaper Categories — Browse by Theme & Style',
  description: 'Browse wallpapers by category. Nature, abstract, architecture, animals, and more. Find the perfect wallpaper for your phone.',
  alternates: { canonical: 'https://bestfreewallpapers.com/categories' },
}

export const revalidate = 3600

export default async function CategoriesPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, preview_image, preview_thumbnail')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const categories = (data || []) as Category[]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wallpaper Categories</h1>
        <p className="text-gray-400">Browse our collection of wallpapers organized by theme and style.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative rounded-xl overflow-hidden bg-gray-800 aspect-square block"
          >
            {(cat.preview_thumbnail || cat.preview_image) && (
              <Image
                src={cat.preview_thumbnail || cat.preview_image!}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-white font-semibold text-lg">{cat.name}</h2>
              {cat.description && (
                <p className="text-gray-300 text-xs mt-1 line-clamp-2">{cat.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 text-gray-500">No categories found.</div>
      )}
    </div>
  )
}
