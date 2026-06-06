'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Cookie, Shield, BarChart3, Megaphone, X } from 'lucide-react'
import { getStoredConsent, saveConsent } from '@/lib/consent'

// Footer (or anywhere) can re-open the panel by dispatching this event,
// or by calling window.openCookieSettings().
const OPEN_EVENT = 'bfw:open-cookie-settings'

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [showPrefs, setShowPrefs] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [advertising, setAdvertising] = useState(false)

  // Decide whether to show on first paint, and wire up the re-open hook.
  useEffect(() => {
    setMounted(true)
    const existing = getStoredConsent()
    if (!existing) {
      setOpen(true)
    } else {
      setAnalytics(existing.analytics)
      setAdvertising(existing.advertising)
    }

    const reopen = () => {
      const cur = getStoredConsent()
      setAnalytics(cur?.analytics ?? false)
      setAdvertising(cur?.advertising ?? false)
      setShowPrefs(true)
      setOpen(true)
    }
    window.openCookieSettings = reopen
    window.addEventListener(OPEN_EVENT, reopen)
    return () => {
      window.removeEventListener(OPEN_EVENT, reopen)
      if (window.openCookieSettings === reopen) delete window.openCookieSettings
    }
  }, [])

  const commit = useCallback((choice: { analytics: boolean; advertising: boolean }) => {
    saveConsent(choice)
    setOpen(false)
    setShowPrefs(false)
  }, [])

  const acceptAll = () => commit({ analytics: true, advertising: true })
  const rejectAll = () => commit({ analytics: false, advertising: false })
  const savePrefs = () => commit({ analytics, advertising })

  if (!mounted || !open) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4 animate-[bfwSlideUp_0.35s_ease-out]"
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      <style>{`@keyframes bfwSlideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-800 bg-gray-950/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-green-600/15 text-green-500">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-100">We use cookies</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-400">
              We use necessary cookies to make the site work, plus optional cookies for
              analytics and ads. You can accept all, reject optional ones, or choose what to allow.{' '}
              <Link href="/cookie-policy" className="text-green-500 underline-offset-2 hover:underline">
                Cookie Policy
              </Link>{' '}
              ·{' '}
              <Link href="/privacy" className="text-green-500 underline-offset-2 hover:underline">
                Privacy
              </Link>
            </p>
          </div>
          {getStoredConsent() && (
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex-none rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Preferences (expandable) */}
        {showPrefs && (
          <div className="space-y-2 border-t border-gray-800 px-4 py-3 sm:px-5">
            <PrefRow
              icon={<Shield className="h-4 w-4" />}
              title="Necessary"
              desc="Required for sign-in, security and core features. Always on."
              checked
              locked
            />
            <PrefRow
              icon={<BarChart3 className="h-4 w-4" />}
              title="Analytics"
              desc="Helps us understand how the site is used so we can improve it."
              checked={analytics}
              onChange={setAnalytics}
            />
            <PrefRow
              icon={<Megaphone className="h-4 w-4" />}
              title="Advertising"
              desc="Used to show ads and support free downloads. Enables personalized ads."
              checked={advertising}
              onChange={setAdvertising}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-gray-800 p-3 sm:flex-row sm:items-center sm:justify-end sm:p-4">
          {!showPrefs ? (
            <button
              onClick={() => setShowPrefs(true)}
              className="order-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 sm:order-1 sm:mr-auto"
            >
              Customize
            </button>
          ) : (
            <button
              onClick={savePrefs}
              className="order-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 sm:order-1 sm:mr-auto"
            >
              Save choices
            </button>
          )}

          <button
            onClick={rejectAll}
            className="order-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-800"
          >
            Reject all
          </button>
          <button
            onClick={acceptAll}
            className="order-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 sm:order-3"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}

function PrefRow({
  icon,
  title,
  desc,
  checked,
  locked,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  checked: boolean
  locked?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-900/60 p-3">
      <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-gray-800 text-gray-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-gray-200">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-gray-500">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={locked}
        onClick={() => !locked && onChange?.(!checked)}
        className={[
          'relative mt-0.5 inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors',
          checked ? 'bg-green-600' : 'bg-gray-700',
          locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
