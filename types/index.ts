export interface Wallpaper {
  id: number
  title: string
  slug: string
  description: string | null
  image_url: string
  thumbnail_url: string | null
  download_url: string
  width: number
  height: number
  category: string | null
  category_id: number | null
  tags: string[] | null
  is_premium: boolean
  is_active: boolean
  is_featured: boolean | null
  download_count: number
  aspect_ratio: string | null
  device_type: string | null
  seo_title?: string | null
  seo_description?: string | null
  created_at: string
  updated_at: string
}

export interface Ringtone {
  id: number
  title: string
  slug: string
  description: string | null
  audio_url: string
  m4r_url: string | null
  cover_image_url: string | null
  duration_seconds: number
  file_size_bytes: number | null
  tags: string[] | null
  is_premium: boolean
  is_published: boolean
  is_active: boolean
  downloads_count: number
  plays_count: number
  creator_name: string | null
  seo_title: string | null
  seo_description: string | null
  meta_keywords: string[] | null
  created_at: string
  updated_at: string
}

export interface LiveWallpaper {
  id: number
  title: string
  slug: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number | null
  tags: string[] | null
  is_premium: boolean
  is_published: boolean
  is_active: boolean
  downloads_count: number
  views_count: number
  category: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  preview_image: string | null
  preview_thumbnail: string | null
  is_active: boolean
  sort_order: number
  seo_title: string | null
  seo_description: string | null
  meta_keywords: string[] | null
}

export interface RingtoneCategory {
  id: number
  name: string
  slug: string
  description: string | null
  preview_image: string | null
  is_active: boolean
  sort_order: number
  seo_title: string | null
  seo_description: string | null
}

export interface Profile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  plan_type: 'free' | 'premium'
  premium_expires_at: string | null
  created_at: string
  updated_at: string
}
