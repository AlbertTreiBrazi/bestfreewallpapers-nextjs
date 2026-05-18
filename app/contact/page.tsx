import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Contact Us — BestFreeWallpapers Support',
  description: 'Get in touch with BestFreeWallpapers. Contact us for support, feedback, DMCA requests, or partnership inquiries.',
  alternates: { canonical: `${SITE_URL}/contact` },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact BestFreeWallpapers',
  url: `${SITE_URL}/contact`,
  mainEntity: {
    '@type': 'Organization',
    name: 'BestFreeWallpapers',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@bestfreewallpapers.com',
      availableLanguage: 'English',
    },
  },
}

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="bg-gradient-to-br from-blue-900/30 via-gray-900 to-purple-900/20 py-16 px-4 text-center border-b border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Get Support</h1>
          <p className="text-gray-400 text-lg">
            Need help with downloads, have feedback, or want to report an issue? We&apos;re here to help.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {/* Email */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-blue-700/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Email Support</h2>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              For technical issues, download problems, or general questions, email us and we&apos;ll reply within 24 hours.
            </p>
            <a
              href="mailto:support@bestfreewallpapers.com"
              className="inline-block bg-blue-700 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              support@bestfreewallpapers.com
            </a>
          </div>

          {/* DMCA */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-red-700/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">DMCA & Copyright</h2>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              If you believe your copyrighted work has been used without permission, please submit a DMCA takedown request.
            </p>
            <Link
              href="/dmca"
              className="inline-block bg-red-700 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              DMCA Takedown Request
            </Link>
          </div>
        </div>

        {/* FAQ quick links */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-white font-bold text-xl mb-6">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I download a wallpaper?', a: 'Click on any wallpaper and press the Download button. No registration required.' },
              { q: 'Are all wallpapers really free?', a: 'Yes, all wallpapers on BestFreeWallpapers are free for personal use.' },
              { q: 'Can I use wallpapers commercially?', a: 'No, wallpapers are for personal use only. See our License page for details.' },
              { q: 'How do I set a ringtone on iPhone?', a: 'Visit our How to Set page for step-by-step instructions for iPhone and Android.' },
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                <h3 className="text-white font-medium text-sm mb-1">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-700">
            <Link href="/help" className="text-green-400 hover:text-green-300 text-sm">
              View all help articles →
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Business inquiries: <a href="mailto:business@bestfreewallpapers.com" className="text-gray-400 hover:text-white">business@bestfreewallpapers.com</a></p>
        </div>
      </div>
    </>
  )
}
