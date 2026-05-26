import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eocgtrggcalfptqhgxer.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.bestfreewallpapers.com'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestfreewallpapers.com'
export const SUPABASE_URL = supabaseUrl

// Client-side Supabase client (pentru componente React)
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder')

// Server-side Supabase client (pentru SSR / Server Components)
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey || 'placeholder', {
    auth: {
      persistSession: false,
    },
  })
}

// Admin Supabase client — uses service role key, bypasses RLS
// Use only in server-side API routes, never expose to client
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
