import { SITE_URL } from '@/lib/supabase'

/** BreadcrumbList schema — last item has no `item` URL (current page) */
export function breadcrumbSchema(
  items: { name: string; url?: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  }
}

/** ItemList schema for category / collection pages */
export function itemListSchema(
  name: string,
  pageUrl: string,
  items: { name: string; slug: string; contentType: 'wallpaper' | 'live-wallpaper' | 'ringtone' }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: pageUrl,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}/${item.contentType}/${item.slug}`,
    })),
  }
}

export { SITE_URL }
