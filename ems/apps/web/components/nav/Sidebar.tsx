'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

/* ── Static nav data — faithful port of dashboard-side-nav .html ── */

interface NavItem {
  label:  string
  href:   string
  badge?: string
  icon:   React.ReactNode
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Core',
    items: [
      {
        label: 'Dashboard', href: '/dashboard',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
      },
      {
        label: 'Events', href: '/events', badge: '8',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
      },
      {
        label: 'Agenda', href: '/agenda',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
      },
      {
        label: 'Speakers', href: '/speakers',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>,
      },
    ],
  },
  {
    label: 'Registration',
    items: [
      {
        label: 'Attendees', href: '/attendees',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
      },
      {
        label: 'Registrations', href: '/registrations',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
      },
      {
        label: 'Ticketing', href: '/ticketing',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>,
      },
    ],
  },
  {
    label: 'Commerce',
    items: [
      {
        label: 'Sponsors', href: '/sponsors',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
      },
      {
        label: 'Exhibitors', href: '/exhibitors',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        label: 'Analytics', href: '/analytics',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
      },
      {
        label: 'Notifications', href: '/notifications', badge: '3',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Settings', href: '/settings',
        icon: <svg className={styles.navItemIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
      },
    ],
  },
]

/* ── Sidebar ── */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>

      {/* Logo */}
      <Link href="/dashboard" className={styles.logo}>
        <div className={styles.logoMark}>E</div>
        <span className={styles.logoText}>EventHub</span>
      </Link>

      {/* Nav sections */}
      <nav>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className={styles.navSection}>
            <span className={styles.navLabel}>{section.label}</span>
            {section.items.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem}${isActive ? ` ${styles.navItemActive}` : ''}`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && <span className={styles.navItemBadge}>{item.badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer — user profile */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>AJ</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Alex Johnson</div>
            <div className={styles.userRole}>Event Manager</div>
          </div>
        </div>
      </div>

    </aside>
  )
}
