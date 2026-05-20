'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { LiveWallpaper } from '@/types'

function LiveWallpaperCard({ lw }: { lw: LiveWallpaper }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [frameReady, setFrameReady] = useState(false)

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play()
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

  return (
    <Link
      href={`/live-wallpaper/${lw.slug}`}
      className="group relative rounded-lg overflow-hidden bg-gray-900 aspect-[9/16] block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail dacă există */}
      {lw.thumbnail_url && (
        <Image
          src={lw.thumbnail_url}
          alt={lw.title}
          fill
          sizes="(max-width: 640px) 50vw, 16vw"
          className={`object-cover transition-opacity duration-300 ${isPlaying || frameReady ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      {/* Placeholder dacă nu există thumbnail */}
      {!lw.thumbnail_url && !frameReady && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-800 to-gray-900 transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/70 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-white/50 text-xs text-center px-2 line-clamp-2">{lw.title}</span>
          <span className="text-white/30 text-xs">Hover to preview</span>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={lw.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        preload="metadata"
        poster={lw.thumbnail_url || undefined}
        onLoadedMetadata={(e) => {
          // Seek la 0.1s pentru a genera un frame vizibil
          e.currentTarget.currentTime = 0.1
        }}
        onSeeked={(e) => {
          // Frame generat — video e vizibil acum
          if (e.currentTarget.currentTime <= 0.2) {
            setFrameReady(true)
          }
        }}
      />

      {/* Play icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </div>

      {/* Title + duration */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-xs font-medium line-clamp-2">{lw.title}</p>
        {lw.duration_seconds && (
          <p className="text-gray-300 text-xs mt-0.5">{lw.duration_seconds}s</p>
        )}
      </div>

      {lw.is_premium && (
        <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
      )}
    </Link>
  )
}

export default function LiveWallpapersPage() {
  const [wallpapers, setWallpapers] = useState<LiveWallpaper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('live_wallpapers')
      .select('*')
      .eq('is_active', true)
      .eq('is_published', true)
      .order('downloads_count', { ascending: false })
      .limit(24)
      .then(({ data }) => {
        setWallpapers((data || []) as LiveWallpaper[])
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Free Live Wallpapers</h1>
        <p className="text-gray-400">Hover to preview · Click to download · Animated wallpapers for iPhone and Android</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-lg bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No live wallpapers found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {wallpapers.map((lw) => (
            <LiveWallpaperCard key={lw.id} lw={lw} />
          ))}
        </div>
      )}
    </div>
  )
}
