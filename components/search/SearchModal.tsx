'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface SearchResult {
  id: number
  title: string
  slug: string
  thumbnail_url: string | null
  type: 'wallpaper' | 'ringtone' | 'live'
}

interface PopularTag {
  tag: string
  count: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

const POPULAR_TAGS = [
  'aesthetic', 'anime', 'nature', 'space', 'minimalist',
  'dark', 'cute', 'abstract', 'sunset', 'flowers',
  'galaxy', 'ocean', 'mountains', 'city', 'neon'
]

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'wallpapers' | 'ringtones' | 'live'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const search = useCallback(async (q: string, filter: typeof activeFilter) => {
    if (!q.trim() || q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const queries = []

      if (filter === 'all' || filter === 'wallpapers') {
        queries.push(
          supabase.from('wallpapers').select('id, title, slug, thumbnail_url')
            .eq('is_active', true).ilike('title', `%${q}%`).limit(filter === 'all' ? 8 : 16)
        )
      }
      if (filter === 'all' || filter === 'ringtones') {
        queries.push(
          supabase.from('ringtones').select('id, title, slug, cover_image_url')
            .eq('is_active', true).eq('is_published', true).ilike('title', `%${q}%`).limit(filter === 'all' ? 4 : 16)
        )
      }
      if (filter === 'all' || filter === 'live') {
        queries.push(
          supabase.from('live_wallpapers').select('id, title, slug, thumbnail_url')
            .eq('is_active', true).eq('is_published', true).ilike('title', `%${q}%`).limit(filter === 'all' ? 4 : 16)
        )
      }

      const responses = await Promise.all(queries)
      const combined: SearchResult[] = []

      let idx = 0
      if (filter === 'all' || filter === 'wallpapers') {
        const data = responses[idx++].data || []
        combined.push(...data.map((w: any) => ({ ...w, type: 'wallpaper' as const })))
      }
      if (filter === 'all' || filter === 'ringtones') {
        const data = responses[idx++].data || []
        combined.push(...data.map((r: any) => ({ id: r.id, title: r.title, slug: r.slug, thumbnail_url: r.cover_image_url, type: 'ringtone' as const })))
      }
      if (filter === 'all' || filter === 'live') {
        const data = responses[idx++].data || []
        combined.push(...data.map((l: any) => ({ ...l, type: 'live' as const })))
      }

      setResults(combined)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleQueryChange = (q: string) => {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q, activeFilter), 350)
  }

  const handleFilterChange = (f: typeof activeFilter) => {
    setActiveFilter(f)
    if (query.length >= 2) search(query, f)
  }

  const handleTagClick = (tag: string) => {
    setQuery(tag)
    search(tag, activeFilter)
  }

  const handleResultClick = (result: SearchResult) => {
    const href =
      result.type === 'wallpaper' ? `/wallpaper/${result.slug}` :
      result.type === 'ringtone' ? `/ringtone/${result.slug}` :
      `/live-wallpaper/${result.slug}`
    router.push(href)
    onClose()
  }

  const typeLabel = (type: string) => {
    if (type === 'wallpaper') return { label: 'Wallpaper', color: '#3b82f6' }
    if (type === 'ringtone') return { label: 'Ringtone', color: '#22c55e' }
    return { label: 'Live', color: '#a855f7' }
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px 16px' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 680,
        background: '#111827', borderRadius: 16,
        border: '1px solid #1f2937', boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #1f2937' }}>
          {loading ? (
            <div style={{ width: 20, height: 20, border: '2px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          ) : (
            <svg style={{ width: 20, height: 20, color: '#6b7280', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search wallpapers, ringtones, live..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 16, caretColor: '#16a34a',
            }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]) }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button onClick={onClose} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}>
            ESC
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderBottom: '1px solid #1f2937' }}>
          {(['all', 'wallpapers', 'ringtones', 'live'] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              style={{
                padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
                background: activeFilter === f ? '#16a34a' : '#1f2937',
                color: activeFilter === f ? '#fff' : '#9ca3af',
              }}
            >
              {f === 'all' ? 'All' : f === 'wallpapers' ? '🖼 Wallpapers' : f === 'ringtones' ? '🎵 Ringtones' : '🎬 Live'}
            </button>
          ))}
        </div>

        {/* Results */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Popular tags — when no query */}
          {!query && (
            <div style={{ padding: '16px 20px' }}>
              <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Trending searches
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    style={{
                      background: '#1f2937', border: '1px solid #374151',
                      color: '#d1d5db', borderRadius: 20, padding: '5px 12px',
                      fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.borderColor = '#16a34a'; (e.target as HTMLButtonElement).style.color = '#fff' }}
                    onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.borderColor = '#374151'; (e.target as HTMLButtonElement).style.color = '#d1d5db' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
              No results for &quot;{query}&quot;
            </div>
          )}

          {/* Results grid */}
          {results.length > 0 && (
            <div style={{ padding: '12px 20px 20px' }}>
              <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
                {results.length} results for &quot;{query}&quot;
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {results.map((r) => {
                  const { label, color } = typeLabel(r.type)
                  return (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => handleResultClick(r)}
                      style={{
                        background: '#1f2937', border: '1px solid #374151',
                        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                        textAlign: 'left', padding: 0, transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#374151'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#374151'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                    >
                      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#111827' }}>
                        {r.thumbnail_url && (
                          <Image
                            src={r.thumbnail_url}
                            alt={r.title}
                            fill
                            sizes="120px"
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                        <span style={{
                          position: 'absolute', top: 4, right: 4,
                          background: color, color: '#fff',
                          fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                        }}>
                          {label}
                        </span>
                      </div>
                      <div style={{ padding: '6px 8px' }}>
                        <p style={{ color: '#fff', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                          {r.title}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid #111827', display: 'flex', gap: 16, color: '#374151', fontSize: 11 }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>ESC close</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
