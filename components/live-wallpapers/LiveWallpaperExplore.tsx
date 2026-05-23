'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'
import type { LiveWallpaper } from '@/types'

interface CardProps {
  lw: LiveWallpaper
  index: number
  total: number
  isActive: boolean
  onBecomeActive: (i: number) => void
}

function ExploreCard({ lw, index, total, isActive, onBecomeActive }: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(lw.id, 'live')
  const [paused, setPaused] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onBecomeActive(index) },
      { threshold: 0.7 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index, onBecomeActive])

  // Auto-play when card is active, pause+reset when leaving
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isActive && !paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
      if (!isActive) {
        video.currentTime = 0
        setPaused(false)
        setVideoReady(false)
      }
    }
  }, [isActive, paused])

  const handleTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) return
    const video = videoRef.current
    if (!video) return
    if (paused) {
      video.play().catch(() => {})
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(lw.id, 'live')
  }

  return (
    <div
      ref={cardRef}
      className="snap-start shrink-0 w-full h-[100dvh] relative overflow-hidden bg-black"
      onClick={handleTap}
    >
      {/* Thumbnail — always shown until video is ready */}
      {lw.thumbnail_url && (
        <Image
          src={lw.thumbnail_url}
          alt={lw.title}
          fill
          priority={index === 0}
          className={`object-cover transition-opacity duration-300 ${videoReady ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      {/* Video — always in DOM with preload=none, plays on demand */}
      <video
        ref={videoRef}
        src={lw.video_url ?? undefined}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        preload="none"
        onCanPlay={() => setVideoReady(true)}
      />

      {/* Paused overlay */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Position indicator — top right (close button is top left, rendered by parent) */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <span className="text-white/70 text-xs bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {index + 1} / {total}
        </span>
      </div>

      {/* TikTok-style right sidebar actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        {/* Favorite */}
        <button onClick={handleFav} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${faved ? 'bg-red-500' : 'bg-black/50 backdrop-blur-sm'}`}>
            <svg className="w-6 h-6 text-white" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white text-xs drop-shadow">{faved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Download — opens detail page */}
        <Link
          href={`/live-wallpaper/${lw.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <span className="text-white text-xs drop-shadow">Get</span>
        </Link>
      </div>

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10">
        <h2 className="text-white font-bold text-base line-clamp-2 leading-snug pr-16 drop-shadow">
          {lw.title}
        </h2>
        {lw.tags && lw.tags.length > 0 && (
          <p className="text-white/60 text-sm mt-1 pr-16">
            {lw.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
          </p>
        )}
        {lw.duration_seconds && (
          <p className="text-white/40 text-xs mt-1">{lw.duration_seconds}s loop</p>
        )}
        {index === 0 && (
          <p className="text-white/30 text-xs mt-2 animate-pulse">Swipe up for next ↑  ·  Tap to pause</p>
        )}
      </div>
    </div>
  )
}

interface Props {
  wallpapers: LiveWallpaper[]
  onClose: () => void
}

export default function LiveWallpaperExplore({ wallpapers, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleBecomeActive = useCallback((i: number) => setActiveIndex(i), [])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        aria-label="Close explore"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Explore label */}
      <div className="absolute top-4 left-16 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white text-xs font-medium">Live</span>
      </div>

      {/* Snap scroll container */}
      <div className="h-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {wallpapers.map((lw, i) => (
          <ExploreCard
            key={lw.id}
            lw={lw}
            index={i}
            total={wallpapers.length}
            isActive={activeIndex === i}
            onBecomeActive={handleBecomeActive}
          />
        ))}
      </div>
    </div>
  )
}
