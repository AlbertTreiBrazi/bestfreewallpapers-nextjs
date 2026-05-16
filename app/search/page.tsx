'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface SearchResult {
  id: number
  title: string
  slug: string
  thumbnail_url: string | null
  type: 'wallpaper' | 'ringtone' | 'live'
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const [wallRes, ringRes, liveRes] = await Promise.all([
        supabase.from('wallpapers').select('id, title, slug, thumbnail_url').eq('is_active', true).ilike('title', `%${q}%`).limit(12),
        supabase.from('ringtones').select('id, title, slug, cover_image_url').eq('is_active', true).eq('is_published', true).ilike('title', `%${q}%`).limit(6),
        supabase.from('live_wallpapers').select('id, title, slug, thumbnail_url').eq('is_active', true).eq('is_published', true).ilike('title', `%${q}%`).limit(6),
      ])
      const combined: SearchResult[] = [
        ...(wallRes.data || []).map((w: any) => ({ ...w, type: 'wallpaper' as const })),
        ...(ringRes.data || []).map((r: any) => ({ id: r.id, title: r.title, slug: r.slug, thumbnail_url: r.cover_image_url, type: 'ringtone' as const })),
        ...(liveRes.data || []).map((l: any) => ({ ...l, type: 'live' as const })),
      ]
      setResults(combined)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 400)
    return () => clearTimeout(t)
  }, [query, search])

  const getHref = (r: SearchResult) => {
    if (r.type === 'wallpaper') return `/wallpaper/${r.slug}`
    if (r.type === 'ringtone') return `/ringtone/${r.slug}`
    return `/live-wallpaper/${r.slug}`
  }

  const getLabel = (type: string) => {
    if (type === 'wallpaper') return 'Wallpaper'
    if (type === 'ringtone') return 'Ringtone'
    return 'Live'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

      <div className="relative mb-8">
        <input
          type="search"
          placeholder="Search wallpapers, ringtones, live wallpapers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-5 py-4 text-lg focus:outline-none focus:border-green-600"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {query.length >= 2 && results.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-12">No results for &quot;{query}&quot;</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {results.map((r) => (
            <Link
              key={`${r.type}-${r.id}`}
              href={getHref(r)}
              className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-square block"
            >
              {r.thumbnail_url && (
                <Image
                  src={r.thumbnail_url}
                  alt={r.title}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <span className="text-xs bg-green-700 text-white px-1.5 py-0.5 rounded mb-1 inline-block">
                  {getLabel(r.type)}
                </span>
                <p className="text-white text-xs font-medium line-clamp-2">{r.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!query && (
        <div className="text-center py-16 text-gray-600">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Start typing to search</p>
        </div>
      )}
    </div>
  )
}
