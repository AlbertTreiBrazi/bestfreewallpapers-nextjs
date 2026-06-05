'use client'

import { useState } from 'react'
import Link from 'next/link'
import HomeLiveCard from '@/components/home/HomeLiveCard'

interface LiveWallpaper {
  id: number
  title: string
  slug: string
  thumbnail_url: string | null
  video_url: string
  downloads_count: number
  is_premium: boolean
  duration_seconds: number | null
  created_at: string
}

interface Props {
  trending: LiveWallpaper[]
  newest: LiveWallpaper[]
}

export default function HomeLiveSection({ trending, newest }: Props) {
  const [tab, setTab] = useState<'trending' | 'new'>('trending')
  const items = tab === 'trending' ? trending : newest

  if (trending.length === 0 && newest.length === 0) return null

  return (
    <section id="live-wallpapers">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-800/80 rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab('trending')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'trending'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>🔥</span>
              Trending
            </button>
            <button
              onClick={() => setTab('new')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'new'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>✨</span>
              New
              {newest.length > 0 && tab !== 'new' && (
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
          </div>
          <span className="text-gray-600 text-sm hidden sm:block">Live Wallpapers</span>
        </div>
        <Link href="/live-wallpapers" className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap">
          See all →
        </Link>
      </div>

      <p className="text-gray-500 text-xs mb-4 -mt-4">
        {tab === 'trending'
          ? 'Animated wallpapers for iPhone & Android · hover to preview'
          : 'Recently added live wallpapers'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((lw) => <HomeLiveCard key={lw.id} lw={lw} />)}
      </div>
    </section>
  )
}
