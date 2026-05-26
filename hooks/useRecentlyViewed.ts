'use client'

import { useEffect, useState, useCallback } from 'react'

export type RecentItemType = 'wallpaper' | 'live' | 'ringtone'

export interface RecentItem {
  id: number
  type: RecentItemType
  title: string
  slug: string
  thumbnail_url: string | null
  visited_at: number // timestamp
}

const STORAGE_KEY = 'bfw_recently_viewed'
const MAX_ITEMS = 20

function readStorage(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeStorage(items: RecentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([])

  // Load on mount (client only)
  useEffect(() => {
    setItems(readStorage())
  }, [])

  const addItem = useCallback((item: Omit<RecentItem, 'visited_at'>) => {
    setItems(prev => {
      // Remove duplicate (same id + type)
      const filtered = prev.filter(i => !(i.id === item.id && i.type === item.type))
      // Add to front, cap at MAX_ITEMS
      const updated = [{ ...item, visited_at: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
      writeStorage(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setItems([])
  }, [])

  return { items, addItem, clearAll }
}
