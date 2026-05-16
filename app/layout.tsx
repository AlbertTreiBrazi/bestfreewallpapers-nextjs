import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://bestfreewallpapers.com'),
  title: {
    default: 'Best Free Wallpapers — HD Wallpapers, Live Wallpapers & Ringtones',
    template: '%s | BestFreeWallpapers',
  },
  description:
    'Download free HD wallpapers, live wallpapers and ringtones for iPhone and Android. Thousands of high quality wallpapers updated daily.',
  keywords: [
    'free wallpapers',
    'HD wallpapers',
    'live wallpapers',
    'ringtones',
    'iPhone wallpapers',
    'Android wallpapers',
    '4K wallpapers',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bestfreewallpapers.com',
    siteName: 'BestFreeWallpapers',
    images: [
      {
        url: 'https://cdn.bestfreewallpapers.com/thumbnails/1777130170914-wallpaper-1777130170286-golden_white_bloom___elegant_3d_floral_wallpaper.jpg',
        width: 1200,
        height: 630,
        alt: 'Best Free Wallpapers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bestfreewallpapers',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  )
}
