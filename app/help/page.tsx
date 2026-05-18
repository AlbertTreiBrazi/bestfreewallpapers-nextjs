import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Help Center — BestFreeWallpapers',
  description: 'Find answers to common questions about downloading wallpapers, setting ringtones, account management, and more.',
  alternates: { canonical: `${SITE_URL}/help` },
}

const faqSections = [
  {
    title: '📥 Downloading',
    items: [
      { q: 'How do I download a wallpaper?', a: 'Click on any wallpaper to open its detail page, then click the "Download Free" button. The file will save to your Downloads folder.' },
      { q: 'Do I need to create an account to download?', a: 'No! You can download wallpapers and ringtones without an account. Creating an account is optional and lets you save favorites.' },
      { q: 'Why is the download not starting?', a: 'Try right-clicking the Download button and selecting "Save link as". Also check that your browser is not blocking pop-ups or downloads from our site.' },
      { q: 'What file formats are available?', a: 'Wallpapers are available as JPG/PNG. Ringtones come in MP3 (Android) and M4R (iPhone). Live wallpapers are MP4 video files.' },
    ],
  },
  {
    title: '📱 Setting Wallpapers',
    items: [
      { q: 'How do I set a wallpaper on iPhone?', a: 'After downloading, go to your Photos app, select the image, tap the Share icon, and choose "Use as Wallpaper".' },
      { q: 'How do I set a wallpaper on Android?', a: 'After downloading, go to your Gallery app, long-press the image, and select "Set as wallpaper".' },
      { q: 'The wallpaper looks blurry on my phone. Why?', a: 'Make sure you downloaded the full resolution version. If the image still looks blurry, your phone may be stretching a lower resolution image — try a different wallpaper size.' },
    ],
  },
  {
    title: '🎵 Ringtones',
    items: [
      { q: 'How do I set a ringtone on iPhone?', a: 'Download the M4R file, connect to iTunes/Finder, drag the file to Tones, sync, then go to Settings → Sounds → Ringtone.' },
      { q: 'How do I set a ringtone on Android?', a: 'Download the MP3, go to Settings → Sound → Ringtone, select "Add ringtone" and choose your downloaded file.' },
      { q: 'What is the M4R format?', a: 'M4R is the iPhone ringtone format. It must be 30 seconds or shorter. Our M4R files are already correctly formatted.' },
    ],
  },
  {
    title: '👤 Account',
    items: [
      { q: 'How do I create an account?', a: 'Click "Register" in the header, enter your email and password, or use "Continue with Google" for instant access.' },
      { q: 'I forgot my password. How do I reset it?', a: 'Click "Sign In", then "Forgot password?" and enter your email. You\'ll receive a reset link within a few minutes.' },
      { q: 'How do I save my favorite wallpapers?', a: 'Click the heart icon on any wallpaper while signed in. View all your favorites at /favorites.' },
      { q: 'How do I delete my account?', a: 'Contact us at support@bestfreewallpapers.com and we will delete your account and all associated data within 7 days.' },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Help Center</h1>
        <p className="text-gray-400">Find answers to common questions, or contact us if you need more help.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {[
          { href: '/ringtones/how-to-set', label: 'Set a Ringtone', icon: '🎵' },
          { href: '/contact', label: 'Contact Support', icon: '✉️' },
          { href: '/dmca', label: 'Report Copyright', icon: '🔒' },
          { href: '/license', label: 'License Info', icon: '📄' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-xl p-4 text-center transition-colors">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-white text-xs font-medium">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* FAQ sections */}
      <div className="space-y-8">
        {faqSections.map((section, si) => (
          <div key={si}>
            <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item, ii) => (
                <div key={ii} className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-2">{item.q}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-green-900/20 border border-green-700/30 rounded-2xl p-8 text-center">
        <h2 className="text-white font-bold mb-2">Still need help?</h2>
        <p className="text-gray-400 text-sm mb-5">Our support team responds within 24 hours.</p>
        <Link href="/contact" className="inline-block bg-green-700 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          Contact Support
        </Link>
      </div>
    </div>
  )
}
