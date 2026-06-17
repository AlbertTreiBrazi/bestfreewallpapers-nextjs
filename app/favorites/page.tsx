'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cfLoader } from '@/lib/cloudflare-loader'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import AuthModal from '@/components/auth/AuthModal'

function FavoriteLiveCard({ lw }: { lw: FavoriteLive }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [playing, setPlaying] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Lazy-load video only when card enters viewport
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVideoLoaded(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleEnter = () => {
    if (videoRef.current && lw.video_url && videoLoaded) {
      videoRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {})
    }
  }

  const handleLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0.1
      setPlaying(false)
    }
  }

  return (
    <Link
      ref={cardRef}
      href={`/live-wallpaper/${lw.slug}`}
      className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
    >
      {lw.thumbnail_url && (
        <Image
          src={lw.thumbnail_url}
          alt={lw.title}
          fill
          sizes="16vw"
          unoptimized
          className={`object-cover transition-opacity duration-300 ${playing ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      {videoLoaded && lw.video_url && (
        <video
          ref={videoRef}
          src={lw.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop muted playsInline
          preload="none"
          onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.1 }}
        />
      )}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${playing ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="bg-black/60 rounded-full p-2">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">{lw.title}</p>
    </Link>
  )
}

interface FavoriteWallpaper {
  id: number; title: string; slug: string
  thumbnail_url: string | null; is_premium: boolean
}
interface FavoriteRingtone {
  id: number; title: string; slug: string; cover_image_url: string | null
}
interface FavoriteLive {
  id: number; title: string; slug: string; thumbnail_url: string | null; video_url: string | null
}

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const [wallpapers, setWallpapers] = useState<FavoriteWallpaper[]>([])
  const [ringtones, setRingtones] = useState<FavoriteRingtone[]>([])
  const [liveWallpapers, setLiveWallpapers] = useState<FavoriteLive[]>([])
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [tab, setTab] = useState<'wallpapers' | 'ringtones' | 'live'>('wallpapers')

  useEffect(() => {
    if (!user) return
    setFetching(true)
    setFetchError(false)
    Promise.all([
      supabase.from('favorites').select('wallpaper_id').eq('user_id', user.id),
      supabase.from('ringtone_favorites').select('ringtone:ringtones(id, title, slug, cover_image_url)').eq('user_id', user.id),
      supabase.from('live_wallpaper_favorites').select('live_wallpaper_id').eq('user_id', user.id),
    ]).then(async ([wallFavRes, ringRes, liveFavRes]) => {
      const wallpaperIds = (wallFavRes.data || []).map((r: any) => r.wallpaper_id).filter(Boolean)
      const liveIds = (liveFavRes.data || []).map((r: any) => r.live_wallpaper_id).filter(Boolean)

      const [wallData, liveData] = await Promise.all([
        wallpaperIds.length > 0
          ? supabase.from('wallpapers').select('id, title, slug, thumbnail_url, is_premium').in('id', wallpaperIds)
          : Promise.resolve({ data: [] }),
        liveIds.length > 0
          ? supabase.from('live_wallpapers').select('id, title, slug, thumbnail_url, video_url').in('id', liveIds)
          : Promise.resolve({ data: [] }),
      ])

      setWallpapers((wallData.data || []) as FavoriteWallpaper[])
      setRingtones((ringRes.data || []).map((r: any) => r.ringtone).filter(Boolean))
      setLiveWallpapers((liveData.data || []) as FavoriteLive[])
    }).catch(() => {
      setFetchError(true)
    }).finally(() => setFetching(false))
  }, [user])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Your Favorites</h1>
          <p className="text-gray-400 mb-8 max-w-sm">Sign in to save your favorite wallpapers and ringtones. Access them anytime from any device.</p>
          <button onClick={() => setAuthOpen(true)} className="bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
            Sign In to View Favorites
          </button>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    )
  }

  const tabs = [
    { key: 'wallpapers' as const, label: 'Wallpapers', count: wallpapers.length },
    { key: 'ringtones' as const, label: 'Ringtones', count: ringtones.length },
    { key: 'live' as const, label: 'Live', count: liveWallpapers.length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Your Favorites</h1>
        <p className="text-gray-400 text-sm mt-1">
          {wallpapers.length} wallpapers · {ringtones.length} ringtones · {liveWallpapers.length} live
        </p>
      </div>

      <div className="flex bg-gray-800 rounded-xl p-1 mb-8 max-w-xs">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === key ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {label} {count > 0 && <span className="text-xs opacity-75">({count})</span>}
          </button>
        ))}
      </div>

      {fetching ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-3">Could not load favorites. Please try again.</p>
          <button onClick={() => window.location.reload()} className="text-green-400 hover:text-green-300 text-sm">Retry</button>
        </div>
      ) : (
        <>
          {tab === 'wallpapers' && (
            wallpapers.length === 0
              ? <Empty label="wallpapers" href="/wallpapers" />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {wallpapers.map((w) => (
                    <Link key={w.id} href={`/wallpaper/${w.slug}`} className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] block">
                      {w.thumbnail_url && <Image src={w.thumbnail_url} alt={w.title} fill sizes="16vw" className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">{w.title}</p>
                    </Link>
                  ))}
                </div>
          )}

          {tab === 'ringtones' && (
            ringtones.length === 0
              ? <Empty label="ringtones" href="/ringtones" />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ringtones.map((r) => (
                    <Link key={r.id} href={`/ringtone/${r.slug}`} className="group bg-gray-800 hover:bg-gray-750 rounded-xl p-3 flex flex-col gap-2 border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-700">
                        {r.cover_image_url
                          ? <Image loader={cfLoader} src={r.cover_image_url} alt={r.title} fill sizes="20vw" className="object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            </div>
                        }
                      </div>
                      <p className="text-white text-xs font-medium line-clamp-2">{r.title}</p>
                    </Link>
                  ))}
                </div>
          )}

          {tab === 'live' && (
            liveWallpapers.length === 0
              ? <Empty label="live wallpapers" href="/live-wallpapers" />
              : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {liveWallpapers.map((lw) => (
                    <FavoriteLiveCard key={lw.id} lw={lw} />
                  ))}
                </div>
          )}
        </>
      )}
    </div>
  )
}

function Empty({ label, href }: { label: string; href: string }) {
  return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">No {label} saved yet.</p>
      <Link href={href} className="text-green-400 hover:text-green-300 text-sm">Browse {label} →</Link>
    </div>
  )
}
