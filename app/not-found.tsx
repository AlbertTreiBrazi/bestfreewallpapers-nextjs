import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-700 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-white mb-3">Page not found</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The wallpaper, ringtone or page you are looking for does not exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/wallpapers"
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Wallpapers
        </Link>
      </div>
    </div>
  )
}
