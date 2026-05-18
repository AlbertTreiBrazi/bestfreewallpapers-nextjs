'use client'

import { useEffect } from 'react'
import type { DownloadItem } from '@/hooks/useDownload'

interface Props {
  isOpen: boolean
  item: DownloadItem | null
  countdown: number
  canDownload: boolean
  isDownloading: boolean
  userType: 'guest' | 'free' | 'premium'
  onClose: () => void
  onDownload: () => void
  onOpenAuth?: () => void
}

// Circular progress SVG
function CountdownCircle({ value, max, color }: { value: number; max: number; color: string }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const progress = max > 0 ? ((max - value) / max) : 1
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90" style={{ flexShrink: 0 }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="#374151" strokeWidth="3.5" />
      <circle
        cx="22" cy="22" r={r}
        fill="none" stroke={color} strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - progress)}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  )
}

export default function DownloadModal({
  isOpen, item, countdown, canDownload, isDownloading,
  userType, onClose, onDownload, onOpenAuth
}: Props) {

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  const maxDuration = userType === 'guest' ? 15 : userType === 'free' ? 6 : 0
  const timerColor = userType === 'guest' ? '#dc2626' : '#16a34a'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal — slides up from bottom on mobile */}
      <div style={{
        position: 'relative',
        background: '#111827',
        border: '1px solid #374151',
        borderRadius: '20px 20px 0 0',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: '#374151', borderRadius: 2, margin: '12px auto 0', cursor: 'grab' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: '#1f2937', border: 'none', color: '#9ca3af', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
        >
          ×
        </button>

        <div style={{ padding: '12px 20px 24px' }}>
          {/* Header */}
          <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 18, margin: '0 0 4px' }}>Download</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </p>

          {/* File type badge */}
          <div style={{ marginBottom: 16 }}>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 9999,
              background: item.type === 'wallpaper' ? 'rgba(30,58,138,0.5)' : item.type === 'ringtone' ? 'rgba(20,83,45,0.5)' : 'rgba(88,28,135,0.5)',
              color: item.type === 'wallpaper' ? '#93c5fd' : item.type === 'ringtone' ? '#86efac' : '#d8b4fe',
            }}>
              {item.type === 'wallpaper' ? '🖼 Wallpaper' : item.type === 'ringtone' ? '🎵 Ringtone' : '🎬 Live Wallpaper'}
            </span>
            {item.is_premium && (
              <span style={{ marginLeft: 8, fontSize: 11, background: 'rgba(161,98,7,0.4)', color: '#fcd34d', padding: '3px 10px', borderRadius: 9999 }}>
                ⭐ Premium
              </span>
            )}
          </div>

          {/* ═══ AD ZONE — DEASUPRA TIMER-ULUI ═══ */}
          {(userType === 'guest' || userType === 'free') && !canDownload && (
            <div
              id="ad-container"
              style={{
                width: '100%',
                minHeight: 100,
                background: '#0d1117',
                border: '1px dashed #2d3748',
                borderRadius: 12,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Ad label */}
              <span style={{ position: 'absolute', top: 4, right: 8, fontSize: 9, color: '#4b5563' }}>Ad</span>
              {/* Placeholder — înlocuiește cu codul Adsterra */}
              <p style={{ color: '#374151', fontSize: 12, textAlign: 'center', margin: 0 }}>
                Advertisement
              </p>
            </div>
          )}

          {/* ═══ TIMER — SUB RECLAMĂ ═══ */}
          {(userType === 'guest' || userType === 'free') && !canDownload && (
            <div style={{
              background: '#1f2937',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              {/* Circle countdown */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <CountdownCircle value={countdown} max={maxDuration} color={timerColor} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                }}>
                  {countdown}
                </div>
              </div>

              {/* Text + CTA */}
              <div style={{ flex: 1 }}>
                {userType === 'guest' && (
                  <>
                    <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, margin: '0 0 3px' }}>
                      Download starts in <span style={{ color: '#dc2626' }}>{countdown}s</span>
                    </p>
                    <p style={{ color: '#6b7280', fontSize: 11, margin: '0 0 6px' }}>
                      Create a free account to reduce wait time
                    </p>
                    <button
                      onClick={onOpenAuth}
                      style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Sign in — skip to 6s
                    </button>
                  </>
                )}
                {userType === 'free' && (
                  <>
                    <p style={{ color: '#fff', fontSize: 12, fontWeight: 500, margin: '0 0 3px' }}>
                      Almost ready — <span style={{ color: '#16a34a' }}>{countdown}s</span>
                    </p>
                    <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>
                      ⭐ Premium = instant download, no timer
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Premium badge */}
          {userType === 'premium' && (
            <div style={{
              background: 'rgba(161,98,7,0.15)',
              border: '1px solid rgba(161,98,7,0.3)',
              borderRadius: 12, padding: '12px 16px',
              marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <div>
                <p style={{ color: '#fcd34d', fontSize: 13, fontWeight: 500, margin: '0 0 2px' }}>Premium member</p>
                <p style={{ color: '#92400e', fontSize: 11, margin: 0 }}>Instant download — no waiting</p>
              </div>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={onDownload}
            disabled={!canDownload || isDownloading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              border: 'none',
              fontSize: 17,
              fontWeight: 600,
              cursor: canDownload && !isDownloading ? 'pointer' : 'not-allowed',
              background: canDownload && !isDownloading ? '#15803d' : '#1f2937',
              color: canDownload && !isDownloading ? '#fff' : '#4b5563',
              transition: 'all 0.2s',
            }}
          >
            {isDownloading ? '⏳ Downloading...' : !canDownload ? `Please wait ${countdown}s...` : '↓ Download Free'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', margin: '10px 0 0' }}>
            Free for personal use · No registration required
          </p>
        </div>
      </div>
    </div>
  )
}
