import React from 'react'
import { TopBar } from '@/components/nav/TopBar'
import styles from './DashboardLayout.module.css'

interface DashboardLayoutProps {
  /** Page title shown in the TopBar */
  title: string
  /** TopBar right-side actions (buttons, avatar, etc.) */
  actions?: React.ReactNode
  /** Full-width alert/banner rendered above content (live alerts, system notices) */
  banner?: React.ReactNode
  /** Fixed-width right panel (320px) — attention queue, live event stats */
  rightPanel?: React.ReactNode
  /** Main content area — KPI grid + primary table/content */
  children: React.ReactNode
}

/**
 * DashboardLayout — page content container for operational dashboards.
 * Surface: app (used inside AppLayout's main column).
 *
 * Structure:
 *   ┌──────────────────────────────────────────┐
 *   │ TopBar: title + actions                  │  ← sticky 56px
 *   ├──────────────────────────────────────────┤
 *   │ [banner]  ← live alert, system notice    │  ← optional, full-width
 *   ├──────────────────────────────────────────┤
 *   │ children (KPI grid + table)  │ rightPanel│  ← 1fr | 320px
 *   └──────────────────────────────────────────┘
 *
 * Used by: app/(app)/dashboard/page.tsx
 */
export function DashboardLayout({
  title,
  actions,
  banner,
  rightPanel,
  children,
}: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <TopBar title={title} actions={actions} />

      <div className={styles.body}>
        {banner && (
          <div className={styles.banner} role="status" aria-live="polite">
            {banner}
          </div>
        )}

        <div className={rightPanel ? styles.twoCol : styles.fullCol}>
          <main className={styles.content}>
            {children}
          </main>

          {rightPanel && (
            <aside className={styles.panel} aria-label="Dashboard panel">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
