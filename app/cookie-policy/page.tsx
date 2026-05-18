import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Cookie Policy — BestFreeWallpapers',
  description: 'Learn about how BestFreeWallpapers uses cookies and similar technologies.',
  alternates: { canonical: `${SITE_URL}/cookie-policy` },
}

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Cookie Policy</h1>
        <p className="text-gray-400">How we use cookies and similar tracking technologies.</p>
      </div>

      <div className="space-y-5">
        {[
          { title: 'What Are Cookies?', content: 'Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide a better user experience.' },
          { title: 'Cookies We Use', content: 'We use essential cookies for authentication (keeping you signed in), preference cookies to remember your settings, and analytics cookies (Google Analytics) to understand how visitors use our site. We do not use advertising cookies or sell cookie data.' },
          { title: 'Essential Cookies', content: 'These cookies are necessary for the site to function. They include session cookies for authentication and security tokens. You cannot disable these without affecting core functionality.' },
          { title: 'Analytics Cookies', content: 'We use Google Analytics to collect anonymous usage data such as page views, session duration, and device type. This helps us improve the site. You can opt out by using browser extensions that block Google Analytics.' },
          { title: 'Managing Cookies', content: 'You can control cookies through your browser settings. Most browsers allow you to refuse or delete cookies. Note that disabling essential cookies may prevent you from signing in or using certain features.' },
          { title: 'Third-Party Cookies', content: 'Services we integrate (Google OAuth, Supabase) may set their own cookies governed by their respective privacy policies. We do not control these third-party cookies.' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-3">{s.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4 justify-center text-sm">
        <Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
        <Link href="/terms" className="text-gray-400 hover:text-white">Terms of Use</Link>
      </div>
    </div>
  )
}
