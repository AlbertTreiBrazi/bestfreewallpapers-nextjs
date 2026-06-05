import { createClient } from '@supabase/supabase-js'

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}.\n` +
      'Copy .env.local.example → .env.local and fill in your Supabase project values.',
    )
  }
  return value
}

const supabaseUrl = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

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
