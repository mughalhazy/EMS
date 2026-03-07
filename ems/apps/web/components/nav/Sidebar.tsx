'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import styles from './Sidebar.module.css'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard',     href: '/dashboard',     icon: '◈' },
      { label: 'Events',        href: '/events',         icon: '◉' },
      { label: 'Agenda',        href: '/agenda',         icon: '▦' },
      { label: 'Speakers',      href: '/speakers',       icon: '◎' },
    ],
  },
  {
    label: 'Registration',
    items: [
      { label: 'Attendees',     href: '/attendees',      icon: '◑' },
      { label: 'Registrations', href: '/registrations',  icon: '◐' },
      { label: 'Ticketing',     href: '/ticketing',      icon: '◆' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Sponsors',      href: '/sponsors',       icon: '◇' },
      { label: 'Exhibitors',    href: '/exhibitors',     icon: '▣' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics',     href: '/analytics',      icon: '◫' },
      { label: 'Notifications', href: '/notifications',  icon: '◬' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings',      href: '/settings',       icon: '◌' },
    ],
  },
]

// Static session user — connect to auth context when auth is wired
const SESSION_USER = { name: 'Sarah Chen', initials: 'SC', role: 'Admin' }

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}>
      {/* ── Header / Logo ── */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>E</span>
          {!collapsed && <span className={styles.wordmark}>EventHub</span>}
        </div>
        <button
          className={styles.toggle}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
          }
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className={styles.nav} aria-label="Main navigation">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className={styles.navSection}>
            {!collapsed && <p className={styles.navLabel}>{section.label}</p>}
            {section.items.map(item => {
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
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className={styles.footer}>
        <div className={styles.userCell} title={collapsed ? SESSION_USER.name : undefined}>
          <Avatar initials={SESSION_USER.initials} color="teal" size="sm" />
          {!collapsed && (
            <div className={styles.userText}>
              <span className={styles.userName}>{SESSION_USER.name}</span>
              <span className={styles.userRole}>{SESSION_USER.role}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
