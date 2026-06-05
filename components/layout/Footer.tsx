import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Wallpapers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/wallpapers" className="hover:text-white transition-colors">All Wallpapers</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/collections" className="hover:text-white transition-colors">Collections</Link></li>
              <li><Link href="/live-wallpapers" className="hover:text-white transition-colors">Live Wallpapers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Ringtones</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/ringtones" className="hover:text-white transition-colors">All Ringtones</Link></li>
              <li><Link href="/ringtones/how-to-set" className="hover:text-white transition-colors">How to Set</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Devices</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/collections/iphone-wallpapers" className="hover:text-white transition-colors">iPhone Wallpapers</Link></li>
              <li><Link href="/collections/android-wallpapers" className="hover:text-white transition-colors">Android Wallpapers</Link></li>
              <li><Link href="/mobile-wallpapers" className="hover:text-white transition-colors">Mobile Wallpapers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Info</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/license" className="hover:text-white transition-colors">License</Link></li>
              <li><Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} BestFreeWallpapers.com — Free for personal use
          </p>
          <p className="text-gray-500 text-xs">
            Made with ❤ for wallpaper lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
