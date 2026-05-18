import { Metadata } from 'next'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Privacy Policy — BestFreeWallpapers',
  description: 'Learn how BestFreeWallpapers collects, uses, and protects your personal information. Our commitment to your privacy and data security.',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

const sections = [
  {
    icon: '👁',
    title: 'Information We Collect',
    content: `We collect information you provide directly, such as your email address and name when you create an account. We also automatically collect certain information when you visit our site, including IP address, browser type, pages visited, and time spent on pages. If you sign in with Google, we receive your public profile information.`,
  },
  {
    icon: '🔧',
    title: 'How We Use Your Information',
    content: `We use your information to provide and improve our services, send important account notifications, respond to your support requests, personalize your experience (such as saving favorites), and analyze usage patterns to improve the site. We do not sell your personal information to third parties.`,
  },
  {
    icon: '🍪',
    title: 'Cookies & Tracking',
    content: `We use cookies to keep you signed in, remember your preferences, and analyze how our site is used. We use Google Analytics to understand traffic patterns. You can control cookie settings through your browser. Third-party services (Google, Supabase) may set their own cookies subject to their own privacy policies.`,
  },
  {
    icon: '🔒',
    title: 'Data Security',
    content: `We use industry-standard security measures to protect your data. User authentication is handled by Supabase, which provides secure, encrypted storage. Passwords are never stored in plain text. While we take reasonable precautions, no internet transmission is 100% secure.`,
  },
  {
    icon: '👥',
    title: 'Third-Party Services',
    content: `We use Supabase for authentication and data storage, Google Analytics for traffic analysis, Cloudflare for CDN and security, and Google OAuth for social login. Each of these services has its own privacy policy that governs how they process data.`,
  },
  {
    icon: '⚖️',
    title: 'Your Rights',
    content: `You have the right to access, correct, or delete your personal information at any time. You can delete your account by contacting us at support@bestfreewallpapers.com. You may also opt out of analytics by using browser extensions that block Google Analytics.`,
  },
  {
    icon: '🧒',
    title: "Children's Privacy",
    content: `Our service is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.`,
  },
  {
    icon: '🔄',
    title: 'Changes to This Policy',
    content: `We may update this privacy policy from time to time. We will notify registered users of significant changes via email. The date at the top of this policy reflects when it was last updated. Continued use of our service after changes constitutes acceptance.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-blue-700/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-gray-400">Your privacy is important to us. Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-5 mb-8 text-sm text-blue-300">
        <strong>Summary:</strong> We collect minimal data, never sell your information, use industry-standard security, and give you full control over your account and data.
      </div>

      <div className="space-y-6">
        {sections.map((s, i) => (
          <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-3">
              <span>{s.icon}</span>
              {s.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-gray-500 text-sm">
        <p>Questions about our privacy practices? Contact us at{' '}
          <a href="mailto:privacy@bestfreewallpapers.com" className="text-gray-400 hover:text-white">privacy@bestfreewallpapers.com</a>
        </p>
      </div>
    </div>
  )
}
