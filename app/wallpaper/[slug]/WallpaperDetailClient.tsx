'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useDownload } from '@/hooks/useDownload'
import DownloadModal from '@/components/download/DownloadModal'
import AuthModal from '@/components/auth/AuthModal'
import FavoriteButton from '@/components/ui/FavoriteButton'
import type { Wallpaper } from '@/types'

interface Props {
  wallpaper: Wallpaper
  related: Wallpaper[]
}

export default function WallpaperDetailClient({ wallpaper, related }: Props) {
  const { isOpen, countdown, canDownload, isDownloading, item, userType, openDownload, closeDownload, startDownload } = useDownload()
  const [authOpen, setAuthOpen] = useState(false)

  const handleDownload = () => {
    openDownload({
      id: wallpaper.id,
      title: wallpaper.title,
      slug: wallpaper.slug,
      url: wallpaper.download_url || wallpaper.image_url,
      type: 'wallpaper',
      is_premium: wallpaper.is_premium,
    })
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/wallpapers" className="hover:text-white">Wallpapers</Link>
          {wallpaper.category && (
            <><span>/</span><span className="text-gray-300">{wallpaper.category}</span></>
          )}
          <span>/</span>
          <span className="text-gray-300 truncate max-w-xs">{wallpaper.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-[9/16] max-h-[70vh] w-full mx-auto rounded-2xl overflow-hidden bg-gray-800 shadow-2xl">
            <Image
              src={wallpaper.image_url}
              alt={wallpaper.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex-1">{wallpaper.title}</h1>
                <FavoriteButton id={wallpaper.id} type="wallpaper" size="md" />
              </div>
              {wallpaper.description && (
                <p className="text-gray-400 mb-6 leading-relaxed">{wallpaper.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                {wallpaper.width && wallpaper.height && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Resolution</p>
                    <p className="text-white font-medium">{wallpaper.width} × {wallpaper.height}</p>
                  </div>
                )}
                {wallpaper.category && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">Category</p>
                    <p className="text-white font-medium">{wallpaper.category}</p>
                  </div>
                )}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Downloads</p>
                  <p className="text-white font-medium">{wallpaper.download_count.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Format</p>
                  <p className="text-white font-medium">JPG / PNG</p>
                </div>
              </div>

              {wallpaper.tags && wallpaper.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {wallpaper.tags.slice(0, 8).map((tag) => (
                    <span key={tag} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Download */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-colors text-lg"
              >
                ↓ Download Free
              </button>
              {wallpaper.is_premium && (
                <p className="text-center text-sm text-yellow-400">⭐ Premium quality — free for personal use</p>
              )}
              <p className="text-center text-xs text-gray-500">Free for personal use • No registration required</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-white mb-6">Related Wallpapers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {related.map((w) => (
                <Link key={w.id} href={`/wallpaper/${w.slug}`} className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-800 block">
                  {w.thumbnail_url && (
                    <Image src={w.thumbnail_url} alt={w.title} fill sizes="16vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">{w.title}</p>
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
        isDownloading={isDownloading}
        canDownload={canDownload}
        userType={userType}
        onClose={closeDownload}
        onDownload={startDownload}
        onOpenAuth={() => { closeDownload(); setAuthOpen(true) }}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
