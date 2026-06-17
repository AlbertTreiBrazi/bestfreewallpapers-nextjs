'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { RecentItemType } from '@/hooks/useRecentlyViewed'

function getHref(type: RecentItemType, slug: string) {
  if (type === 'wallpaper') return `/wallpaper/${slug}`
  if (type === 'live') return `/live-wallpaper/${slug}`
  return `/ringtone/${slug}`
}

function TypeBadge({ type }: { type: RecentItemType }) {
  const map = {
    wallpaper: { label: '🖼️', bg: 'bg-blue-600' },
    live:      { label: '▶️', bg: 'bg-purple-600' },
    ringtone:  { label: '🎵', bg: 'bg-green-600' },
  }
  const { label, bg } = map[type]
  return (
    <span className={`absolute top-1.5 left-1.5 ${bg} text-white text-[10px] px-1.5 py-0.5 rounded font-medium z-10`}>
      {label}
    </span>
  )
}

export default function RecentlyViewedStrip() {
  const { items, clearAll } = useRecentlyViewed()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (items.length === 0) return null

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-white font-semibold text-base flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recently Viewed
          <span className="text-gray-600 text-xs font-normal">{items.length}</span>
        </h2>
        <button
          onClick={clearAll}
          className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={getHref(item.type, item.slug)}
            className="group relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-800"
            style={{ width: 80, height: 142 }} // 9:16 aspect
          >
            {item.thumbnail_url ? (
              <Image
                src={item.thumbnail_url}
                alt={item.title}
                fill
                sizes="80px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <TypeBadge type={item.type} />
            <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[10px] font-medium line-clamp-2 leading-tight">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
