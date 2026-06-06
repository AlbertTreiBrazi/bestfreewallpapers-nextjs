'use client'

import { useEffect, useState, useCallback } from 'react'

/**
 * Cookie consent — GDPR + Google Consent Mode v2.
 *
 * Categories:
 *  - necessary    → always on (auth, security, core site function)
 *  - analytics    → analytics_storage (e.g. Google Analytics)
 *  - advertising  → ad_storage + ad_user_data + ad_personalization (AdSense / Adsterra)
 *
 * Until the user chooses, advertising + analytics are DENIED (default in ConsentModeInit).
 * This is what keeps you compliant in the EU and is required before personalized ads.
 */

export const CONSENT_KEY = 'bfw_cookie_consent_v1'
export const CONSENT_VERSION = 1

// Custom event fired whenever consent changes — the banner and any ad/analytics
// loader can listen to this to react without a full reload.
export const CONSENT_EVENT = 'bfw:consent-change'

export interface ConsentState {
  necessary: true
  analytics: boolean
  advertising: boolean
  timestamp: number
  version: number
}

type ConsentChoice = Pick<ConsentState, 'analytics' | 'advertising'>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    openCookieSettings?: () => void
  }
}

/** Read consent from localStorage. Returns null if never set or version changed. */
export function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    // If we ever bump the consent version (new category, policy change),
    // old consent is invalidated and we re-ask.
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

/** Push the user's choice into Google Consent Mode v2. Safe to call even before gtag exists. */
export function updateGoogleConsent(choice: ConsentChoice) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  const gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer!.push(args)
    })
  gtag('consent', 'update', {
    ad_storage: choice.advertising ? 'granted' : 'denied',
    ad_user_data: choice.advertising ? 'granted' : 'denied',
    ad_personalization: choice.advertising ? 'granted' : 'denied',
    analytics_storage: choice.analytics ? 'granted' : 'denied',
  })
}

/** Persist the choice, update Consent Mode, and broadcast the change. */
export function saveConsent(choice: ConsentChoice): ConsentState {
  const state: ConsentState = {
    necessary: true,
    analytics: choice.analytics,
    advertising: choice.advertising,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(state))
    } catch {
      /* storage might be blocked — Consent Mode update below still applies for the session */
    }
    updateGoogleConsent(choice)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }))
  }
  return state
}

/** Convenience: has the user advertising consent right now? Use before loading personalized ads. */
export function hasAdConsent(): boolean {
  return getStoredConsent()?.advertising === true
}

/** Convenience: has the user analytics consent right now? */
export function hasAnalyticsConsent(): boolean {
  return getStoredConsent()?.analytics === true
}

/**
 * React hook. Returns current consent (or null if undecided) and helpers.
 * Re-renders automatically when consent changes anywhere in the app.
 */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setConsent(getStoredConsent())
    setReady(true)

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail
      setConsent(detail ?? getStoredConsent())
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  const accept = useCallback((choice: ConsentChoice) => {
    setConsent(saveConsent(choice))
  }, [])

  return {
    consent,
    ready,
    hasDecided: consent !== null,
    hasAdConsent: consent?.advertising === true,
    hasAnalyticsConsent: consent?.analytics === true,
    accept,
  }
}
