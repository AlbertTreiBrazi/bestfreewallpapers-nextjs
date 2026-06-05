import { createClient } from '@supabase/supabase-js'

// NEXT_PUBLIC_ vars are inlined at build time.
// For production: set them in Vercel dashboard / deployment env.
// For local dev: copy .env.local.example → .env.local and fill in your values.
// For CI builds without env vars: the build compiles but runtime DB calls fail gracefully.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.bestfreewallpapers.com'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestfreewallpapers.com'
export const SUPABASE_URL = supabaseUrl

// Client-side Supabase client (for React components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for SSR / Server Components)
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
}

// Admin Supabase client — uses service role key, bypasses RLS.
// Use ONLY in server-side API routes, NEVER expose to client.
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
