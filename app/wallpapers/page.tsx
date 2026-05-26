import { Suspense } from 'react'
import WallpapersClient from './WallpapersClient'

export const metadata = {
  title: 'Free HD Wallpapers — iPhone, Android & Desktop Backgrounds',
  description: 'Browse and download 4K & HD wallpapers for iPhone, Android, iPad and desktop. Filter by device, sort by popular or newest. No sign-up required.',
  alternates: { canonical: 'https://bestfreewallpapers.com/wallpapers' },
}

export default function WallpapersPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 w-64 bg-gray-800 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-800 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-lg bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <WallpapersClient />
    </Suspense>
  )
}
