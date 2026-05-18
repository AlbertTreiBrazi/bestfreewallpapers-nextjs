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

function CountdownCircle({ value, max, color }: { value: number; max: number; color: string }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const progress = max > 0 ? (max - value) / max : 1
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#1f2937" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r}
        fill="none" stroke={color} strokeWidth="4"
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal — centrat pe orice ecran */}
      <div style={{
        position: 'relative',
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 20,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            background: '#1f2937', border: 'none',
            color: '#9ca3af', width: 30, height: 30,
            borderRadius: '50%', cursor: 'pointer',
            fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1,
          }}
        >×</button>

        <div style={{ padding: '22px 22px 24px' }}>
          {/* Header */}
          <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 20, margin: '0 0 4px', paddingRight: 36 }}>
            Download
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </p>

          {/* Badge */}
          <div style={{ marginBottom: 18 }}>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 9999,
              background: item.type === 'wallpaper' ? 'rgba(30,58,138,0.5)'
                : item.type === 'ringtone' ? 'rgba(20,83,45,0.5)'
                : 'rgba(88,28,135,0.5)',
              color: item.type === 'wallpaper' ? '#93c5fd'
                : item.type === 'ringtone' ? '#86efac'
                : '#d8b4fe',
            }}>
              {item.type === 'wallpaper' ? '🖼 Wallpaper'
                : item.type === 'ringtone' ? '🎵 Ringtone'
                : '🎬 Live Wallpaper'}
            </span>
            {item.is_premium && (
              <span style={{
                marginLeft: 8, fontSize: 11,
                background: 'rgba(161,98,7,0.35)', color: '#fcd34d',
                padding: '4px 12px', borderRadius: 9999,
              }}>⭐ Premium</span>
            )}
          </div>

          {/* ── AD ZONE — 300×250 on desktop, full-width on mobile ── */}
          {(userType === 'guest' || userType === 'free') && !canDownload && (
            <div
              id="ad-container"
              style={{
                width: '100%',
                aspectRatio: '6/5',        /* 300×250 ratio */
                maxHeight: 250,
                background: '#0d1117',
                border: '1px dashed #1f2937',
                borderRadius: 12,
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <span style={{ position: 'absolute', top: 6, right: 10, fontSize: 9, color: '#374151' }}>Ad</span>
              {/* ↓ Înlocuiește cu codul Adsterra / Google AdSense */}
              <p style={{ color: '#374151', fontSize: 12, textAlign: 'center', margin: 0 }}>Advertisement</p>
            </div>
          )}

          {/* ── TIMER — compact, sub reclamă ── */}
          {(userType === 'guest' || userType === 'free') && !canDownload && (
            <div style={{
              background: '#1a2035',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <CountdownCircle value={countdown} max={maxDuration} color={timerColor} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                }}>{countdown}</div>
              </div>

              <div style={{ flex: 1 }}>
                {userType === 'guest' && (
                  <>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>
                      Download starts in <span style={{ color: '#dc2626' }}>{countdown}s</span>
                    </p>
                    <p style={{ color: '#6b7280', fontSize: 11, margin: '0 0 8px' }}>
                      Create a free account to reduce wait time
                    </p>
                    <button
                      onClick={onOpenAuth}
                      style={{
                        background: '#16a34a', color: '#fff', border: 'none',
                        borderRadius: 6, fontSize: 12, padding: '5px 12px',
                        cursor: 'pointer', fontWeight: 500,
                      }}
                    >Sign in — skip to 6s</button>
                  </>
                )}
                {userType === 'free' && (
                  <>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>
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

          {/* Premium */}
          {userType === 'premium' && (
            <div style={{
              background: 'rgba(161,98,7,0.12)',
              border: '1px solid rgba(161,98,7,0.25)',
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 24 }}>⭐</span>
              <div>
                <p style={{ color: '#fcd34d', fontSize: 14, fontWeight: 500, margin: '0 0 2px' }}>Premium member</p>
                <p style={{ color: '#78350f', fontSize: 12, margin: 0 }}>Instant download — no waiting</p>
              </div>
            </div>
          )}

          {/* Download button */}
          <button
            onClick={onDownload}
            disabled={!canDownload || isDownloading}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 14, border: 'none',
              fontSize: 17, fontWeight: 600,
              cursor: canDownload && !isDownloading ? 'pointer' : 'not-allowed',
              background: canDownload && !isDownloading ? '#15803d' : '#1f2937',
              color: canDownload && !isDownloading ? '#fff' : '#4b5563',
              transition: 'all 0.2s',
            }}
          >
            {isDownloading
              ? '⏳ Downloading...'
              : !canDownload
              ? `Please wait ${countdown}s...`
              : '↓ Download Free'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#374151', margin: '10px 0 0' }}>
            Free for personal use · No registration required
          </p>
        </div>
      </div>
    </div>
  )
}
