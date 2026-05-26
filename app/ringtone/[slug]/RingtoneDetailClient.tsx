'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useDownload } from '@/hooks/useDownload'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import DownloadModal from '@/components/download/DownloadModal'
import AuthModal from '@/components/auth/AuthModal'
import FavoriteButton from '@/components/ui/FavoriteButton'
import ShareButton from '@/components/ui/ShareButton'
import type { Ringtone } from '@/types'

interface Props {
  ringtone: Ringtone
  related: Ringtone[]
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function RingtoneDetailClient({ ringtone, related }: Props) {
  const { isOpen, countdown, canDownload, isDownloading, item, userType, openDownload, closeDownload, startDownload } = useDownload()
  const [authOpen, setAuthOpen] = useState(false)
  const { addItem } = useRecentlyViewed()

  useEffect(() => {
    addItem({ id: ringtone.id, type: 'ringtone', title: ringtone.title, slug: ringtone.slug, thumbnail_url: ringtone.cover_image_url })
  }, [ringtone.id]) // eslint-disable-line

  const handleDownloadMP3 = () => {
    openDownload({
      id: ringtone.id,
      title: `${ringtone.title} (MP3)`,
      slug: ringtone.slug,
      url: ringtone.audio_url,
      type: 'ringtone',
      is_premium: ringtone.is_premium,
    })
  }

  const handleDownloadM4R = () => {
    if (!ringtone.m4r_url) return
    openDownload({
      id: ringtone.id,
      title: `${ringtone.title} (iPhone M4R)`,
      slug: `${ringtone.slug}-m4r`,
      url: ringtone.m4r_url,
      type: 'ringtone',
      is_premium: ringtone.is_premium,
    })
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/ringtones" className="hover:text-white">Ringtones</Link>
          <span>/</span>
          <span className="text-gray-300 truncate">{ringtone.title}</span>
        </nav>

        <div className="bg-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 mx-auto sm:mx-0">
              {ringtone.cover_image_url ? (
                <Image src={ringtone.cover_image_url} alt={ringtone.title} fill priority sizes="160px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white flex-1">{ringtone.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ShareButton title={ringtone.title} />
                <FavoriteButton id={ringtone.id} type="ringtone" size="md" />
              </div>
            </div>
              {ringtone.description && (
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">{ringtone.description}</p>
              )}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-gray-400 mb-4">
                {ringtone.duration_seconds && <span>⏱ {formatDuration(ringtone.duration_seconds)}</span>}
                {ringtone.file_size_bytes && <span>📦 {(ringtone.file_size_bytes / 1024).toFixed(0)} KB</span>}
                <span>⬇ {ringtone.downloads_count.toLocaleString()} downloads</span>
              </div>
              {ringtone.tags && ringtone.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {ringtone.tags.slice(0, 6).map((tag) => (
                    <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs px-2 py-1 rounded-full transition-colors">#{tag}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audio player */}
          <div className="mt-6">
            <audio controls className="w-full" preload="metadata">
              <source src={ringtone.audio_url} type="audio/mpeg" />
            </audio>
          </div>

          {/* Download buttons — now with modal + timer */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadMP3}
              className="bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors"
            >
              ↓ Download MP3 (Android)
            </button>
            {ringtone.m4r_url && (
              <button
                onClick={handleDownloadM4R}
                className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors"
              >
                ↓ Download M4R (iPhone)
              </button>
            )}
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            Free for personal use • No registration required •{' '}
            <Link href="/ringtones/how-to-set" className="text-green-400 hover:text-green-300">How to set →</Link>
          </p>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-5">More Ringtones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {related.map((r) => (
                <Link key={r.id} href={`/ringtone/${r.slug}`} className="group bg-gray-800 hover:bg-gray-750 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors border border-gray-700 hover:border-gray-600">
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-700">
                    {r.cover_image_url ? (
                      <Image src={r.cover_image_url} alt={r.title} fill sizes="20vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium text-center line-clamp-2">{r.title}</p>
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
