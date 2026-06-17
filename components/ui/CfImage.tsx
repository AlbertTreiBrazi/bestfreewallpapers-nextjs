'use client'

/**
 * CfImage — Next.js <Image> cu Cloudflare Transformations loader.
 *
 * De ce există acest component:
 * În Next.js App Router, funcțiile nu pot fi transmise ca props de la
 * Server Components la Client Components. <Image loader={fn}> necesită
 * o funcție ca prop, deci nu poate fi folosit direct în Server Components.
 *
 * Soluție: acest wrapper marchează 'use client' și internalizează cfLoader,
 * astfel că Server Components importă <CfImage> fără să transmită funcții.
 *
 * Usage: înlocuiește <Image loader={cfLoader} ...> cu <CfImage ...>
 */

import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { cfLoader } from '@/lib/cloudflare-loader'

type CfImageProps = Omit<ImageProps, 'loader'>

export function CfImage(props: CfImageProps) {
  return <Image {...props} loader={cfLoader} />
}
