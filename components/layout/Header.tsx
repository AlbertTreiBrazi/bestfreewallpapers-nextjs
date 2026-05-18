'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/auth/AuthModal'

export default function Header() {
  const { user, profile, signOut, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const openLogin = () => { setAuthTab('login'); setAuthOpen(true) }
  const openRegister = () => { setAuthTab('register'); setAuthOpen(true) }

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BF</span>
            </div>
            <span className="text-white font-semibold text-sm hidden sm:block">BestFreeWallpapers</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/wallpapers', label: 'Wallpapers' },
              { href: '/live-wallpapers', label: 'Live' },
              { href: '/ringtones', label: 'Ringtones' },
              { href: '/categories', label: 'Categories' },
              { href: '/collections', label: 'Collections' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/search" className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </Link>
            <Link href="/favorites" className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors hidden sm:block" aria-label="Favorites">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </Link>

            {!loading && (
              user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-xl px-3 py-2 transition-colors">
                    <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{(profile?.full_name || user.email || 'U')[0].toUpperCase()}</span>
                    </div>
                    <span className="text-white text-sm hidden sm:block max-w-[100px] truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-gray-400 text-xs truncate">{user.email}</p>
                      </div>
                      <Link href="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        ❤ My Favorites
                      </Link>
                      {profile?.is_admin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                          ⚙ Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { signOut(); setUserMenuOpen(false) }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-700">
                        → Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={openLogin} className="text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">Sign In</button>
                  <button onClick={openRegister} className="bg-green-700 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Register</button>
                </div>
              )
            )}

            <button className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-1">
            {['/wallpapers', '/live-wallpapers', '/ringtones', '/categories', '/collections', '/favorites'].map((href) => (
              <Link key={href} href={href} className="block text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                {href.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Home'}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2 border-t border-gray-800">
                <button onClick={() => { openLogin(); setMenuOpen(false) }} className="flex-1 text-center text-gray-300 text-sm py-2 rounded-lg bg-gray-800">Sign In</button>
                <button onClick={() => { openRegister(); setMenuOpen(false) }} className="flex-1 text-center text-white text-sm py-2 rounded-lg bg-green-700">Register</button>
              </div>
            )}
          </div>
        )}
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  )
}
