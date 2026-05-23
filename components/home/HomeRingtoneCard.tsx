'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useFavorites } from '@/hooks/useFavorites'

interface Props {
  ringtone: {
    id: number
    title: string
    slug: string
    cover_image_url: string | null
    audio_url: string
    duration_seconds: number | null
    downloads_count: number
    created_at?: string
  }
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function HomeRingtoneCard({ ringtone }: Props) {
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
      className="group bg-gray-800 hover:bg-gray-750 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all block"
    >
      <div className="relative aspect-square bg-gray-700">
        {ringtone.cover_image_url ? (
          <Image
            src={ringtone.cover_image_url}
            alt={ringtone.title}
            fill
            sizes="(max-width: 640px) 50vw, 16vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}

        <button
          onClick={handlePlayPause}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${playing ? 'bg-black/40 opacity-100' : 'bg-black/0 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-hover:bg-black/30'}`}
          aria-label={playing ? 'Pause' : 'Play preview'}
        >
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
            {playing ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </div>
        </button>

        <button
          onClick={handleFav}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${faved ? 'bg-red-500 text-white opacity-100' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'}`}
          aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {ringtone.created_at && Date.now() - new Date(ringtone.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium z-10">NEW</div>
        )}

        {ringtone.duration_seconds && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {formatDuration(ringtone.duration_seconds)}
          </div>
        )}

        {playing && (
          <div className="absolute bottom-2 right-2 flex items-end gap-0.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
      </div>

      <audio ref={audioRef} src={ringtone.audio_url} preload="none" onEnded={() => setPlaying(false)} />

      <div className="p-2.5">
        <p className="text-white text-sm font-medium line-clamp-1">{ringtone.title}</p>
        <p className="text-gray-500 text-xs mt-0.5">⬇ {(ringtone.downloads_count || 0).toLocaleString()}</p>
      </div>
    </Link>
  )
}
