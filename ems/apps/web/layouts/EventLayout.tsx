import React from 'react'
import { TopBar } from '@/components/nav/TopBar'
import styles from './EventLayout.module.css'

interface EventLayoutProps {
  /** Page title shown in the TopBar */
  title: string
  /** TopBar right-side actions (view toggle, Create Event button, etc.) */
  actions?: React.ReactNode
  /**
   * Optional sub-navigation tabs rendered directly below the TopBar.
   * Used in event detail pages: Sessions | Speakers | Attendees | etc.
   */
  subnav?: React.ReactNode
  /**
   * Filter bar content: search input + select filters + count badge.
   * Rendered in the sticky filter strip below TopBar / subnav.
   */
  filters?: React.ReactNode
  /** Main content area — event card grid, list table, or event form */
  children: React.ReactNode
}

/**
 * EventLayout — page content container for event list + event detail pages.
 * Surface: app (used inside AppLayout's main column).
 *
 * Structure:
 *   ┌───────────────────────────────────────────┐
 *   │ TopBar: title + actions                   │  ← sticky 56px
 *   ├───────────────────────────────────────────┤
 *   │ [subnav]  ← tabs for event detail         │  ← optional, sticky
 *   ├───────────────────────────────────────────┤
 *   │ [filters] ← search, selects, count        │  ← optional, sticky
 *   ├───────────────────────────────────────────┤
 *   │ children  ← card grid / table / form      │  ← scrollable
 *   └───────────────────────────────────────────┘
 *
 * Used by:
 *   app/(app)/events/page.tsx          (filters, card grid)
 *   app/(app)/events/[id]/page.tsx     (subnav, event detail form)
 *   app/(app)/agenda/page.tsx          (filters, schedule grid)
 *   app/(app)/attendees/page.tsx       (filters, attendee table)
 *   app/(app)/registrations/page.tsx   (filters + subnav, workflow tabs)
 */
export function EventLayout({
  title,
  actions,
  subnav,
  filters,
  children,
}: EventLayoutProps) {
  return (
    <div className={styles.layout}>
      <TopBar title={title} actions={actions} />

      {subnav && (
        <nav className={styles.subnav} aria-label={`${title} sub-navigation`}>
          {subnav}
        </nav>
      )}

      {filters && (
        <div className={styles.filters} role="search" aria-label="Filter controls">
          {filters}
        </div>
      )}

      <main className={styles.content}>
        {children}
      </main>
    </div>
  )
}
