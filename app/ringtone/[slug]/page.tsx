import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient, SITE_URL } from '@/lib/supabase'
import { breadcrumbSchema } from '@/lib/structured-data'
import type { Ringtone } from '@/types'
import RingtoneDetailClient from './RingtoneDetailClient'

interface Props { params: Promise<{ slug: string }> }

async function getRingtone(slug: string): Promise<Ringtone | null> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('ringtones').select('*').eq('slug', slug).eq('is_active', true).eq('is_published', true).single()
  return data as Ringtone | null
}

async function getRelated(currentId: number): Promise<Ringtone[]> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('ringtones').select('id, title, slug, cover_image_url, duration_seconds, is_premium, audio_url, downloads_count, file_size_bytes, tags, m4r_url, plays_count, creator_name, seo_title, seo_description, meta_keywords, is_active, is_published, created_at, updated_at, description').eq('is_active', true).eq('is_published', true).neq('id', currentId).limit(5)
  return (data || []) as Ringtone[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ringtone = await getRingtone(slug)
  if (!ringtone) return { title: 'Ringtone not found' }
  const title = ringtone.seo_title || `${ringtone.title} — Free Ringtone Download`
  const description = ringtone.seo_description || ringtone.description || `Download ${ringtone.title} ringtone free. MP3 for Android and M4R for iPhone.`
  return {
    title, description,
    keywords: ringtone.meta_keywords?.join(', ') || ringtone.tags?.join(', '),
    openGraph: { title, description, url: `${SITE_URL}/ringtone/${slug}`, images: ringtone.cover_image_url ? [{ url: ringtone.cover_image_url, alt: ringtone.title }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: ringtone.cover_image_url ? [ringtone.cover_image_url] : [] },
    alternates: { canonical: `${SITE_URL}/ringtone/${slug}` },
  }
}

export const revalidate = 3600

export default async function RingtoneDetailPage({ params }: Props) {
  const { slug } = await params
  const ringtone = await getRingtone(slug)
  if (!ringtone) notFound()
  const related = await getRelated(ringtone.id)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
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
      },
      breadcrumbSchema([
        { name: 'Home',      url: SITE_URL },
        { name: 'Ringtones', url: `${SITE_URL}/ringtones` },
        { name: ringtone.title },
      ]),
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <RingtoneDetailClient ringtone={ringtone} related={related} />
    </>
  )
}
