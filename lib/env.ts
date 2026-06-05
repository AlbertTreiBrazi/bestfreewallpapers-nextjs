/**
 * Centralised env validation.
 * Client vars (NEXT_PUBLIC_*) are validated at import time on both server and client.
 * Server-only vars are validated lazily (inside the function that uses them)
 * because they are not available in the browser bundle.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Add it to your .env.local file or deployment environment.`
    )
  }
  return value
}

export function getSupabaseUrl(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_URL')
}

export function getSupabaseAnonKey(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function getServiceRoleKey(): string {
  return requireEnv('SUPABASE_SERVICE_ROLE_KEY')
}

export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.bestfreewallpapers.com'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestfreewallpapers.com'
