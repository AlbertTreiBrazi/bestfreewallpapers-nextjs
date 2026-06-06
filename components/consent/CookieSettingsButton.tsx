'use client'

/**
 * Drop this anywhere (e.g. in your Footer links) to let users change their
 * cookie choices after the first visit. GDPR requires a way to withdraw consent.
 *
 * Usage in Footer.tsx:
 *   import CookieSettingsButton from '@/components/consent/CookieSettingsButton'
 *   ...
 *   <CookieSettingsButton />
 *
 * Or, if you prefer a plain link with your own styling, just call:
 *   onClick={() => window.openCookieSettings?.()}
 */
export default function CookieSettingsButton({
  className = 'text-gray-400 hover:text-gray-200 transition-colors',
  label = 'Cookie Settings',
}: {
  className?: string
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.openCookieSettings?.()}
      className={className}
    >
      {label}
    </button>
  )
}
