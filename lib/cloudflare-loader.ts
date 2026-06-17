/**
 * Cloudflare Image Transformations loader for Next.js <Image>.
 *
 * Transforms images stored in Cloudflare R2 (served via cdn.bestfreewallpapers.com)
 * using Cloudflare's /cdn-cgi/image/ endpoint.
 *
 * Usage on any <Image> component:
 *   import { cfLoader } from '@/lib/cloudflare-loader'
 *   <Image loader={cfLoader} src={imageUrl} ... />
 *
 * Rules:
 * - Only transforms URLs from cdn.bestfreewallpapers.com (our R2 CDN).
 * - Falls back to the original src for any other domain.
 * - Outputs WebP format at the requested width and quality.
 * - Each unique (src + width + quality) combination counts as ONE
 *   Cloudflare transformation per month, regardless of traffic.
 */
export function cfLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  // Safety: only transform images from our own CDN
  if (!src.startsWith('https://cdn.bestfreewallpapers.com/')) {
    return src
  }

  const pathname = new URL(src).pathname
  const q = quality ?? 80

  return `https://cdn.bestfreewallpapers.com/cdn-cgi/image/width=${width},quality=${q},format=webp${pathname}`
}
