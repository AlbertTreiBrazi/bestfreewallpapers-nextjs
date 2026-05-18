import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'About BestFreeWallpapers — Free HD Wallpapers for Everyone',
  description: 'Learn about BestFreeWallpapers, your trusted source for high-quality free wallpapers, live wallpapers and ringtones for iPhone and Android.',
  alternates: { canonical: `${SITE_URL}/about` },
}

const features = [
  { icon: '⭐', title: 'Pure Quality', description: 'Professional selection of HD wallpapers, meticulous curation for perfect quality on every screen.' },
  { icon: '📱', title: 'Multiple Resolutions', description: 'Support for all devices — from mobile to 4K desktop, iPhone to Samsung Galaxy.' },
  { icon: '📁', title: 'Organized Categories', description: 'Well-organized categories to easily find the perfect wallpaper for your style.' },
  { icon: '⚡', title: 'Fast & Free', description: 'Instant free download for all wallpapers. No registration, no hidden fees.' },
  { icon: '🎵', title: 'Free Ringtones', description: 'MP3 and M4R ringtones for iPhone and Android, all free to download.' },
  { icon: '🎬', title: 'Live Wallpapers', description: 'Animated live wallpapers in MP4 format for a dynamic home screen.' },
]

const categories = [
  { icon: '🌿', title: 'Nature & Landscapes', description: 'Stunning forests, mountains, oceans and outdoor scenes.' },
  { icon: '🎨', title: 'Abstract Art', description: 'Modern abstract designs, patterns and artistic compositions.' },
  { icon: '🌌', title: 'Space & Cosmos', description: 'Galaxies, nebulae, planets and cosmic scenes.' },
  { icon: '🤖', title: 'AI Generated', description: 'Unique wallpapers created by artificial intelligence.' },
  { icon: '🏙', title: 'Architecture', description: 'Stunning buildings, cities and urban photography.' },
  { icon: '🐾', title: 'Animals', description: 'Wildlife, pets and nature photography.' },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About BestFreeWallpapers',
  description: 'Your trusted source for high-quality free wallpapers and ringtones.',
  url: `${SITE_URL}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: 'BestFreeWallpapers',
    url: SITE_URL,
    description: 'Free HD wallpapers, live wallpapers and ringtones for iPhone and Android',
    email: 'support@bestfreewallpapers.com',
  },
}

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900/40 via-gray-900 to-blue-900/20 py-16 px-4 text-center border-b border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">BF</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">About BestFreeWallpapers</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            We&apos;re passionate about helping people personalize their devices with beautiful,
            high-quality wallpapers — completely free. No ads blocking downloads, no registration walls.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">

        {/* Mission */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-gray-400 leading-relaxed text-lg">
            BestFreeWallpapers was created with one goal: give everyone access to beautiful,
            high-resolution wallpapers without barriers. We believe your phone and desktop deserve
            to look amazing — and that shouldn&apos;t cost anything.
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What We Offer</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Categories We Cover</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.title} className="flex items-start gap-4 bg-gray-800/40 border border-gray-700 rounded-xl p-5">
                <span className="text-2xl flex-shrink-0">{c.icon}</span>
                <div>
                  <h3 className="text-white font-medium mb-1">{c.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-to-br from-green-900/20 to-gray-800 rounded-2xl p-10 border border-green-700/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">BestFreeWallpapers by the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '100K+', label: 'Wallpapers' },
              { num: '100%', label: 'Free' },
              { num: '0', label: 'Registration required' },
              { num: '∞', label: 'Downloads' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-green-400 mb-1">{s.num}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <h2 className="text-xl font-bold text-white mb-3">Have questions?</h2>
          <p className="text-gray-400 mb-6 text-sm">We&apos;d love to hear from you.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Contact Us
            </Link>
            <Link href="/wallpapers" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Browse Wallpapers
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
