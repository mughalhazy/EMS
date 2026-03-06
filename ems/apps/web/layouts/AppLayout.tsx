import React from 'react'
import { Sidebar } from '@/components/nav/Sidebar'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * AppLayout — the operational app shell.
 * Surface: app (dark sidebar, off-white body).
 *
 * Structure:
 *   ┌─────────────┬────────────────────────────┐
 *   │  Sidebar    │  main (scrollable column)  │
 *   │  (220px)    │  ← page content goes here  │
 *   │  [56px mob] │                            │
 *   └─────────────┴────────────────────────────┘
 *
 * Used in: app/(app)/layout.tsx
 * Each page inside is responsible for its own TopBar + content layout.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        {children}
      </div>
    </div>
  )
}
