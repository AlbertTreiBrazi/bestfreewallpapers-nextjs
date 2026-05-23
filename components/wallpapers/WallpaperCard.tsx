'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

interface WallpaperCardProps {
  id: number
  title: string
  slug: string
  thumbnail_url: string | null
  is_premium: boolean
  download_count?: number
  created_at?: string
}

export default function WallpaperCard({ id, title, slug, thumbnail_url, is_premium, download_count, created_at }: WallpaperCardProps) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const faved = isFavorite(id, 'wallpaper')

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(id, 'wallpaper')
  }

  return (
    <Link href={`/wallpaper/${slug}`} className="group relative rounded-lg overflow-hidden bg-gray-800 aspect-[9/16] block" onContextMenu={(e) => e.preventDefault()}>
      {thumbnail_url ? (
        <Image src={thumbnail_url} alt={title} fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {is_premium && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          PRO
        </div>
      )}
      {!is_premium && isNew(created_at) && (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">NEW</div>
      )}
      <button onClick={handleFavorite} aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
        className={`absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${faved ? 'bg-red-500 text-white opacity-100' : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'}`}>
        <svg className="w-4 h-4" fill={faved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-xs font-medium line-clamp-2">{title}</p>
        {download_count !== undefined && download_count > 0 && (
          <p className="text-gray-300 text-xs mt-0.5">⬇ {download_count.toLocaleString()}</p>
        )}
      </div>
    </Link>
  )
}
