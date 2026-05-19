'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface FavoritesState {
  wallpaperIds: Set<number>
  ringtoneIds: Set<number>
  liveIds: Set<number>
  loading: boolean
}

// Global state shared across components
let globalState: FavoritesState = {
  wallpaperIds: new Set(),
  ringtoneIds: new Set(),
  liveIds: new Set(),
  loading: false,
}
let listeners: Array<() => void> = []
let loaded = false

function notify() {
  listeners.forEach(fn => fn())
}

async function loadFavorites(userId: string) {
  if (globalState.loading) return
  globalState = { ...globalState, loading: true }
  notify()

  try {
    const [wallRes, ringRes, liveRes] = await Promise.all([
      supabase.from('favorites').select('wallpaper_id').eq('user_id', userId),
      supabase.from('ringtone_favorites').select('ringtone_id').eq('user_id', userId),
      supabase.from('live_wallpaper_favorites').select('live_wallpaper_id').eq('user_id', userId),
    ])

    globalState = {
      wallpaperIds: new Set((wallRes.data || []).map((r: any) => r.wallpaper_id)),
      ringtoneIds: new Set((ringRes.data || []).map((r: any) => r.ringtone_id)),
      liveIds: new Set((liveRes.data || []).map((r: any) => r.live_wallpaper_id)),
      loading: false,
    }
    loaded = true
  } catch {
    globalState = { ...globalState, loading: false }
  }
  notify()
}

export function useFavorites() {
  const { user } = useAuth()
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1)
    listeners.push(listener)
    return () => { listeners = listeners.filter(l => l !== listener) }
  }, [])

  // Load favorites when user logs in
  useEffect(() => {
    if (user && !loaded) {
      loadFavorites(user.id)
    }
    if (!user) {
      globalState = { wallpaperIds: new Set(), ringtoneIds: new Set(), liveIds: new Set(), loading: false }
      loaded = false
      notify()
    }
  }, [user])

  const isFavorite = useCallback((id: number, type: 'wallpaper' | 'ringtone' | 'live') => {
    if (type === 'wallpaper') return globalState.wallpaperIds.has(id)
    if (type === 'ringtone') return globalState.ringtoneIds.has(id)
    return globalState.liveIds.has(id)
  }, [])

  const toggleFavorite = useCallback(async (id: number, type: 'wallpaper' | 'ringtone' | 'live') => {
    if (!user) {
      toast.error('Sign in to save favorites')
      return
    }

    const table = type === 'wallpaper' ? 'favorites' : type === 'ringtone' ? 'ringtone_favorites' : 'live_wallpaper_favorites'
    const idCol = type === 'wallpaper' ? 'wallpaper_id' : type === 'ringtone' ? 'ringtone_id' : 'live_wallpaper_id'
    const set = type === 'wallpaper' ? globalState.wallpaperIds : type === 'ringtone' ? globalState.ringtoneIds : globalState.liveIds
    const isFaved = set.has(id)

    // Optimistic update
    const newSet = new Set(set)
    if (isFaved) newSet.delete(id)
    else newSet.add(id)

    if (type === 'wallpaper') globalState = { ...globalState, wallpaperIds: newSet }
    else if (type === 'ringtone') globalState = { ...globalState, ringtoneIds: newSet }
    else globalState = { ...globalState, liveIds: newSet }
    notify()

    try {
      if (isFaved) {
        const { error } = await supabase.from(table).delete().eq('user_id', user.id).eq(idCol, id)
        if (error) throw error
        toast.success('Removed from favorites')
      } else {
        const { error } = await supabase.from(table).upsert(
          { user_id: user.id, [idCol]: id },
          { onConflict: `user_id,${idCol}` }
        )
        if (error) throw error
        toast.success('Added to favorites ❤️')
      }
    } catch (err: any) {
      // Rollback optimistic update
      if (isFaved) newSet.add(id)
      else newSet.delete(id)
      if (type === 'wallpaper') globalState = { ...globalState, wallpaperIds: newSet }
      else if (type === 'ringtone') globalState = { ...globalState, ringtoneIds: newSet }
      else globalState = { ...globalState, liveIds: newSet }
      notify()
      toast.error('Failed to update favorites')
    }
  }, [user])

  return {
    isFavorite,
    toggleFavorite,
    loading: globalState.loading,
    wallpaperIds: globalState.wallpaperIds,
    ringtoneIds: globalState.ringtoneIds,
    liveIds: globalState.liveIds,
  }
}
