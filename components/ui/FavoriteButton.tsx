'use client'

import { useFavorites } from '@/hooks/useFavorites'

interface Props {
  id: number
  type: 'wallpaper' | 'ringtone' | 'live'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FavoriteButton({ id, type, size = 'md', className = '' }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(id, type)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }
  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }

  return (
    <button
      onClick={() => toggleFavorite(id, type)}
      aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
        faved
          ? 'bg-red-500 text-white'
          : 'bg-gray-700 text-gray-400 hover:bg-red-500 hover:text-white'
      } ${className}`}
    >
      <svg
        className={iconSizes[size]}
        fill={faved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
