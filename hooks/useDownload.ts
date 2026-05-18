'use client'

import { useState, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, SUPABASE_URL } from '@/lib/supabase'
import toast from 'react-hot-toast'

export interface DownloadItem {
  id: number
  title: string
  slug: string
  url: string
  type: 'wallpaper' | 'ringtone' | 'live'
  is_premium?: boolean
}

interface UseDownloadReturn {
  isOpen: boolean
  isDownloading: boolean
  countdown: number
  canDownload: boolean
  item: DownloadItem | null
  userType: 'guest' | 'free' | 'premium'
  openDownload: (item: DownloadItem) => void
  closeDownload: () => void
  startDownload: () => void
}

// Fix CORS: use query param instead of custom header
async function getTimerDuration(userType: 'guest' | 'free'): Promise<number> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/ad-settings?type=${userType}`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      }
    )
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    return userType === 'guest'
      ? (data?.data?.guest_timer_duration ?? 15)
      : (data?.data?.logged_in_timer_duration ?? 6)
  } catch {
    return userType === 'guest' ? 15 : 6
  }
}

// Fix 404: direct UPDATE instead of missing RPC
async function incrementDownloadCount(item: DownloadItem) {
  const table =
    item.type === 'wallpaper' ? 'wallpapers' :
    item.type === 'ringtone' ? 'ringtones' :
    'live_wallpapers'
  const countCol = item.type === 'wallpaper' ? 'download_count' : 'downloads_count'

  try {
    const { data: current } = await supabase
      .from(table)
      .select('*')
      .eq('id', item.id)
      .single()

    if (current) {
      const row = current as Record<string, unknown>
      const newVal = ((row[countCol] as number) || 0) + 1
      const patch: Record<string, unknown> = {}
      patch[countCol] = newVal
      await supabase.from(table).update(patch).eq('id', item.id)
    }
  } catch {
    // Silently fail — don't block download on counter error
  }
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function useDownload(): UseDownloadReturn {
  const { user, isPremium } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canDownload, setCanDownload] = useState(false)
  const [item, setItem] = useState<DownloadItem | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const userType: 'guest' | 'free' | 'premium' = !user
    ? 'guest' : isPremium ? 'premium' : 'free'

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const openDownload = useCallback(async (newItem: DownloadItem) => {
    if (newItem.is_premium && !user) {
      toast.error('Sign in to download premium wallpapers')
      return
    }

    clearTimer()
    setItem(newItem)
    setIsOpen(true)
    setIsDownloading(false)
    setCanDownload(false)

    const currentUserType: 'guest' | 'free' | 'premium' =
      !user ? 'guest' : isPremium ? 'premium' : 'free'

    if (currentUserType === 'premium') {
      setCountdown(0)
      setCanDownload(true)
      return
    }

    const duration = await getTimerDuration(currentUserType)
    setCountdown(duration)
    setCanDownload(false)

    let remaining = duration
    intervalRef.current = setInterval(() => {
      remaining -= 1
      setCountdown(remaining)
      if (remaining <= 0) {
        clearTimer()
        setCountdown(0)
        setCanDownload(true)
      }
    }, 1000)
  }, [user, isPremium])

  const closeDownload = useCallback(() => {
    clearTimer()
    setIsOpen(false)
    setItem(null)
    setCountdown(0)
    setCanDownload(false)
    setIsDownloading(false)
  }, [])

  const startDownload = useCallback(async () => {
    if (!item || isDownloading || !canDownload) return
    setIsDownloading(true)
    try {
      await incrementDownloadCount(item)
      const ext = item.type === 'ringtone' ? 'mp3' : item.type === 'live' ? 'mp4' : 'jpg'
      triggerDownload(item.url, `${item.slug}.${ext}`)
      toast.success('Download started!')
      closeDownload()
    } catch {
      toast.error('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }, [item, isDownloading, canDownload, closeDownload])

  return { isOpen, isDownloading, countdown, canDownload, item, userType, openDownload, closeDownload, startDownload }
}
