import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createServerSupabaseClient } from '@/lib/supabase'
import { rgbToColorBucket } from '@/lib/color-utils'

export const runtime = 'nodejs'
export const maxDuration = 30 // seconds

const BATCH = 10

/**
 * GET /api/admin/extract-colors?offset=0
 * Extracts dominant colors for up to BATCH wallpapers that have no color yet.
 * Returns { processed, updated, remaining, errors[] }
 */
export async function GET(req: NextRequest) {
  // Simple auth guard — only accessible in development or with secret header
  const secret = req.headers.get('x-admin-secret')
  const envSecret = process.env.ADMIN_SECRET
  if (envSecret && secret !== envSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const offset = Number(req.nextUrl.searchParams.get('offset') ?? '0')
  const supabase = createServerSupabaseClient()

  // Fetch a batch of wallpapers without dominant_color
  const { data: wallpapers, error } = await supabase
    .from('wallpapers')
    .select('id, thumbnail_url, image_url')
    .is('dominant_color', null)
    .eq('is_active', true)
    .range(offset, offset + BATCH - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!wallpapers || wallpapers.length === 0) {
    return NextResponse.json({ processed: 0, updated: 0, remaining: 0, done: true })
  }

  // Count remaining (approximate)
  const { count: remaining } = await supabase
    .from('wallpapers')
    .select('id', { count: 'estimated', head: true })
    .is('dominant_color', null)
    .eq('is_active', true)

  const errors: string[] = []
  let updated = 0

  await Promise.all(
    wallpapers.map(async (w) => {
      const url = w.thumbnail_url || w.image_url
      if (!url) return

      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())

        // Resize to 5×5 and get raw RGB data — fast & accurate enough
        const { data, info } = await sharp(buf)
          .resize(5, 5, { fit: 'cover', position: 'centre' })
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true })

        // Average the 25 pixels
        let sumR = 0, sumG = 0, sumB = 0
        const pixels = info.width * info.height
        for (let i = 0; i < pixels * 3; i += 3) {
          sumR += data[i]; sumG += data[i + 1]; sumB += data[i + 2]
        }
        const color = rgbToColorBucket(
          Math.round(sumR / pixels),
          Math.round(sumG / pixels),
          Math.round(sumB / pixels),
        )

        const { error: upErr } = await supabase
          .from('wallpapers')
          .update({ dominant_color: color })
          .eq('id', w.id)

        if (upErr) throw upErr
        updated++
      } catch (e: any) {
        errors.push(`id=${w.id}: ${e?.message ?? e}`)
      }
    }),
  )

  return NextResponse.json({
    processed: wallpapers.length,
    updated,
    remaining: (remaining ?? 0) - updated,
    errors,
    done: wallpapers.length < BATCH,
  })
}
