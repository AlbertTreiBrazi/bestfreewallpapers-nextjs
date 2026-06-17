'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'
import type { Wallpaper } from '@/types'

interface CardProps {
  wallpaper: Wallpaper
  index: number
  total: number
  isActive: boolean
  onBecomeActive: (i: number) => void
}

function ExploreCard({ wallpaper, index, total, isActive: _isActive, onBecomeActive }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(wallpaper.id, 'wallpaper')
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')

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

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(wallpaper.id, 'wallpaper')
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/wallpaper/${wallpaper.slug}`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: wallpaper.title, url }); return } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 2000)
    } catch {}
  }

  const imgSrc = wallpaper.thumbnail_url || wallpaper.image_url

  return (
    <div
      ref={cardRef}
      className="snap-start shrink-0 w-full h-[100dvh] relative overflow-hidden bg-black"
    >
      {/* ── Desktop: blurred backdrop so black bars look nice ── */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <Image src={imgSrc} alt="" fill sizes="100vw" className="object-cover scale-110 blur-3xl opacity-30" unoptimized />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* ── Mobile: full-bleed image ── */}
      <div className="md:hidden absolute inset-0">
        <Image src={imgSrc} alt={wallpaper.title} fill priority={index < 2} sizes="100vw" className="object-cover" draggable={false} unoptimized />
      </div>

      {/* ── Desktop: centered phone-width container ── */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center">
        <div className="relative h-full" style={{ aspectRatio: '9/16', maxHeight: '100%', maxWidth: '440px' }}>
          <Image src={imgSrc} alt={wallpaper.title} fill priority={index < 2} sizes="440px" className="object-cover rounded-2xl shadow-2xl" draggable={false} unoptimized />
        </div>
      </div>

      {/* Dark vignette at top and bottom for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-40% to-black/70 pointer-events-none md:hidden" />
      {/* Desktop vignette only inside the phone container area */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
        <div className="relative h-full" style={{ aspectRatio: '9/16', maxHeight: '100%', maxWidth: '440px' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-40% to-black/70 rounded-2xl" />
        </div>
      </div>

      {/* Position indicator — top right */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <span className="text-white/70 text-xs bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {index + 1} / {total}
        </span>
      </div>

      {/* Premium badge */}
      {wallpaper.is_premium && (
        <div className="absolute top-4 right-16 z-10 pointer-events-none">
          <span className="flex items-center gap-1 bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            PRO
          </span>
        </div>
      )}

      {/* TikTok-style right sidebar */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">

        {/* Favorite */}
        <button onClick={handleFav} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${faved ? 'bg-red-500' : 'bg-black/50 backdrop-blur-sm'}`}>
            <svg className="w-6 h-6 text-white" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white text-xs drop-shadow font-medium">{faved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${shareState === 'copied' ? 'bg-green-600' : 'bg-black/50 backdrop-blur-sm'}`}>
            {shareState === 'copied' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}
          </div>
          <span className="text-white text-xs drop-shadow font-medium">
            {shareState === 'copied' ? 'Copied!' : 'Share'}
          </span>
        </button>

        {/* Download — opens detail page */}
        <Link
          href={`/wallpaper/${wallpaper.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 bg-green-600 hover:bg-green-500 active:scale-90 rounded-full flex items-center justify-center shadow-lg transition-all">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <span className="text-white text-xs drop-shadow font-medium">Get</span>
        </Link>
      </div>

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-10 pointer-events-none">
        <h2 className="text-white font-bold text-base line-clamp-2 leading-snug pr-16 drop-shadow-lg">
          {wallpaper.title}
        </h2>
        {wallpaper.tags && wallpaper.tags.length > 0 && (
          <p className="text-white/60 text-sm mt-1 pr-16">
            {wallpaper.tags.slice(0, 3).map(t => `#${t}`).join('  ')}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {wallpaper.category && (
            <span className="text-white/40 text-xs">{wallpaper.category}</span>
          )}
          {wallpaper.download_count > 0 && (
            <span className="text-white/40 text-xs">
              ⬇ {wallpaper.download_count >= 1000
                ? `${(wallpaper.download_count / 1000).toFixed(1)}k`
                : wallpaper.download_count}
            </span>
          )}
        </div>
        {index === 0 && (
          <p className="text-white/30 text-xs mt-2 animate-pulse">Swipe up for next ↑</p>
        )}
      </div>
    </div>
  )
}

interface Props {
  wallpapers: Wallpaper[]
  onClose?: () => void
}

export default function WallpaperExplore({ wallpapers, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const handleBecomeActive = useCallback((i: number) => setActiveIndex(i), [])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Keyboard navigation: Escape closes, ArrowDown/ArrowUp scroll to next/prev
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose?.(); return }
      if (!scrollRef.current) return
      const h = scrollRef.current.clientHeight
      if (e.key === 'ArrowDown') { e.preventDefault(); scrollRef.current.scrollBy({ top: h, behavior: 'smooth' }) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); scrollRef.current.scrollBy({ top: -h, behavior: 'smooth' }) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close / back button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Close explore"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Explore label */}
      <div className={`absolute top-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none ${onClose ? 'left-16' : 'left-4'}`}>
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white text-xs font-medium">Wallpapers</span>
      </div>

      {/* Snap scroll container — keyboard ArrowUp/Down navigates on desktop */}
      <div ref={scrollRef} className="h-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {wallpapers.map((w, i) => (
          <ExploreCard
            key={w.id}
            wallpaper={w}
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
