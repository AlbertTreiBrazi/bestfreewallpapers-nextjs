'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function WallpaperError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Wallpaper page error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
      <p className="text-gray-400 mb-8 max-w-sm">
        This wallpaper couldn&apos;t be loaded. Please try again or browse other wallpapers.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href="/wallpapers"
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Wallpapers
        </Link>
      </div>
    </div>
  )
}
