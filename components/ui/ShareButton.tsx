'use client'

import { useState } from 'react'

interface Props {
  title: string
  url?: string
  size?: 'sm' | 'md'
}

export default function ShareButton({ title, url, size = 'md' }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
    const shareData = { title, url: shareUrl }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

  return (
    <button
      onClick={handleShare}
      title={copied ? 'Link copied!' : 'Share'}
      aria-label={copied ? 'Link copied!' : 'Share'}
      className={`${btnSize} rounded-full flex items-center justify-center transition-all duration-200 ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
      }`}
    >
      {copied ? (
        <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={iconSize} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
    </button>
  )
}
