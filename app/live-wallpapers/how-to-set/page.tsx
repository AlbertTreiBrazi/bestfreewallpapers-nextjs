import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'How to Set a Live Wallpaper on iPhone & Android — Step by Step Guide',
  description: 'Learn how to set a live wallpaper on iPhone and Android. Step by step instructions for setting animated MP4 wallpapers on iPhone Lock Screen and Android home screen. Free guide.',
  keywords: [
    'how to set live wallpaper iPhone',
    'how to set live wallpaper Android',
    'iPhone live wallpaper tutorial',
    'animated wallpaper iPhone',
    'live wallpaper Android',
    'iPhone lock screen live wallpaper',
    'Samsung live wallpaper',
    'MP4 wallpaper iPhone',
  ],
  alternates: { canonical: `${SITE_URL}/live-wallpapers/how-to-set` },
  openGraph: {
    title: 'How to Set a Live Wallpaper on iPhone & Android',
    description: 'Step by step guide to set animated live wallpapers on iPhone and Android devices.',
    url: `${SITE_URL}/live-wallpapers/how-to-set`,
  },
}

const iphoneSteps = [
  {
    title: 'Download the MP4 file',
    description: 'Download the live wallpaper in MP4 format from the wallpaper detail page. Tap "Download Live Wallpaper" and save it to your Photos app via the Files app or directly.',
  },
  {
    title: 'Open the Photos app',
    description: 'Make sure the video is saved in your Photos library. If you downloaded it via Safari, it may be in the Downloads folder in the Files app — move it to Photos first.',
  },
  {
    title: 'Go to Settings → Wallpaper',
    description: 'Open the Settings app on your iPhone, tap "Wallpaper", then tap "Add New Wallpaper".',
  },
  {
    title: 'Select Live Photo or Video',
    description: 'Scroll through the wallpaper options and tap "Live Photo" — or on iPhone 16, you can use the new "Video" option to use MP4 files directly as lock screen wallpapers.',
  },
  {
    title: 'Choose your live wallpaper',
    description: 'Select the video you downloaded from your Photos library. You can adjust the crop and position, then tap "Add to Lock Screen" or "Set as Wallpaper Pair".',
  },
]

const androidSteps = [
  {
    title: 'Download the MP4 file',
    description: 'Tap the Download button on the live wallpaper page. The MP4 file will be saved to your Downloads folder.',
  },
  {
    title: 'Install a live wallpaper app',
    description: 'Android does not natively play MP4 files as live wallpapers. Install a free app like "Video Live Wallpaper" or "VLC Live Wallpaper" from the Google Play Store.',
  },
  {
    title: 'Open the live wallpaper app',
    description: 'Open the app you installed. Grant any required permissions (access to storage/media).',
  },
  {
    title: 'Select your video',
    description: 'In the app, choose "Select Video" or "Add Wallpaper" and navigate to your Downloads folder. Select the MP4 file you downloaded.',
  },
  {
    title: 'Apply the wallpaper',
    description: 'Tap "Set as Wallpaper" in the app. Choose whether to set it as the Home Screen, Lock Screen, or both. The animated wallpaper will now loop continuously.',
  },
]

const samsungSteps = [
  {
    title: 'Download the MP4 file',
    description: 'Download the MP4 live wallpaper to your Samsung device.',
  },
  {
    title: 'Long-press the Home Screen',
    description: 'On your Samsung Galaxy, long-press an empty area of the Home Screen to open the customization menu.',
  },
  {
    title: 'Tap Wallpaper and style',
    description: 'Tap "Wallpaper and style" then "Change wallpapers".',
  },
  {
    title: 'Select Video Wallpaper',
    description: 'Swipe through the wallpaper sources and select "Video" — Samsung Galaxy natively supports MP4 video wallpapers without a third-party app.',
  },
  {
    title: 'Apply and set',
    description: 'Select your downloaded MP4 file, adjust the settings, then tap "Set as wallpaper". Choose Home screen, Lock screen, or both.',
  },
]

const faqItems = [
  {
    q: 'Does iPhone support live wallpapers natively?',
    a: 'iPhones support Live Photos as wallpapers (shot with the Live Photo camera mode). For standard MP4 video files, iPhone 16 introduced native video wallpapers. On older iPhones, use a shortcut or convert the MP4 to a Live Photo using apps like intoLive.',
  },
  {
    q: 'Will live wallpapers drain my battery?',
    a: 'Live wallpapers use more battery than static wallpapers since the screen plays animation. The impact varies by device — on most modern phones it is minimal, as the wallpaper only animates when you unlock the screen.',
  },
  {
    q: 'What is the best format for live wallpapers?',
    a: 'MP4 (H.264 codec) is the most compatible format. It works on Android natively and with iPhone via conversion apps. Our live wallpapers are available as MP4 files.',
  },
  {
    q: 'Can I set different live wallpapers for home screen and lock screen?',
    a: 'Yes! On iOS 16+, you can set separate wallpapers for the Home Screen and Lock Screen. On Android/Samsung you can also assign different wallpapers to each.',
  },
  {
    q: 'How do I convert MP4 to Live Photo for older iPhones?',
    a: 'Use the free app "intoLive" from the App Store. Import your MP4 video and export it as a Live Photo to your camera roll. Then go to Settings → Wallpaper and set it as a Live Photo wallpaper.',
  },
  {
    q: 'The video wallpaper loops — can I stop it?',
    a: 'On Android, most live wallpaper apps have loop settings. On iPhone, the live wallpaper only plays when you press the lock screen with 3D Touch or tap and hold.',
  },
]

export default function HowToSetLiveWallpaperPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Set a Live Wallpaper on iPhone',
    description: 'Step by step guide to set an animated MP4 live wallpaper on iPhone',
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
          <Link href="/live-wallpapers" className="hover:text-white">Live Wallpapers</Link>
          <span>/</span>
          <span className="text-gray-300">How to Set</span>
        </nav>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How to Set a Live Wallpaper on iPhone & Android
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Follow these simple steps to set an animated live wallpaper on your iPhone, Android, or Samsung Galaxy phone.
          </p>
        </div>

        {/* Device tabs */}
        <div className="grid md:grid-cols-3 gap-4 mb-3">
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 text-center">
            <span className="text-2xl">📱</span>
            <p className="text-blue-300 font-medium mt-1">iPhone (iOS 16+)</p>
          </div>
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 text-center">
            <span className="text-2xl">🤖</span>
            <p className="text-green-300 font-medium mt-1">Android</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 text-center">
            <span className="text-2xl">🌌</span>
            <p className="text-purple-300 font-medium mt-1">Samsung Galaxy</p>
          </div>
        </div>

        {/* iPhone steps */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">📱</span>
            <h2 className="text-2xl font-bold text-white">Set Live Wallpaper on iPhone</h2>
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
              <strong>💡 Tip:</strong> iPhone 16 supports native MP4 video wallpapers. For older iPhones, use the free <strong>intoLive</strong> app from the App Store to convert MP4 videos to Live Photos.
            </p>
          </div>
        </section>

        {/* Android steps */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🤖</span>
            <h2 className="text-2xl font-bold text-white">Set Live Wallpaper on Android</h2>
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
              <strong>💡 Tip:</strong> Search &quot;Video Live Wallpaper&quot; on Google Play. Popular apps include KLWP, Video Live Wallpaper, and Maxthon Video Wallpaper — all free.
            </p>
          </div>
        </section>

        {/* Samsung steps */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🌌</span>
            <h2 className="text-2xl font-bold text-white">Set Live Wallpaper on Samsung Galaxy</h2>
          </div>
          <div className="space-y-4">
            {samsungSteps.map((step, i) => (
              <div key={i} className="flex gap-4 bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
            <p className="text-purple-300 text-sm">
              <strong>💡 Tip:</strong> Samsung Galaxy (One UI 4+) supports video wallpapers natively without any third-party app. Look for the &quot;Video&quot; option under Wallpaper settings.
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
          <h2 className="text-xl font-bold text-white mb-3">Ready to get a live wallpaper?</h2>
          <p className="text-gray-400 mb-6 text-sm">Browse hundreds of free animated live wallpapers — available as MP4 for iPhone and Android.</p>
          <Link
            href="/live-wallpapers"
            className="inline-block bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse Free Live Wallpapers →
          </Link>
        </div>
      </div>
    </>
  )
}
