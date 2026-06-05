'use client'

import { useState } from 'react'
import Link from 'next/link'
import WallpaperCard from '@/components/wallpapers/WallpaperCard'

interface Wallpaper {
  id: number
  title: string
  slug: string
  thumbnail_url: string | null
  is_premium: boolean
  download_count: number
  created_at: string
}

interface Props {
  trending: Wallpaper[]
  newest: Wallpaper[]
}

export default function HomeTrendingSection({ trending, newest }: Props) {
  const [tab, setTab] = useState<'trending' | 'new'>('trending')
  const items = tab === 'trending' ? trending : newest

  return (
    <section id="wallpapers">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Tab buttons */}
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
        </div>

        <Link
          href={`/wallpapers${tab === 'new' ? '?sort=newest' : ''}`}
          className="text-green-400 hover:text-green-300 text-sm font-medium whitespace-nowrap"
        >
          See all →
        </Link>
      </div>

      {/* Subtitle */}
      <p className="text-gray-500 text-xs mb-4 -mt-4">
        {tab === 'trending'
          ? 'Most downloaded HD wallpapers'
          : 'Recently added wallpapers'}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((w) => (
          <WallpaperCard
            key={w.id}
            id={w.id}
            title={w.title}
            slug={w.slug}
            thumbnail_url={w.thumbnail_url}
            is_premium={w.is_premium}
            download_count={w.download_count}
            created_at={w.created_at}
          />
        ))}
      </div>
    </section>
  )
}
