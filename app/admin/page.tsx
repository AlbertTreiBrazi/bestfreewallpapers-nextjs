import { Metadata } from 'next'
import AdminPageClient from './AdminPageClient'

export const metadata: Metadata = {
  title: 'Admin Panel — BestFreeWallpapers',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return <AdminPageClient />
}
