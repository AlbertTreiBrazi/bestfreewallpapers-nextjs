import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Category } from '@/types'
import CategoriesClient from './CategoriesClient'

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
      <CategoriesClient categories={categories} />
    </div>
  )
}
