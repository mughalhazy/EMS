'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './TopNav.module.css'

/* ── Static nav data — faithful port of events-top-nav .html ── */

const GROUP_PRIMARY = [
  { label: 'Dashboard',  href: '/dashboard'  },
  { label: 'Events',     href: '/events'      },
  { label: 'Agenda',     href: '/agenda'      },
  { label: 'Speakers',   href: '/speakers'    },
]

const GROUP_ATTENDEES = [
  { label: 'Attendees',     href: '/attendees'     },
  { label: 'Registrations', href: '/registrations' },
  { label: 'Ticketing',     href: '/ticketing'     },
]

const GROUP_EXHIBITS = [
  { label: 'Sponsors',   href: '/sponsors'   },
  { label: 'Exhibitors', href: '/exhibitors' },
]

const GROUP_DATA = [
  { label: 'Analytics',     href: '/analytics'     },
  { label: 'Notifications', href: '/notifications' },
]

/* ── NavGroup helper ── */
function NavGroup({
  links,
  primary,
  pathname,
}: {
  links:    { label: string; href: string }[]
  primary?: boolean
  pathname: string
}) {
  return (
    <div className={`${styles.navGroup}${primary ? ` ${styles.navGroupPrimary}` : ''}`}>
      {links.map(link => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}

/* ── TopNav ── */
export function TopNav() {
  const pathname = usePathname()

  return (
    <nav className={styles.topbar}>
      <div className={styles.container}>

        {/* Logo */}
        <Link href="/dashboard" className={styles.logo}>
          <div className={styles.logoMark}>E</div>
          <span className={styles.logoText}>EventHub</span>
        </Link>

        {/* Nav groups + dividers */}
        <div className={styles.navWrapper}>
          <NavGroup links={GROUP_PRIMARY}   primary pathname={pathname} />
          <div className={styles.navDivider} />
          <NavGroup links={GROUP_ATTENDEES} pathname={pathname} />
          <div className={styles.navDivider} />
          <NavGroup links={GROUP_EXHIBITS}  pathname={pathname} />
          <div className={styles.navDivider} />
          <NavGroup links={GROUP_DATA}      pathname={pathname} />

          {/* Icon action buttons */}
          <div className={styles.navActions}>
            {/* Notifications */}
            <Link href="/notifications" className={styles.navIconBtn} aria-label="Notifications">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span className={styles.navBadge} />
            </Link>

            {/* Settings */}
            <Link href="/settings" className={styles.navIconBtn} aria-label="Settings">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* User menu */}
        <div className={styles.userMenu}>
          <span className={styles.userName}>Sarah Chen</span>
          <div className={styles.userAvatar}>SC</div>
        </div>

      </div>
    </nav>
  )
}
