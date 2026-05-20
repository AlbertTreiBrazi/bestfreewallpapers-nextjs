'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useDownload } from '@/hooks/useDownload'
import DownloadModal from '@/components/download/DownloadModal'
import AuthModal from '@/components/auth/AuthModal'
import FavoriteButton from '@/components/ui/FavoriteButton'
import type { LiveWallpaper } from '@/types'

interface Props {
  lw: LiveWallpaper
  related: LiveWallpaper[]
}

export default function LiveWallpaperDetailClient({ lw, related }: Props) {
  const { isOpen, countdown, canDownload, isDownloading, item, userType, openDownload, closeDownload, startDownload } = useDownload()
  const [authOpen, setAuthOpen] = useState(false)

  const handleDownload = () => {
    openDownload({
      id: lw.id,
      title: lw.title,
      slug: lw.slug,
      url: lw.video_url,
      type: 'live',
      is_premium: lw.is_premium,
    })
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/live-wallpapers" className="hover:text-white">Live Wallpapers</Link>
          <span>/</span>
          <span className="text-gray-300 truncate">{lw.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Video preview */}
          <div className="relative aspect-[9/16] max-h-[70vh] w-full mx-auto rounded-2xl overflow-hidden bg-gray-800 shadow-2xl" onContextMenu={(e) => e.preventDefault()}>
            <video
              src={lw.video_url}
              poster={lw.thumbnail_url || undefined}
              autoPlay muted loop playsInline onContextMenu={(e) => e.preventDefault()} controlsList="nodownload"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {lw.thumbnail_url && (
              <Image src={lw.thumbnail_url} alt={lw.title} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover -z-10" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <div className="flex items-start gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex-1">{lw.title}</h1>
              <FavoriteButton id={lw.id} type="live" size="md" />
            </div>
              {lw.description && (
                <p className="text-gray-400 mb-6 leading-relaxed">{lw.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                {lw.duration_seconds && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Duration</p>
                    <p className="text-white font-medium">{lw.duration_seconds}s</p>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Downloads</p>
                  <p className="text-white font-medium">{lw.downloads_count.toLocaleString()}</p>
                </div>
                {lw.category && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Category</p>
                    <p className="text-white font-medium">{lw.category}</p>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Format</p>
                  <p className="text-white font-medium">MP4 Video</p>
                </div>
              </div>

              {lw.tags && lw.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {lw.tags.slice(0, 8).map((tag) => (
                    <span key={tag} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Download button — now with modal + timer */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-colors text-lg"
              >
                ↓ Download Live Wallpaper
              </button>
              <p className="text-center text-xs text-gray-500">
                Free for personal use • No registration required
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-white mb-6">More Live Wallpapers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {related.map((w) => (
                <Link key={w.id} href={`/live-wallpaper/${w.slug}`} className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-800 block">
                  {w.thumbnail_url && <Image src={w.thumbnail_url} alt={w.title} fill sizes="16vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="bg-black/60 rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">{w.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <DownloadModal
        isOpen={isOpen}
        item={item}
        countdown={countdown}
        canDownload={canDownload}
        isDownloading={isDownloading}
        userType={userType}
        onClose={closeDownload}
        onDownload={startDownload}
        onOpenAuth={() => { closeDownload(); setAuthOpen(true) }}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
