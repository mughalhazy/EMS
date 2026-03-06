'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

interface NavItem {
  label: string
  href: string
  icon: string
  pip?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',      href: '/dashboard',      icon: '◈' },
  { label: 'Events',         href: '/events',         icon: '◉' },
  { label: 'Agenda',         href: '/agenda',         icon: '▦' },
  { label: 'Speakers',       href: '/speakers',       icon: '◎' },
  { label: 'Attendees',      href: '/attendees',      icon: '◑' },
  { label: 'Registrations',  href: '/registrations',  icon: '◐' },
  { label: 'Ticketing',      href: '/ticketing',      icon: '◆' },
  { label: 'Sponsors',       href: '/sponsors',       icon: '◇' },
  { label: 'Exhibitors',     href: '/exhibitors',     icon: '▣' },
  { label: 'Analytics',      href: '/analytics',      icon: '◫' },
  { label: 'Notifications',  href: '/notifications',  icon: '◬' },
  { label: 'Settings',       href: '/settings',       icon: '◌' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}>
      <div className={styles.header}>
        {!collapsed && (
          <span className={styles.wordmark}>EMS</span>
        )}
        <button
          className={styles.toggle}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[styles.item, isActive ? styles.active : ''].join(' ')}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.icon} aria-hidden="true">{item.icon}</span>
              {!collapsed && <span className={styles.itemLabel}>{item.label}</span>}
              {!collapsed && isActive && <span className={styles.pip} aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
