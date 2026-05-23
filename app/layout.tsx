import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/contexts/AuthContext'
import ScrollToTop from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
  metadataBase: new URL('https://bestfreewallpapers.com'),
  title: {
    default: 'Best Free Wallpapers — HD Wallpapers, Live Wallpapers & Ringtones',
    template: '%s | BestFreeWallpapers',
  },
  description: 'Download free HD wallpapers, live wallpapers and ringtones for iPhone and Android. Thousands of high quality wallpapers updated daily.',
  keywords: ['free wallpapers', 'HD wallpapers', 'live wallpapers', 'ringtones', 'iPhone wallpapers', 'Android wallpapers'],
  openGraph: { type: 'website', locale: 'en_US', url: 'https://bestfreewallpapers.com', siteName: 'BestFreeWallpapers' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BestFreeWallpapers',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#15803d" />
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' } }} />
        </AuthProvider>
      </body>
    </html>
  )
}
