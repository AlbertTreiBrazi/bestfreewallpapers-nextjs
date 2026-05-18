import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'License — How You Can Use BestFreeWallpapers Content',
  description: 'Understand the license terms for wallpapers, ringtones, and content on BestFreeWallpapers. Free for personal use.',
  alternates: { canonical: `${SITE_URL}/license` },
}

export default function LicensePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Content License</h1>
        <p className="text-gray-400">How you can use wallpapers, ringtones, and other content from BestFreeWallpapers.</p>
      </div>

      {/* Quick reference */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-6">
          <h2 className="text-green-400 font-bold mb-4">✅ You CAN</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              'Download and use on your personal devices',
              'Set as wallpaper on your phone, tablet, or desktop',
              'Share with friends for personal use',
              'Use in non-commercial personal projects',
              'Set ringtones on your personal phone',
            ].map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-green-400 flex-shrink-0">✓</span>{item}</li>)}
          </ul>
        </div>
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6">
          <h2 className="text-red-400 font-bold mb-4">❌ You CANNOT</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              'Sell or redistribute wallpapers commercially',
              'Use in paid products, apps, or services',
              'Claim ownership or copyright of content',
              'Upload to other wallpaper sites for redistribution',
              'Use in advertisements or marketing materials',
            ].map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-red-400 flex-shrink-0">✗</span>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="space-y-5">
        {[
          { title: 'Personal Use License', content: 'All content on BestFreeWallpapers is available under a free personal use license. This means you may download, use, and enjoy the content for your own personal, non-commercial purposes. No attribution is required for personal use.' },
          { title: 'Commercial Use', content: 'Commercial use of any content from BestFreeWallpapers requires explicit written permission. This includes use in products for sale, advertising, marketing materials, apps, or any revenue-generating context. Contact us at business@bestfreewallpapers.com to discuss licensing.' },
          { title: 'AI-Generated Content', content: 'AI-generated wallpapers on our platform are created using licensed AI tools. They are available under the same personal use license as other content. The AI-generated nature does not grant additional commercial rights.' },
          { title: 'Third-Party Content', content: 'Some content may be provided by third parties or created by AI tools with their own license terms. Where applicable, we note additional restrictions on individual content pages. Always check specific content pages for any special license terms.' },
          { title: 'Copyright Claims', content: 'We respect intellectual property rights. If you believe any content on our platform infringes your copyright, please visit our DMCA page to submit a takedown request. We process valid requests promptly.' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-3">{s.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 justify-center text-sm">
        <Link href="/dmca" className="text-gray-400 hover:text-white">DMCA Policy</Link>
        <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Use</Link>
        <a href="mailto:business@bestfreewallpapers.com" className="text-gray-400 hover:text-white">Commercial License Inquiry</a>
      </div>
    </div>
  )
}
