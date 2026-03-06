'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AdminLayout.module.css'

export type AdminSection =
  | 'overview'
  | 'tenants'
  | 'users'
  | 'roles'
  | 'system'
  | 'audit'

interface AdminNavItem {
  label: string
  href: string
  section: AdminSection
}

const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Overview',  href: '/admin',              section: 'overview' },
  { label: 'Tenants',   href: '/admin/tenants',       section: 'tenants'  },
  { label: 'Users',     href: '/admin/users',         section: 'users'    },
  { label: 'Roles',     href: '/admin/roles',         section: 'roles'    },
  { label: 'System',    href: '/admin/system',        section: 'system'   },
  { label: 'Audit Log', href: '/admin/audit',         section: 'audit'    },
]

interface AdminLayoutProps {
  /** Right-side header content: status chip, avatar, actions */
  headerActions?: React.ReactNode
  /** Main page content (KPI grid, tables, panels) */
  children: React.ReactNode
}

/**
 * AdminLayout — Portal surface shell for system administration.
 * Surface: portal (dark top nav, no sidebar, centered max-width body).
 *
 * Structure:
 *   ┌──────────────────────────────────────────────────────┐
 *   │ HEADER (dark/ink)                                    │  ← 56px sticky
 *   │  EMS Admin  [Overview|Tenants|Users|Roles|System|…]  │
 *   │                              [status chip] [avatar]  │
 *   ├──────────────────────────────────────────────────────┤
 *   │                 BODY (max-width 1200px)              │  ← scrollable
 *   │                 {children}                           │
 *   └──────────────────────────────────────────────────────┘
 *
 * Used by: app/(portal)/layout.tsx or app/(admin)/layout.tsx
 */
export function AdminLayout({ headerActions, children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className={styles.shell}>
      <header className={styles.header} role="banner">
        <div className={styles.headerLeft}>
          <Link href="/admin" className={styles.wordmark} aria-label="EMS Admin home">
            EMS Admin
          </Link>

          <nav className={styles.nav} aria-label="Admin navigation">
            {ADMIN_NAV.map(({ label, href, section }) => {
              const isActive =
                pathname === href ||
                (section !== 'overview' && pathname.startsWith(href))
              return (
                <Link
                  key={section}
                  href={href}
                  className={[styles.navItem, isActive ? styles.navItemActive : ''].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {headerActions && (
          <div className={styles.headerRight}>
            {headerActions}
          </div>
        )}
      </header>

      <main className={styles.body}>
        {children}
      </main>
    </div>
  )
}
