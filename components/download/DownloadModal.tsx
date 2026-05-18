'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { DownloadItem } from '@/hooks/useDownload'

interface Props {
  isOpen: boolean
  item: DownloadItem | null
  countdown: number
  isDownloading: boolean
  onClose: () => void
  onDownload: () => void
  onOpenAuth?: () => void
}

export default function DownloadModal({
  isOpen, item, countdown, isDownloading, onClose, onDownload, onOpenAuth
}: Props) {
  const { user } = useAuth()

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  const isReady = countdown === 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-white font-bold text-xl mb-1 pr-8">Download</h2>
          <p className="text-gray-400 text-sm mb-6 line-clamp-1">{item.title}</p>

          {/* Ad / Countdown area */}
          {countdown > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-5 text-center">
              <div className="relative w-16 h-16 mx-auto mb-3">
                {/* Circular countdown */}
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#374151" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none" stroke="#16a34a" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (countdown / (countdown + 1))}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{countdown}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {!user ? (
                  <>
                    Your download starts in <strong className="text-white">{countdown}s</strong>
                    <br />
                    <button onClick={onOpenAuth} className="text-green-400 hover:text-green-300 text-xs mt-2 inline-block">
                      Sign in to skip ads →
                    </button>
                  </>
                ) : (
                  <>Download ready in <strong className="text-white">{countdown}s</strong></>
                )}
              </p>
            </div>
          )}

          {/* Download type badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              item.type === 'wallpaper' ? 'bg-blue-700/40 text-blue-300' :
              item.type === 'ringtone' ? 'bg-green-700/40 text-green-300' :
              'bg-purple-700/40 text-purple-300'
            }`}>
              {item.type === 'wallpaper' ? '🖼 Wallpaper' : item.type === 'ringtone' ? '🎵 Ringtone' : '🎬 Live Wallpaper'}
            </span>
            {item.is_premium && (
              <span className="text-xs bg-yellow-600/40 text-yellow-300 px-2.5 py-1 rounded-full font-medium">⭐ Premium</span>
            )}
          </div>

          {/* Download button */}
          <button
            onClick={onDownload}
            disabled={!isReady || isDownloading}
            className={`w-full font-semibold py-4 rounded-xl text-lg transition-all ${
              isReady && !isDownloading
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isDownloading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Downloading...
              </span>
            ) : !isReady ? (
              `Please wait ${countdown}s...`
            ) : (
              '↓ Download Free'
            )}
          </button>

          {/* Ringtone format info */}
          {item.type === 'ringtone' && (
            <p className="text-center text-xs text-gray-500 mt-3">
              MP3 format — compatible with iPhone and Android
            </p>
          )}

          <p className="text-center text-xs text-gray-600 mt-2">
            Free for personal use · No registration required
          </p>
        </div>
      </div>
    </div>
  )
}
