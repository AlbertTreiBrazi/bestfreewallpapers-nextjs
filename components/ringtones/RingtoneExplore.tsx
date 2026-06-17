'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'
import type { Ringtone } from '@/types'
import { cfLoader } from '@/lib/cloudflare-loader'

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

interface CardProps {
  ringtone: Ringtone
  index: number
  total: number
  isActive: boolean
  isNext: boolean
  audioUnlocked: boolean
  onBecomeActive: (i: number) => void
  onUnlock: () => void
}

function ExploreCard({ ringtone, index, total, isActive, isNext, audioUnlocked, onBecomeActive, onUnlock }: CardProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(ringtone.id, 'ringtone')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const stableOnBecomeActive = useCallback(() => onBecomeActive(index), [index, onBecomeActive])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) stableOnBecomeActive() },
      { threshold: 0.65 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [stableOnBecomeActive])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isActive && audioUnlocked) {
      audio.currentTime = 0
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else if (!isActive) {
      audio.pause()
      audio.currentTime = 0
      setPlaying(false)
      setProgress(0)
    }
  }, [isActive, audioUnlocked])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audioUnlocked) {
      onUnlock()
      audio.play().then(() => setPlaying(true)).catch(() => {})
      return
    }
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(ringtone.id, 'ringtone')
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  return (
    <div ref={cardRef} className="snap-start shrink-0 w-full h-[100dvh] relative flex flex-col items-center justify-center">
      {/* Blurred background */}
      <div className="absolute inset-0 overflow-hidden">
        {ringtone.cover_image_url
          ? <Image loader={cfLoader} src={ringtone.cover_image_url} alt="" fill className="object-cover scale-125 blur-2xl opacity-25" />
          : <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950" />
        }
        <div className="absolute inset-0 bg-gray-950/65" />
      </div>

      {/* Card content */}
      <div className="relative z-10 w-full max-w-xs mx-auto px-6 flex flex-col items-center gap-5">

        {/* Position indicator */}
        <p className="text-gray-500 text-xs tracking-widest">{index + 1} / {total}</p>

        {/* Cover art */}
        <div className={`w-52 h-52 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 transition-transform duration-500 ${playing ? 'scale-105' : 'scale-100'}`}>
          {ringtone.cover_image_url
            ? <Image loader={cfLoader} src={ringtone.cover_image_url} alt={ringtone.title} width={208} height={208} className="object-cover w-full h-full" />
            : <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
          }
        </div>

        {/* Title + tags */}
        <div className="text-center w-full">
          <h2 className="text-white text-lg font-bold line-clamp-2 leading-snug">{ringtone.title}</h2>
          {ringtone.tags && ringtone.tags.length > 0 && (
            <p className="text-gray-400 text-sm mt-1.5">
              {ringtone.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
            </p>
          )}
          {ringtone.duration_seconds && (
            <p className="text-gray-500 text-xs mt-1">{formatDuration(ringtone.duration_seconds)}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleFav}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${faved ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            <svg className="w-5 h-5" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-green-600 hover:bg-green-500 active:scale-95 rounded-full flex items-center justify-center shadow-xl transition-all"
          >
            {playing
              ? <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              : <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>

          <Link
            href={`/ringtone/${ringtone.slug}`}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Download"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Link>
        </div>

        {!audioUnlocked && index === 0 && (
          <p className="text-gray-500 text-xs text-center animate-pulse mt-1">
            Tap ▶ to start · Swipe up for next
          </p>
        )}
      </div>

      <audio
        ref={audioRef}
        src={ringtone.audio_url}
        preload={isActive || isNext ? 'metadata' : 'none'}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setPlaying(false); setProgress(0) }}
      />
    </div>
  )
}

interface Props {
  ringtones: Ringtone[]
  onClose: () => void
}

export default function RingtoneExplore({ ringtones, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  const handleBecomeActive = useCallback((i: number) => setActiveIndex(i), [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-gray-950">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors hover:bg-black/70"
        aria-label="Close explore"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white text-xs font-medium">Explore</span>
      </div>

      <div className="h-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ringtones.map((r, i) => (
          <ExploreCard
            key={r.id}
            ringtone={r}
            index={i}
            total={ringtones.length}
            isActive={activeIndex === i}
            isNext={activeIndex + 1 === i}
            audioUnlocked={audioUnlocked}
            onBecomeActive={handleBecomeActive}
            onUnlock={() => setAudioUnlocked(true)}
          />
        ))}
      </div>
    </div>
  )
}
