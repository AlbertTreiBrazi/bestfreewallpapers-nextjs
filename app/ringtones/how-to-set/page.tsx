import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'How to Set a Ringtone on iPhone & Android — Step by Step Guide',
  description: 'Learn how to set a custom ringtone on iPhone and Android. Step by step instructions for setting MP3 ringtones on Android and M4R ringtones on iPhone. Free guide.',
  keywords: ['how to set ringtone iPhone', 'how to set ringtone Android', 'set custom ringtone', 'iPhone ringtone tutorial', 'Android ringtone tutorial', 'M4R ringtone iPhone', 'MP3 ringtone Android'],
  alternates: { canonical: `${SITE_URL}/ringtones/how-to-set` },
  openGraph: {
    title: 'How to Set a Ringtone on iPhone & Android',
    description: 'Step by step guide to set custom ringtones on iPhone and Android devices.',
    url: `${SITE_URL}/ringtones/how-to-set`,
  },
}

const iphoneSteps = [
  {
    title: 'Download the M4R file',
    description: 'Download the ringtone in M4R format from our site. The M4R format is the standard iPhone ringtone format.',
  },
  {
    title: 'Connect iPhone to your Mac',
    description: 'Connect your iPhone to your Mac using a USB cable. Open Finder (macOS Catalina+) or iTunes (older macOS).',
  },
  {
    title: 'Drag M4R file to Tones',
    description: 'In Finder, click on your iPhone → Tones section. Drag and drop the .m4r file into the Tones library.',
  },
  {
    title: 'Sync your iPhone',
    description: 'Click Sync in Finder/iTunes. Wait for the sync to complete.',
  },
  {
    title: 'Set the ringtone',
    description: 'On iPhone: Settings → Sounds & Haptics → Ringtone → Select your new ringtone from the list.',
  },
]

const androidSteps = [
  {
    title: 'Download the MP3 file',
    description: 'Download the ringtone in MP3 format directly to your Android phone. Tap the Download button on the ringtone page.',
  },
  {
    title: 'Open Settings',
    description: 'Go to your Android Settings app. The exact path varies by manufacturer.',
  },
  {
    title: 'Find Sound settings',
    description: 'Navigate to Settings → Sound → Phone ringtone (Samsung: Settings → Sounds and vibration → Ringtone).',
  },
  {
    title: 'Select your ringtone',
    description: 'Tap "Add ringtone" or the + icon. Navigate to your Downloads folder and select the MP3 file you downloaded.',
  },
  {
    title: 'Save and apply',
    description: 'Tap OK or Save to apply the ringtone. It will now play when you receive a call.',
  },
]

const faqItems = [
  {
    q: 'What format do I need for iPhone ringtones?',
    a: 'iPhone requires the M4R format. We provide M4R downloads on every ringtone page. M4R is essentially an AAC audio file with a .m4r extension.',
  },
  {
    q: 'What format do I need for Android ringtones?',
    a: 'Android supports MP3, OGG, WAV and other audio formats. MP3 is the most compatible and works on all Android devices.',
  },
  {
    q: 'Can I set different ringtones for different contacts?',
    a: 'Yes! On iPhone: open the contact → Edit → Ringtone. On Android: open the contact → Edit → Ringtone (may vary by phone model).',
  },
  {
    q: 'My ringtone is longer than 30 seconds — will it work on iPhone?',
    a: 'iPhone ringtones must be 30 seconds or shorter. Our M4R ringtones are already optimized to the correct length.',
  },
  {
    q: 'How do I set a ringtone without a computer on iPhone?',
    a: 'You can use the GarageBand app on iPhone to import audio files and save them as ringtones — no computer needed.',
  },
]

export default function HowToSetRingtonePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Set a Custom Ringtone on iPhone',
    description: 'Step by step guide to set a custom M4R ringtone on iPhone',
    step: iphoneSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.description,
    })),
  }

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/ringtones" className="hover:text-white">Ringtones</Link>
          <span>/</span>
          <span className="text-gray-300">How to Set</span>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How to Set a Ringtone on iPhone & Android
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Follow these simple step-by-step instructions to set a custom ringtone on your iPhone or Android phone.
          </p>
        </div>

        {/* Tabs visual indicator */}
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 text-center">
            <span className="text-2xl">📱</span>
            <p className="text-blue-300 font-medium mt-1">iPhone (M4R)</p>
          </div>
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 text-center">
            <span className="text-2xl">🤖</span>
            <p className="text-green-300 font-medium mt-1">Android (MP3)</p>
          </div>
        </div>

        {/* iPhone steps */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📱</span>
            <h2 className="text-2xl font-bold text-white">Set Ringtone on iPhone</h2>
          </div>
          <div className="space-y-4">
            {iphoneSteps.map((step, i) => (
              <div key={i} className="flex gap-4 bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              <strong>💡 Tip:</strong> Make sure your ringtone file is in M4R format and is 30 seconds or shorter.
              Download our ringtones in M4R format directly from the ringtone detail page.
            </p>
          </div>
        </section>

        {/* Android steps */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🤖</span>
            <h2 className="text-2xl font-bold text-white">Set Ringtone on Android</h2>
          </div>
          <div className="space-y-4">
            {androidSteps.map((step, i) => (
              <div key={i} className="flex gap-4 bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-green-900/20 border border-green-700/30 rounded-xl p-4">
            <p className="text-green-300 text-sm">
              <strong>💡 Tip:</strong> If you can&apos;t find the ringtone option, try searching &quot;ringtone&quot; in your Settings app.
              The exact location varies between Android manufacturers (Samsung, Google, OnePlus etc.)
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-green-900/30 to-gray-800 rounded-2xl p-8 text-center border border-green-700/30">
          <h2 className="text-xl font-bold text-white mb-3">Ready to get a new ringtone?</h2>
          <p className="text-gray-400 mb-6 text-sm">Browse hundreds of free ringtones — available in MP3 and M4R formats.</p>
          <Link
            href="/ringtones"
            className="inline-block bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse Free Ringtones →
          </Link>
        </div>
      </div>
    </>
  )
}
