'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import WallpaperCard from '@/components/wallpapers/WallpaperCard'
import HomeRingtoneCard from '@/components/home/HomeRingtoneCard'
import HomeLiveCard from '@/components/home/HomeLiveCard'

type ContentType = 'all' | 'wallpaper' | 'live' | 'ringtone'
type SortType = 'popular' | 'newest'

const PAGE_SIZE = 24

interface WallpaperResult {
  id: number; title: string; slug: string; thumbnail_url: string | null
  is_premium: boolean; download_count: number; created_at: string
}
interface RingtoneResult {
  id: number; title: string; slug: string; cover_image_url: string | null
  audio_url: string; duration_seconds: number | null; downloads_count: number
  is_premium: boolean; created_at: string
}
interface LiveResult {
  id: number; title: string; slug: string; thumbnail_url: string | null
  video_url: string; downloads_count: number; is_premium: boolean
  duration_seconds: number | null; created_at: string
}
interface Category { id: number; name: string; slug: string }

const POPULAR_TAGS = ['aesthetic', 'dark', 'anime', 'nature', 'minimalist', 'space', 'flowers', 'cars', 'abstract', 'cute']

export default function SearchPage() {
  const [query, setQuery]           = useState('')
  const [type, setType]             = useState<ContentType>('all')
  const [sort, setSort]             = useState<SortType>('popular')
  const [categorySlug, setCategorySlug] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const [wallpapers, setWallpapers] = useState<WallpaperResult[]>([])
  const [ringtones, setRingtones]   = useState<RingtoneResult[]>([])
  const [lives, setLives]           = useState<LiveResult[]>([])

  const [wallPage, setWallPage]     = useState(0)
  const [ringPage, setRingPage]     = useState(0)
  const [livePage, setLivePage]     = useState(0)
  const [hasMoreWall, setHasMoreWall] = useState(false)
  const [hasMoreRing, setHasMoreRing] = useState(false)
  const [hasMoreLive, setHasMoreLive] = useState(false)

  const [loading, setLoading]       = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load categories once
  useEffect(() => {
    supabase.from('categories').select('id, name, slug').eq('is_active', true)
      .order('display_order', { ascending: true }).limit(30)
      .then(({ data }) => setCategories(data || []))
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setWallPage(0); setRingPage(0); setLivePage(0)
    setWallpapers([]); setRingtones([]); setLives([])
  }, [query, type, sort, categorySlug])

  const fetchResults = useCallback(async (q: string, append = false) => {
    if (!q.trim() || q.length < 2) {
      setWallpapers([]); setRingtones([]); setLives([])
      return
    }
    append ? setLoadingMore(true) : setLoading(true)

    const currentWallPage = append ? wallPage : 0
    const currentRingPage = append ? ringPage : 0
    const currentLivePage = append ? livePage : 0

    try {
      const wallSortCol  = sort === 'popular' ? 'download_count' : 'created_at'
      const otherSortCol = sort === 'popular' ? 'downloads_count' : 'created_at'

      const [wallRes, ringRes, liveRes] = await Promise.all([
        // Wallpapers
        (type === 'all' || type === 'wallpaper') ? (() => {
          let q2 = supabase.from('wallpapers')
            .select('id, title, slug, thumbnail_url, is_premium, download_count, created_at')
            .eq('is_active', true)
            .ilike('title', `%${q}%`)
            .order(wallSortCol, { ascending: false })
            .range(currentWallPage * PAGE_SIZE, (currentWallPage + 1) * PAGE_SIZE)
          if (categorySlug) q2 = q2.eq('category', categorySlug)
          return q2
        })() : Promise.resolve({ data: null, error: null }),

        // Ringtones
        (type === 'all' || type === 'ringtone') ?
          supabase.from('ringtones')
            .select('id, title, slug, cover_image_url, audio_url, duration_seconds, downloads_count, is_premium, created_at')
            .eq('is_active', true).eq('is_published', true)
            .ilike('title', `%${q}%`)
            .order(otherSortCol, { ascending: false })
            .range(currentRingPage * PAGE_SIZE, (currentRingPage + 1) * PAGE_SIZE)
          : Promise.resolve({ data: null, error: null }),

        // Live wallpapers
        (type === 'all' || type === 'live') ?
          supabase.from('live_wallpapers')
            .select('id, title, slug, thumbnail_url, video_url, downloads_count, is_premium, duration_seconds, created_at')
            .eq('is_active', true).eq('is_published', true)
            .ilike('title', `%${q}%`)
            .order(otherSortCol, { ascending: false })
            .range(currentLivePage * PAGE_SIZE, (currentLivePage + 1) * PAGE_SIZE)
          : Promise.resolve({ data: null, error: null }),
      ])

      const newWall = (wallRes.data || []) as WallpaperResult[]
      const newRing = (ringRes.data || []) as RingtoneResult[]
      const newLive = (liveRes.data || []) as LiveResult[]

      setWallpapers(prev => append ? [...prev, ...newWall] : newWall)
      setRingtones(prev => append ? [...prev, ...newRing] : newRing)
      setLives(prev => append ? [...prev, ...newLive] : newLive)

      setHasMoreWall(newWall.length === PAGE_SIZE + 1)
      setHasMoreRing(newRing.length === PAGE_SIZE + 1)
      setHasMoreLive(newLive.length === PAGE_SIZE + 1)
    } finally {
      setLoading(false); setLoadingMore(false)
    }
  }, [query, type, sort, categorySlug, wallPage, ringPage, livePage])

  // Debounced search on filter change
  useEffect(() => {
    const t = setTimeout(() => fetchResults(query), 350)
    return () => clearTimeout(t)
  }, [query, type, sort, categorySlug]) // eslint-disable-line

  const handleLoadMore = async () => {
    const nextWall = wallPage + 1
    const nextRing = ringPage + 1
    const nextLive = livePage + 1
    setWallPage(nextWall); setRingPage(nextRing); setLivePage(nextLive)
    await fetchResults(query, true)
  }

  const totalResults = wallpapers.length + ringtones.length + lives.length
  const hasMore = hasMoreWall || hasMoreRing || hasMoreLive

  const tabs: { value: ContentType; label: string; count: number }[] = [
    { value: 'all',      label: 'All',             count: totalResults },
    { value: 'wallpaper', label: 'Wallpapers',     count: wallpapers.length },
    { value: 'live',     label: 'Live',            count: lives.length },
    { value: 'ringtone', label: 'Ringtones',       count: ringtones.length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search input */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search wallpapers, ringtones, live wallpapers..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-12 pr-5 py-4 text-lg focus:outline-none focus:border-green-600 transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Filters row */}
      {query.length >= 2 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Type tabs */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setType(tab.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  type === tab.value
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {query.length >= 2 && tab.value !== 'all' && tab.count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    type === tab.value ? 'bg-green-700 text-green-100' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {tab.count}{hasMore ? '+' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortType)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Category filter — only for wallpapers tab */}
          {(type === 'wallpaper') && categories.length > 0 && (
            <select
              value={categorySlug}
              onChange={e => setCategorySlug(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-600 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Result count */}
          {!loading && totalResults > 0 && (
            <span className="text-gray-500 text-sm ml-auto">
              {totalResults}{hasMore ? '+' : ''} result{totalResults !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* ── RESULTS ── */}

      {/* No results */}
      {query.length >= 2 && !loading && totalResults === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">No results for &quot;{query}&quot;</p>
          <p className="text-gray-600 text-sm">Try a different keyword or browse by category</p>
        </div>
      )}

      {/* Wallpapers section */}
      {(type === 'all' || type === 'wallpaper') && wallpapers.length > 0 && (
        <section className="mb-10">
          {type === 'all' && (
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span>🖼️ Wallpapers</span>
              <span className="text-gray-500 text-sm font-normal">{wallpapers.length}{hasMoreWall ? '+' : ''}</span>
            </h2>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {wallpapers.map(w => (
              <WallpaperCard key={w.id} {...w} />
            ))}
          </div>
        </section>
      )}

      {/* Live Wallpapers section */}
      {(type === 'all' || type === 'live') && lives.length > 0 && (
        <section className="mb-10">
          {type === 'all' && (
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span>▶️ Live Wallpapers</span>
              <span className="text-gray-500 text-sm font-normal">{lives.length}{hasMoreLive ? '+' : ''}</span>
            </h2>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {lives.map(lw => (
              <HomeLiveCard key={lw.id} lw={lw} />
            ))}
          </div>
        </section>
      )}

      {/* Ringtones section */}
      {(type === 'all' || type === 'ringtone') && ringtones.length > 0 && (
        <section className="mb-10">
          {type === 'all' && (
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span>🎵 Ringtones</span>
              <span className="text-gray-500 text-sm font-normal">{ringtones.length}{hasMoreRing ? '+' : ''}</span>
            </h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ringtones.map(r => (
              <HomeRingtoneCard key={r.id} ringtone={r} />
            ))}
          </div>
        </section>
      )}

      {/* Load More */}
      {hasMore && totalResults > 0 && (
        <div className="flex justify-center mt-4 mb-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : 'Load More'}
          </button>
        </div>
      )}

      {/* Empty state — no query */}
      {!query && (
        <div className="py-12">
          <div className="text-center mb-10">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-lg">What are you looking for?</p>
          </div>

          <div className="max-w-lg mx-auto">
            <p className="text-gray-600 text-sm text-center mb-4">Popular searches</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); inputRef.current?.focus() }}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-full transition-all capitalize"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
