import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Terms of Use — BestFreeWallpapers',
  description: 'Terms of use and conditions for using BestFreeWallpapers. Read our terms before downloading wallpapers or using our services.',
  alternates: { canonical: `${SITE_URL}/terms` },
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using BestFreeWallpapers ("the Service"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service.',
  },
  {
    title: '2. Use of Content',
    content: 'Wallpapers, ringtones, and other content available on BestFreeWallpapers are provided for personal, non-commercial use only. You may download and use content for your personal devices. You may not redistribute, sell, or use content for commercial purposes without explicit written permission.',
  },
  {
    title: '3. Intellectual Property',
    content: 'Content on BestFreeWallpapers is either owned by us, licensed to us, or provided by third parties under appropriate licenses. The BestFreeWallpapers name, logo, and website design are our intellectual property. User-uploaded content remains the property of the uploader.',
  },
  {
    title: '4. User Accounts',
    content: 'You may create an account to access additional features. You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account. We reserve the right to terminate accounts that violate these terms.',
  },
  {
    title: '5. Prohibited Activities',
    content: 'You may not: use our service for commercial purposes without permission; attempt to circumvent any technical measures; scrape, crawl, or copy our content in bulk; upload harmful, illegal, or infringing content; impersonate other users or entities; use our service in any way that violates applicable laws.',
  },
  {
    title: '6. Copyright & DMCA',
    content: 'We respect intellectual property rights. If you believe content on our site infringes your copyright, please submit a DMCA takedown notice via our DMCA page. We will review and remove infringing content promptly.',
  },
  {
    title: '7. Disclaimer of Warranties',
    content: 'BestFreeWallpapers is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, error-free operation, or that content will meet your expectations. We are not responsible for any device issues resulting from downloaded content.',
  },
  {
    title: '8. Limitation of Liability',
    content: 'BestFreeWallpapers shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you (if any) in the 12 months preceding the claim.',
  },
  {
    title: '9. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. We will notify registered users of material changes. Continued use of the service after changes constitutes acceptance of the modified terms.',
  },
  {
    title: '10. Governing Law',
    content: 'These terms are governed by applicable law. Any disputes shall be resolved through good-faith negotiation first, then through appropriate legal proceedings.',
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Terms of Use</h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-5 mb-8 text-sm text-yellow-300">
        <strong>Key points:</strong> Free for personal use only. No commercial use without permission. Respect intellectual property. You keep full control of your account.
      </div>

      <div className="space-y-5">
        {sections.map((s, i) => (
          <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-3">{s.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 justify-center text-sm">
        <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
        <Link href="/license" className="text-gray-400 hover:text-white">License</Link>
        <Link href="/dmca" className="text-gray-400 hover:text-white">DMCA</Link>
        <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
      </div>
    </div>
  )
}
