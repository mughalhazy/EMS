import React from 'react'
import { TopNav } from '@/components/nav/TopNav'
import styles from './AppTopLayout.module.css'

interface AppTopLayoutProps {
  children: React.ReactNode
}

/**
 * AppTopLayout — full-width shell with sticky horizontal top nav.
 * Used for all app pages except /dashboard.
 * Surface: app (white topnav + off-white body).
 *
 * Structure:
 *   ┌────────────────────────────────────────────────┐
 *   │  TopNav (sticky, full width, no sidebar)       │
 *   ├────────────────────────────────────────────────┤
 *   │  main (full width, scrollable page content)    │
 *   └────────────────────────────────────────────────┘
 */
export function AppTopLayout({ children }: AppTopLayoutProps) {
  return (
    <div className={styles.shell}>
      <TopNav />
      <div className={styles.main}>
        {children}
      </div>
    </div>
  )
}
