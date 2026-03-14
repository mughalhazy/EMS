'use client'

import { usePathname } from 'next/navigation'
import { AppLayout } from '@/layouts/AppLayout'
import { AppTopLayout } from '@/layouts/AppTopLayout'

/* Pages that use the sidebar (AppLayout) */
const SIDEBAR_PATHS = ['/dashboard', '/analytics', '/notifications', '/settings']

function usesSidebar(pathname: string) {
  return SIDEBAR_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (usesSidebar(pathname)) return <AppLayout>{children}</AppLayout>
  return <AppTopLayout>{children}</AppTopLayout>
}
