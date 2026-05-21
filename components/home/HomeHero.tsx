'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const POPULAR_CATEGORIES = [
  { name: 'Aesthetic', slug: 'aesthetic' },
  { name: 'Dark', slug: 'dark' },
  { name: 'Nature', slug: 'nature' },
  { name: 'Anime', slug: 'anime' },
  { name: 'Space', slug: 'space' },
  { name: 'Cute', slug: 'cute' },
  { name: 'Abstract', slug: 'abstract' },
  { name: 'Minimal', slug: 'minimal' },
]

export default function HomeHero({ stats }: { stats: { wallpapers: number; ringtones: number; live: number } }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 border-b border-gray-800">
      {/* Background gradient effect */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.12), transparent 50%)'
      }} />

      <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/30 text-green-300 px-3 py-1 rounded-full text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          {stats.wallpapers}+ wallpapers · {stats.ringtones}+ ringtones · {stats.live}+ live wallpapers · all free
        </div>

        {/* H1 */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
          Best Free Wallpapers<br />
          <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            for iPhone & Android
          </span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl mx-auto">
          Download high-quality HD wallpapers, live wallpapers and free ringtones. No registration required, no watermarks, 100% free.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search wallpapers, ringtones, categories..."
              className="w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-gray-600 focus:border-green-600 text-white placeholder-gray-500 rounded-2xl pl-12 pr-32 py-4 text-base focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-700 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <span className="text-gray-500 text-xs">Trending:</span>
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="bg-gray-800/60 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
