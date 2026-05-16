import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import type { Ringtone } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getRingtone(slug: string): Promise<Ringtone | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('ringtones')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_published', true)
    .single()
  return data as Ringtone | null
}

async function getRelated(currentId: number): Promise<Ringtone[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('ringtones')
    .select('id, title, slug, cover_image_url, duration_seconds, is_premium')
    .eq('is_active', true)
    .eq('is_published', true)
    .neq('id', currentId)
    .limit(5)
  return (data || []) as Ringtone[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ringtone = await getRingtone(slug)
  if (!ringtone) return { title: 'Ringtone not found' }

  const title = ringtone.seo_title || `${ringtone.title} — Free Ringtone Download`
  const description =
    ringtone.seo_description ||
    ringtone.description ||
    `Download ${ringtone.title} ringtone for free. Available for iPhone (M4R) and Android (MP3).`

  return {
    title,
    description,
    keywords: ringtone.meta_keywords?.join(', ') || ringtone.tags?.join(', '),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/ringtone/${slug}`,
      images: ringtone.cover_image_url
        ? [{ url: ringtone.cover_image_url, width: 1200, height: 1200, alt: ringtone.title }]
        : [],
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ringtone.cover_image_url ? [ringtone.cover_image_url] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/ringtone/${slug}`,
    },
  }
}

export const revalidate = 3600

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default async function RingtoneDetailPage({ params }: Props) {
  const { slug } = await params
  const ringtone = await getRingtone(slug)
  if (!ringtone) notFound()

  const related = await getRelated(ringtone.id)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: ringtone.title,
    description: ringtone.description || '',
    url: `${SITE_URL}/ringtone/${slug}`,
    duration: ringtone.duration_seconds ? `PT${ringtone.duration_seconds}S` : undefined,
    image: ringtone.cover_image_url || undefined,
    contentUrl: ringtone.audio_url,
    encodingFormat: 'audio/mpeg',
    license: `${SITE_URL}/license`,
    creditText: 'BestFreeWallpapers.com',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/ringtones" className="hover:text-white">Ringtones</Link>
          <span>/</span>
          <span className="text-gray-300 truncate">{ringtone.title}</span>
        </nav>

        <div className="bg-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 mx-auto sm:mx-0">
              {ringtone.cover_image_url ? (
                <Image
                  src={ringtone.cover_image_url}
                  alt={ringtone.title}
                  fill
                  priority
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-2">{ringtone.title}</h1>
              {ringtone.description && (
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">{ringtone.description}</p>
              )}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-gray-400 mb-4">
                {ringtone.duration_seconds && (
                  <span>⏱ {formatDuration(ringtone.duration_seconds)}</span>
                )}
                {ringtone.file_size_bytes && (
                  <span>📦 {(ringtone.file_size_bytes / 1024).toFixed(0)} KB</span>
                )}
                <span>⬇ {ringtone.downloads_count.toLocaleString()} downloads</span>
              </div>
              {ringtone.tags && ringtone.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {ringtone.tags.slice(0, 6).map((tag) => (
                    <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audio player */}
          <div className="mt-6">
            <audio
              controls
              className="w-full"
              preload="metadata"
            >
              <source src={ringtone.audio_url} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>

          {/* Download buttons */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={ringtone.audio_url}
              download={`${ringtone.slug}.mp3`}
              className="bg-green-700 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors"
            >
              ↓ Download MP3 (Android)
            </a>
            {ringtone.m4r_url && (
              <a
                href={ringtone.m4r_url}
                download={`${ringtone.slug}.m4r`}
                className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl text-center transition-colors"
              >
                ↓ Download M4R (iPhone)
              </a>
            )}
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            Free for personal use • No registration required
          </p>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-5">More Ringtones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/ringtone/${r.slug}`}
                  className="group bg-gray-800 hover:bg-gray-750 rounded-lg p-3 flex flex-col items-center gap-2 transition-colors border border-gray-700 hover:border-gray-600"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-700">
                    {r.cover_image_url ? (
                      <Image
                        src={r.cover_image_url}
                        alt={r.title}
                        fill
                        sizes="20vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium text-center line-clamp-2">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
