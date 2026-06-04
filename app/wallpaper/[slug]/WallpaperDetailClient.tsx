'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDownload } from '@/hooks/useDownload'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import DownloadModal from '@/components/download/DownloadModal'
import AuthModal from '@/components/auth/AuthModal'
import FavoriteButton from '@/components/ui/FavoriteButton'
import ShareButton from '@/components/ui/ShareButton'
import WallpaperCard from '@/components/wallpapers/WallpaperCard'
import type { Wallpaper } from '@/types'
import type { CollectionInfo, CategoryInfo } from './page'

interface Props {
  wallpaper: Wallpaper
  related: Wallpaper[]
  collections?: CollectionInfo[]
  categoryInfo?: CategoryInfo | null
}

export default function WallpaperDetailClient({ wallpaper, related, collections = [], categoryInfo }: Props) {
  const { user } = useAuth()
  const { isOpen, countdown, canDownload, isDownloading, item, userType, openDownload, closeDownload, startDownload } = useDownload()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { addItem } = useRecentlyViewed()

  useEffect(() => {
    addItem({ id: wallpaper.id, type: 'wallpaper', title: wallpaper.title, slug: wallpaper.slug, thumbnail_url: wallpaper.thumbnail_url })
  }, [wallpaper.id]) // eslint-disable-line

  const handleDownload = () => {
    // Premium wallpaper + not logged in → show login modal
    if (wallpaper.is_premium && !user) {
      setAuthMode('login')
      setAuthOpen(true)
      return
    }

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
          {/* Image — always visible */}
          <div className="relative aspect-[9/16] md:max-h-[70vh] w-full mx-auto rounded-2xl overflow-hidden bg-gray-800 shadow-2xl" onContextMenu={(e) => e.preventDefault()}>
            {wallpaper.image_url ? (
              <Image
                src={wallpaper.image_url}
                alt={wallpaper.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {/* Premium badge on image */}
            {wallpaper.is_premium && (
              <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Premium
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between py-2">
            <div>
              {/* Title + Favorite */}
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex-1">{wallpaper.title}</h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ShareButton title={wallpaper.title} />
                  <FavoriteButton id={wallpaper.id} type="wallpaper" size="md" />
                </div>
              </div>

              {wallpaper.description && (
                <p className="text-gray-400 mb-6 leading-relaxed">{wallpaper.description}</p>
              )}

              {/* Stats */}
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

              {/* Tags */}
              {wallpaper.tags && wallpaper.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {wallpaper.tags.slice(0, 8).map((tag) => (
                    <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs px-3 py-1 rounded-full border border-gray-700 hover:border-gray-600 transition-colors">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Collections */}
              {collections.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-500 text-xs mb-2">Part of collection</p>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.slug}`}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-green-700 text-gray-300 hover:text-white text-sm px-3 py-2 rounded-xl transition-all group"
                      >
                        {col.cover_image_url ? (
                          <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
                            <Image src={col.cover_image_url} alt={col.name} fill sizes="24px" className="object-cover" />
                          </div>
                        ) : (
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        )}
                        <span className="font-medium">{col.name}</span>
                        <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Download section */}
            <div className="space-y-3">
              {/* Premium + not logged in → show login prompt */}
              {wallpaper.is_premium && !user && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-yellow-300 text-sm font-medium">Premium Wallpaper</p>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    This is a premium wallpaper. Sign in to download it — free accounts can download premium wallpapers with a short wait.
                  </p>
                </div>
              )}

              <button
                onClick={handleDownload}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl text-center transition-colors text-lg"
              >
                {wallpaper.is_premium && !user ? '🔐 Sign In to Download' : '↓ Download Free'}
              </button>

              {wallpaper.is_premium && !user ? (
                <p className="text-center text-xs text-gray-500">
                  <button onClick={() => { setAuthMode('register'); setAuthOpen(true) }} className="text-green-400 hover:text-green-300">
                    Create free account
                  </button>
                  {' '}to download premium wallpapers
                </p>
              ) : (
                <p className="text-center text-xs text-gray-500">
                  Free for personal use • No registration required
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Similar Wallpapers */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {categoryInfo ? `More ${categoryInfo.name} Wallpapers` : 'Similar Wallpapers'}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {categoryInfo ? `${related.length} more in this category` : `${related.length} wallpapers you might like`}
                </p>
              </div>
              {categoryInfo && (
                <Link
                  href={`/category/${categoryInfo.slug}`}
                  className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap transition-colors"
                >
                  See all →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {related.map((w) => (
                <WallpaperCard
                  key={w.id}
                  id={w.id}
                  title={w.title}
                  slug={w.slug}
                  thumbnail_url={w.thumbnail_url}
                  is_premium={w.is_premium}
                  download_count={(w as any).download_count ?? 0}
                  created_at={(w as any).created_at ?? ''}
                />
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
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authMode} />
    </>
  )
}
