'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import WallpaperCard from '@/components/wallpapers/WallpaperCard'

type SortOption = 'popular' | 'newest' | 'oldest'
type FilterOption = 'all' | 'free' | 'premium'

interface Wallpaper {
  id: number; title: string; slug: string
  thumbnail_url: string | null; is_premium: boolean
  download_count: number; created_at: string
}

const LIMIT = 48

export default function WallpapersPage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<SortOption>('popular')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchWallpapers = useCallback(async (reset = true) => {
    const isReset = reset
    if (isReset) setLoading(true)
    else setLoadingMore(true)

    const from = isReset ? 0 : page * LIMIT
    const to = from + LIMIT - 1

    let query = supabase
      .from('wallpapers')
      .select('id, title, slug, thumbnail_url, is_premium, download_count, created_at')
      .eq('is_active', true)
      .range(from, to)

    if (filter === 'free') query = query.eq('is_premium', false)
    if (filter === 'premium') query = query.eq('is_premium', true)
    if (debouncedSearch) query = query.ilike('title', `%${debouncedSearch}%`)

    if (sort === 'popular') query = query.order('download_count', { ascending: false })
    else if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else query = query.order('created_at', { ascending: true })

    const { data } = await query
    const items = (data || []) as Wallpaper[]

    if (isReset) {
      setWallpapers(items)
      setPage(1)
    } else {
      setWallpapers(prev => [...prev, ...items])
      setPage(p => p + 1)
    }

    setHasMore(items.length === LIMIT)
    setLoading(false)
    setLoadingMore(false)
  }, [sort, filter, debouncedSearch, page])

  // Reset and fetch when filters change
  useEffect(() => {
    fetchWallpapers(true)
  }, [sort, filter, debouncedSearch]) // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Free HD Wallpapers</h1>
        <p className="text-gray-400 text-sm">Download high quality wallpapers for iPhone, Android and desktop — completely free.</p>
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wallpapers..."
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-600"
          />
        </div>

        {/* Type filter */}
        <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
          {(['all', 'free', 'premium'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {f === 'all' ? 'All' : f === 'free' ? '🆓 Free' : '⭐ Premium'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-600"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-lg bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No wallpapers found</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{wallpapers.length} wallpapers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wallpapers.map((w) => (
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

          {/* Load more */}
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => fetchWallpapers(false)}
                disabled={loadingMore}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Wallpapers'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
