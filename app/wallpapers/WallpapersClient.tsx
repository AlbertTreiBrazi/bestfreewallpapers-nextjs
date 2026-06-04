'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import WallpaperCard from '@/components/wallpapers/WallpaperCard'
import WallpaperExplore from '@/components/wallpapers/WallpaperExplore'
import type { Wallpaper as WallpaperFull } from '@/types'
import { COLOR_OPTIONS, type ColorBucket } from '@/lib/color-utils'

type SortOption = 'popular' | 'newest' | 'oldest'
type FilterOption = 'all' | 'free' | 'premium'
type DeviceOption = 'all' | 'iphone' | 'android' | 'ipad' | 'desktop'

interface Wallpaper {
  id: number; title: string; slug: string
  thumbnail_url: string | null; image_url: string; is_premium: boolean
  download_count: number; created_at: string; tags?: string[] | null
  category_id?: number | null
}

const LIMIT = 48

const DEVICES: { value: DeviceOption; label: string; icon: string; dbValue: string | null }[] = [
  { value: 'all',     label: 'All Devices', icon: '🌐', dbValue: null },
  { value: 'iphone',  label: 'iPhone',      icon: '📱', dbValue: 'iphone' },
  { value: 'android', label: 'Android',     icon: '🤖', dbValue: 'android' },
  { value: 'ipad',    label: 'iPad',        icon: '💻', dbValue: 'ipad' },
  { value: 'desktop', label: 'Desktop',     icon: '🖥️', dbValue: 'desktop' },
]

export default function WallpapersClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(0)
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'popular')
  const [filter, setFilter] = useState<FilterOption>((searchParams.get('filter') as FilterOption) || 'all')
  const [device, setDevice] = useState<DeviceOption>((searchParams.get('device') as DeviceOption) || 'all')
  const [color, setColor] = useState<ColorBucket | 'all'>((searchParams.get('color') as ColorBucket) || 'all')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '')
  const [exploreOpen, setExploreOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (sort !== 'popular') params.set('sort', sort)
    if (filter !== 'all') params.set('filter', filter)
    if (device !== 'all') params.set('device', device)
    if (color !== 'all') params.set('color', color)
    if (debouncedSearch) params.set('q', debouncedSearch)
    const qs = params.toString()
    router.replace(qs ? `/wallpapers?${qs}` : '/wallpapers', { scroll: false })
  }, [sort, filter, device, color, debouncedSearch]) // eslint-disable-line

  const fetchWallpapers = useCallback(async (reset = true) => {
    const isReset = reset
    if (isReset) setLoading(true)
    else setLoadingMore(true)

    const from = isReset ? 0 : pageRef.current * LIMIT
    const to = from + LIMIT - 1

    let query = supabase
      .from('wallpapers')
      .select('id, title, slug, thumbnail_url, image_url, is_premium, download_count, created_at, tags, category_id')
      .eq('is_active', true)
      .range(from, to)

    if (filter === 'free') query = query.eq('is_premium', false)
    if (filter === 'premium') query = query.eq('is_premium', true)
    if (debouncedSearch) query = query.ilike('title', `%${debouncedSearch}%`)

    // Device filter
    const dbDevice = DEVICES.find(d => d.value === device)?.dbValue
    if (dbDevice) query = query.eq('device_type', dbDevice)

    // Color filter
    if (color !== 'all') query = query.eq('dominant_color', color)

    if (sort === 'popular') query = query.order('download_count', { ascending: false })
    else if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else query = query.order('created_at', { ascending: true })

    const { data, error } = await query
    if (error) {
      console.error('[WallpapersClient] Supabase error:', error.message, error.details)
      setLoading(false)
      setLoadingMore(false)
      return
    }
    const items = (data || []) as Wallpaper[]

    if (isReset) {
      setWallpapers(items)
      pageRef.current = 1
    } else {
      setWallpapers(prev => [...prev, ...items])
      pageRef.current += 1
    }

    setHasMore(items.length === LIMIT)
    setLoading(false)
    setLoadingMore(false)
  }, [sort, filter, device, color, debouncedSearch])

  // Reset and fetch when filters change
  useEffect(() => {
    pageRef.current = 0
    fetchWallpapers(true)
  }, [sort, filter, device, color, debouncedSearch]) // eslint-disable-line

  const activeDevice = DEVICES.find(d => d.value === device)!
  const activeColor = COLOR_OPTIONS.find(c => c.value === color)
  const hasActiveFilters = device !== 'all' || filter !== 'all' || color !== 'all' || debouncedSearch

  return (
    <>
    {exploreOpen && wallpapers.length > 0 && (
      <WallpaperExplore
        wallpapers={wallpapers as WallpaperFull[]}
        onClose={() => setExploreOpen(false)}
      />
    )}
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {device !== 'all'
              ? `${activeDevice.icon} ${activeDevice.label} Wallpapers`
              : 'Free HD Wallpapers'}
          </h1>
          <p className="text-gray-400 text-sm">
            {device === 'iphone'  && 'High-res wallpapers optimized for iPhone lock screen and home screen.'}
            {device === 'android' && 'HD wallpapers perfect for Samsung, Pixel, OnePlus and all Android phones.'}
            {device === 'ipad'    && 'Ultra-resolution wallpapers for iPad Pro, Air and mini Retina displays.'}
            {device === 'desktop' && '4K and HD desktop wallpapers for Windows and Mac.'}
            {device === 'all'     && 'Download high quality wallpapers for iPhone, Android and desktop — completely free.'}
          </p>
        </div>
        <button
          onClick={() => setExploreOpen(true)}
          disabled={loading || wallpapers.length === 0}
          className="flex-shrink-0 flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Explore
        </button>
      </div>

      {/* Device filter chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {DEVICES.map((d) => (
          <button
            key={d.value}
            onClick={() => setDevice(d.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
              device === d.value
                ? 'bg-green-700 text-white shadow-md shadow-green-900/30'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <span>{d.icon}</span>
            {d.label}
          </button>
        ))}
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500 text-xs whitespace-nowrap">Color:</span>
        {/* "All" swatch */}
        <button
          onClick={() => setColor('all')}
          title="All colors"
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            color === 'all'
              ? 'border-white scale-110'
              : 'border-gray-600 hover:border-gray-400'
          } bg-gradient-to-br from-red-400 via-blue-400 to-green-400`}
        >
          {color === 'all' && (
            <svg className="w-3 h-3 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(color === c.value ? 'all' : c.value)}
            title={c.label}
            className={`w-7 h-7 rounded-full border-2 transition-all flex-shrink-0 ${c.bg} ${
              color === c.value
                ? 'border-white scale-125 shadow-lg'
                : 'border-transparent hover:border-white/50 hover:scale-110'
            }`}
          />
        ))}
        {color !== 'all' && activeColor && (
          <span className="text-gray-400 text-xs ml-1">{activeColor.label}</span>
        )}
      </div>

      {/* Search + Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 flex-wrap">
          <span>Filters:</span>
          {device !== 'all' && (
            <span className="bg-green-900/30 text-green-400 border border-green-800/40 px-2 py-0.5 rounded-full">
              {activeDevice.icon} {activeDevice.label}
            </span>
          )}
          {color !== 'all' && activeColor && (
            <span className="flex items-center gap-1 bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-full">
              <span className={`w-2.5 h-2.5 rounded-full ${activeColor.bg}`} />
              {activeColor.label}
            </span>
          )}
          {filter !== 'all' && (
            <span className="bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-full capitalize">
              {filter}
            </span>
          )}
          {debouncedSearch && (
            <span className="bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-full">
              &ldquo;{debouncedSearch}&rdquo;
            </span>
          )}
          <button
            onClick={() => { setDevice('all'); setFilter('all'); setColor('all'); setSearch('') }}
            className="text-red-400 hover:text-red-300 ml-1 underline"
          >
            Clear all
          </button>
        </div>
      )}

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
          {device !== 'all' && (
            <button
              onClick={() => setDevice('all')}
              className="mt-4 text-green-400 hover:text-green-300 text-sm underline"
            >
              Show all devices
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{wallpapers.length}{hasMore ? '+' : ''} wallpapers</p>
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
                created_at={w.created_at}
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
    </>
  )
}
