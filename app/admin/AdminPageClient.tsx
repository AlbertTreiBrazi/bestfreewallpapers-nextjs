'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import dynamic from 'next/dynamic'

// Lazy load the heavy admin panel
const EnhancedAdminPanel = dynamic(
  () => import('@/components/admin/EnhancedAdminPanel').then(m => ({ default: m.EnhancedAdminPanel })),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading Admin Panel...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
)

export default function AdminPageClient() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      router.replace('/')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !profile?.is_admin) {
    return null
  }

  return <EnhancedAdminPanel />
}
