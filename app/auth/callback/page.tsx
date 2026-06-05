'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.replace('/')
      }
    })
    // Fallback redirect after 3s
    const t = setTimeout(() => router.replace('/'), 3000)
    return () => { clearTimeout(t); subscription.unsubscribe() }
  }, [router])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Signing you in...</p>
    </div>
  )
}
