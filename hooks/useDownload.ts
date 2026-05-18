'use client'

import { useState, useCallback } from 'react'
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
  item: DownloadItem | null
  openDownload: (item: DownloadItem) => void
  closeDownload: () => void
  startDownload: () => void
}

// Fetch timer duration from ad-settings edge function
async function getTimerDuration(isGuest: boolean): Promise<number> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ad-settings`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'x-user-type': isGuest ? 'guest' : 'free',
      },
    })
    if (!res.ok) return isGuest ? 5 : 0
    const data = await res.json()
    return isGuest
      ? (data?.data?.guest_timer_duration ?? 5)
      : (data?.data?.logged_in_timer_duration ?? 0)
  } catch {
    return isGuest ? 5 : 0
  }
}

// Increment download count in Supabase
async function incrementDownloadCount(item: DownloadItem) {
  const table =
    item.type === 'wallpaper' ? 'wallpapers' :
    item.type === 'ringtone' ? 'ringtones' :
    'live_wallpapers'
  const countCol =
    item.type === 'wallpaper' ? 'download_count' : 'downloads_count'

  try {
    await supabase.rpc('increment_download_count', {
      p_table: table,
      p_id: item.id,
      p_column: countCol,
    })
  } catch {
    // Fallback: direct update if RPC not available
    await supabase
      .from(table)
      .update({ [countCol]: supabase.rpc('increment', { x: 1 }) })
      .eq('id', item.id)
  }
}

// Trigger actual file download in browser
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
  const [item, setItem] = useState<DownloadItem | null>(null)
  const [timerReady, setTimerReady] = useState(false)

  const openDownload = useCallback(async (newItem: DownloadItem) => {
    // Premium wallpaper requires login
    if (newItem.is_premium && !user) {
      toast.error('Sign in to download premium wallpapers')
      return
    }

    setItem(newItem)
    setIsOpen(true)
    setIsDownloading(false)
    setTimerReady(false)

    const isGuest = !user
    const duration = isPremium ? 0 : await getTimerDuration(isGuest)

    if (duration > 0) {
      setCountdown(duration)
      // Start countdown
      let remaining = duration
      const interval = setInterval(() => {
        remaining -= 1
        setCountdown(remaining)
        if (remaining <= 0) {
          clearInterval(interval)
          setTimerReady(true)
        }
      }, 1000)
    } else {
      setCountdown(0)
      setTimerReady(true)
    }
  }, [user, isPremium])

  const closeDownload = useCallback(() => {
    setIsOpen(false)
    setItem(null)
    setCountdown(0)
    setTimerReady(false)
    setIsDownloading(false)
  }, [])

  const startDownload = useCallback(async () => {
    if (!item || isDownloading) return
    if (!timerReady && countdown > 0) {
      toast.error(`Please wait ${countdown} seconds`)
      return
    }

    setIsDownloading(true)
    try {
      // Increment counter
      await incrementDownloadCount(item)

      // Trigger download
      const ext = item.type === 'ringtone' ? 'mp3' : item.type === 'live' ? 'mp4' : 'jpg'
      triggerDownload(item.url, `${item.slug}.${ext}`)

      toast.success('Download started!')
      closeDownload()
    } catch (err) {
      toast.error('Download failed. Please try again.')
      console.error('Download error:', err)
    } finally {
      setIsDownloading(false)
    }
  }, [item, isDownloading, timerReady, countdown, closeDownload])

  return { isOpen, isDownloading, countdown, item, openDownload, closeDownload, startDownload }
}
