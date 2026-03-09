'use client'

import { usePathname } from 'next/navigation'
import { AppLayout } from '@/layouts/AppLayout'
import { AppTopLayout } from '@/layouts/AppTopLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (isDashboard) return <AppLayout>{children}</AppLayout>
  return <AppTopLayout>{children}</AppTopLayout>
}
