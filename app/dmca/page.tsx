import { Metadata } from 'next'
import { SITE_URL } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'DMCA Policy — BestFreeWallpapers Copyright Policy',
  description: 'BestFreeWallpapers DMCA policy and copyright takedown procedure. Report infringing content for prompt removal.',
  alternates: { canonical: `${SITE_URL}/dmca` },
}

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-red-700/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">DMCA Policy</h1>
        <p className="text-gray-400">We respect intellectual property rights and respond promptly to valid copyright claims.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-3">Our Commitment</h2>
          <p className="text-gray-400 text-sm leading-relaxed">BestFreeWallpapers respects the intellectual property rights of others and expects our users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and respond promptly to valid takedown notices.</p>
        </div>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">How to Submit a DMCA Takedown</h2>
          <p className="text-gray-400 text-sm mb-4">To submit a valid DMCA takedown notice, your request must include:</p>
          <ol className="space-y-3">
            {[
              'Your full name and contact information (email, address, phone)',
              'A description of the copyrighted work you claim has been infringed',
              'The exact URL(s) of the infringing content on our site',
              'A statement that you have a good-faith belief the use is not authorized',
              'A statement that the information is accurate and you are the copyright owner (or authorized to act on their behalf)',
              'Your physical or electronic signature',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                <span className="w-6 h-6 bg-red-700/40 rounded-full flex items-center justify-center text-red-300 font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-3">Submit Your Request</h2>
          <p className="text-gray-400 text-sm mb-4">Send your complete DMCA takedown notice to:</p>
          <a
            href="mailto:dmca@bestfreewallpapers.com"
            className="inline-block bg-red-700 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            dmca@bestfreewallpapers.com
          </a>
          <p className="text-gray-500 text-xs mt-4">We will acknowledge receipt within 24 hours and process valid requests within 72 hours.</p>
        </div>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-3">Counter-Notice</h2>
          <p className="text-gray-400 text-sm leading-relaxed">If you believe content was removed in error, you may submit a counter-notice. Please include the same information as a takedown notice, plus a statement under penalty of perjury that you have a good-faith belief the content was removed mistakenly. Send counter-notices to the same email address.</p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-5 text-sm text-yellow-300">
          <strong>Warning:</strong> Submitting a false DMCA claim may expose you to legal liability. Please ensure your claim is valid before submitting.
        </div>
      </div>
    </div>
  )
}
