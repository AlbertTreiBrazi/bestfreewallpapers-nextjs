'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BF</span>
          </div>
          <span className="text-white font-semibold text-sm hidden sm:block">
            BestFreeWallpapers
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/wallpapers', label: 'Wallpapers' },
            { href: '/live-wallpapers', label: 'Live' },
            { href: '/ringtones', label: 'Ringtones' },
            { href: '/categories', label: 'Categories' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search */}
          <Link
            href="/search"
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-1">
          {[
            { href: '/wallpapers', label: 'Wallpapers' },
            { href: '/live-wallpapers', label: 'Live Wallpapers' },
            { href: '/ringtones', label: 'Ringtones' },
            { href: '/categories', label: 'Categories' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
