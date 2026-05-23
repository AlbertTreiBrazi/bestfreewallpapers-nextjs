'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useFavorites } from '@/hooks/useFavorites'
import type { LiveWallpaper } from '@/types'
import LiveWallpaperExplore from '@/components/live-wallpapers/LiveWallpaperExplore'

interface LiveCategory { id: number; name: string; slug: string }

const LIMIT = 48

function LiveWallpaperCard({ lw }: { lw: LiveWallpaper }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(lw.id, 'live')
  const [isPlaying, setIsPlaying] = useState(false)
  const [frameReady, setFrameReady] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !videoLoaded) setVideoLoaded(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [videoLoaded])

  const handleMouseEnter = () => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0.1
      setIsPlaying(false)
    }
  }

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(lw.id, 'live')
  }

  return (
    <Link
      ref={cardRef}
      href={`/live-wallpaper/${lw.slug}`}
      className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-[9/16] block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {lw.thumbnail_url && (
        <Image
          src={lw.thumbnail_url}
          alt={lw.title}
          fill
          sizes="(max-width: 640px) 50vw, 16vw"
          className={`object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      {!lw.thumbnail_url && !frameReady && !isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/60 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}

      {videoLoaded && (
        <video
          ref={videoRef}
          src={lw.video_url ?? undefined}
          className="absolute inset-0 w-full h-full object-cover"
          loop muted playsInline
          preload={lw.thumbnail_url ? 'none' : 'metadata'}
          onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1 }}
          onSeeked={(e) => { if (e.currentTarget.currentTime <= 0.2) setFrameReady(true) }}
        />
      )}

      <button
        onClick={handleFav}
        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          faved ? 'bg-red-500 text-white opacity-100' : 'bg-black/50 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
        }`}
        aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>

      {lw.is_premium && (
        <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-xs font-medium line-clamp-2">{lw.title}</p>
        {lw.duration_seconds && (
          <p className="text-gray-300 text-xs mt-0.5">{lw.duration_seconds}s</p>
        )}
      </div>
    </Link>
  )
}

export default function LiveWallpapersPage() {
  const [wallpapers, setWallpapers] = useState<LiveWallpaper[]>([])
  const [categories, setCategories] = useState<LiveCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const pageRef = useRef(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [exploreOpen, setExploreOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('live_wallpaper_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setCategories((data || []) as LiveCategory[]))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchWallpapers = useCallback(async (reset = true) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    const from = reset ? 0 : pageRef.current * LIMIT
    const to = from + LIMIT - 1

    let query = supabase
      .from('live_wallpapers')
      .select('id, title, slug, thumbnail_url, video_url, downloads_count, is_premium, duration_seconds, is_active, is_published, views_count, category, tags, description, created_at, updated_at')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('downloads_count', { ascending: false })
      .range(from, to)

    if (debouncedSearch) query = query.ilike('title', `%${debouncedSearch}%`)

    const { data } = await query
    const items = (data || []) as LiveWallpaper[]

    if (reset) {
      setWallpapers(items)
      pageRef.current = 1
      setPage(1)
    } else {
      setWallpapers(prev => [...prev, ...items])
      pageRef.current += 1
      setPage(p => p + 1)
    }

    setHasMore(items.length === LIMIT)
    setLoading(false)
    setLoadingMore(false)
  }, [debouncedSearch])

  useEffect(() => {
    fetchWallpapers(true)
  }, [debouncedSearch]) // eslint-disable-line

  return (
    <>
    {exploreOpen && wallpapers.length > 0 && (
      <LiveWallpaperExplore wallpapers={wallpapers} onClose={() => setExploreOpen(false)} />
    )}
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Free Live Wallpapers</h1>
          <p className="text-gray-400 text-sm">Hover to preview · Click to download · Animated wallpapers for iPhone and Android</p>
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

      <div className="relative max-w-md mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search live wallpapers..."
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-600"
        />
      </div>

      {/* Categories strip */}
      {categories.length > 0 && (
        <div className="relative mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/live-wallpapers/category/${cat.slug}`}
                className="flex-shrink-0 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-600 text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No live wallpapers found</p>
          {search && <button onClick={() => setSearch('')} className="text-green-400 hover:text-green-300 text-sm">Clear search</button>}
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{wallpapers.length} live wallpapers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {wallpapers.map((lw) => <LiveWallpaperCard key={lw.id} lw={lw} />)}
          </div>
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => fetchWallpapers(false)}
                disabled={loadingMore}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Live Wallpapers'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  )
}
