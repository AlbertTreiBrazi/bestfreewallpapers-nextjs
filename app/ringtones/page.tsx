'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import type { Ringtone } from '@/types'

const LIMIT = 48

type SortOption = 'popular' | 'newest' | 'duration'

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function RingtoneCard({ ringtone }: { ringtone: Ringtone }) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(ringtone.id, 'ringtone')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(ringtone.id, 'ringtone')
  }

  return (
    <Link
      href={`/ringtone/${ringtone.slug}`}
      className="group bg-gray-800 hover:bg-gray-750 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 block"
    >
      {/* Cover image */}
      <div className="relative w-full aspect-square bg-gray-700 overflow-hidden">
        {ringtone.cover_image_url ? (
          <Image
            src={ringtone.cover_image_url}
            alt={ringtone.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}

        {/* Play button overlay */}
        <button
          onClick={handlePlayPause}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${playing ? 'bg-black/40 opacity-100' : 'bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/30'}`}
          aria-label={playing ? 'Pause' : 'Play preview'}
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            {playing ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>

        {/* Favorite button */}
        <button
          onClick={handleFav}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            faved ? 'bg-red-500 text-white opacity-100' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
          }`}
          aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Duration badge */}
        {ringtone.duration_seconds && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {formatDuration(ringtone.duration_seconds)}
          </div>
        )}

        {/* Playing wave animation */}
        {playing && (
          <div className="absolute bottom-2 right-2 flex items-end gap-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
      </div>

      {/* Audio element (hidden) */}
      <audio
        ref={audioRef}
        src={ringtone.audio_url}
        preload="none"
        onEnded={() => setPlaying(false)}
      />

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-sm font-medium line-clamp-1 mb-1">{ringtone.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">⬇ {(ringtone.downloads_count || 0).toLocaleString()}</span>
          {ringtone.is_premium && (
            <span className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function RingtonesPage() {
  const [ringtones, setRingtones] = useState<Ringtone[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<SortOption>('popular')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchRingtones = useCallback(async (reset = true) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    const from = reset ? 0 : page * LIMIT
    const to = from + LIMIT - 1

    let query = supabase
      .from('ringtones')
      .select('id, title, slug, cover_image_url, audio_url, duration_seconds, downloads_count, is_premium')
      .eq('is_active', true)
      .eq('is_published', true)
      .range(from, to)

    if (debouncedSearch) query = query.ilike('title', `%${debouncedSearch}%`)
    if (sort === 'popular') query = query.order('downloads_count', { ascending: false })
    else if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'duration') query = query.order('duration_seconds', { ascending: true })

    const { data } = await query
    const items = (data || []) as Ringtone[]

    if (reset) {
      setRingtones(items)
      setPage(1)
    } else {
      setRingtones(prev => [...prev, ...items])
      setPage(p => p + 1)
    }

    setHasMore(items.length === LIMIT)
    setLoading(false)
    setLoadingMore(false)
  }, [sort, debouncedSearch, page])

  useEffect(() => {
    fetchRingtones(true)
  }, [sort, debouncedSearch]) // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Free Ringtones</h1>
        <p className="text-gray-400 text-sm">
          Download free ringtones for iPhone (M4R) and Android (MP3) · Click ▶ to preview
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ringtones..."
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-600"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-600"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="duration">Shortest First</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-800 animate-pulse">
              <div className="aspect-square" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-700 rounded" />
                <div className="h-2 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : ringtones.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-2">No ringtones found</p>
          {search && <button onClick={() => setSearch('')} className="text-green-400 hover:text-green-300 text-sm">Clear search</button>}
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{ringtones.length} ringtones</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ringtones.map((r) => <RingtoneCard key={r.id} ringtone={r} />)}
          </div>
          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => fetchRingtones(false)}
                disabled={loadingMore}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Ringtones'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
