'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useFavorites } from '@/hooks/useFavorites'
import type { LiveWallpaper } from '@/types'

function LiveWallpaperCard({ lw }: { lw: LiveWallpaper }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(lw.id, 'live')
  const [isPlaying, setIsPlaying] = useState(false)
  const [frameReady, setFrameReady] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Intersection Observer — încarcă video-ul doar când e vizibil
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !videoLoaded) {
          setVideoLoaded(true)
        }
      },
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
      {/* Thumbnail */}
      {lw.thumbnail_url && (
        <Image
          src={lw.thumbnail_url}
          alt={lw.title}
          fill
          sizes="(max-width: 640px) 50vw, 16vw"
          className={`object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      {/* Placeholder fără thumbnail */}
      {!lw.thumbnail_url && !frameReady && !isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/60 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-white/40 text-xs">Hover to play</span>
        </div>
      )}

      {/* Video — preload="none", se încarcă doar la hover */}
      {videoLoaded && (
        <video
          ref={videoRef}
          src={lw.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop muted playsInline
          preload="none"
          onLoadedMetadata={(e) => {
            e.currentTarget.currentTime = 0.1
          }}
          onSeeked={(e) => {
            if (e.currentTarget.currentTime <= 0.2) setFrameReady(true)
          }}
        />
      )}

      {/* Favorite button */}
      <button
        onClick={handleFav}
        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          faved ? 'bg-red-500 text-white opacity-100' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
        }`}
        aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Play indicator */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Premium badge */}
      {lw.is_premium && (
        <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
      )}

      {/* Title + duration */}
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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('live_wallpapers')
      .select('*')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('downloads_count', { ascending: false })
      .limit(48)

    if (debouncedSearch) query = query.ilike('title', `%${debouncedSearch}%`)

    query.then(({ data }) => {
      setWallpapers((data || []) as LiveWallpaper[])
      setLoading(false)
    })
  }, [debouncedSearch])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Free Live Wallpapers</h1>
        <p className="text-gray-400 text-sm">Hover to preview · Click to download · Animated wallpapers for iPhone and Android</p>
      </div>

      {/* Search */}
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

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No live wallpapers found.</div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{wallpapers.length} live wallpapers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {wallpapers.map((lw) => <LiveWallpaperCard key={lw.id} lw={lw} />)}
          </div>
        </>
      )}
    </div>
  )
}
