'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useFavorites } from '@/hooks/useFavorites'

interface Props {
  lw: {
    id: number
    title: string
    slug: string
    thumbnail_url: string | null
    video_url: string
    duration_seconds?: number | null
    is_premium: boolean
    created_at?: string
  }
}

export default function HomeLiveCard({ lw }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(lw.id, 'live')
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [frameReady, setFrameReady] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !videoLoaded) setVideoLoaded(true)
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-[9/16] block"
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
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white/60 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}

      {videoLoaded && (
        <video
          ref={videoRef}
          src={lw.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop muted playsInline
          preload={lw.thumbnail_url ? 'none' : 'metadata'}
          onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1 }}
          onSeeked={(e) => { if (e.currentTarget.currentTime <= 0.2) setFrameReady(true) }}
        />
      )}

      <button
        onClick={handleFav}
        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${faved ? 'bg-red-500 text-white opacity-100' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'}`}
        aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}

      {lw.is_premium && (
        <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-medium">PRO</span>
      )}
      {!lw.is_premium && lw.created_at && Date.now() - new Date(lw.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 && (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">NEW</span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-xs font-medium line-clamp-2">{lw.title}</p>
      </div>
    </Link>
  )
}
