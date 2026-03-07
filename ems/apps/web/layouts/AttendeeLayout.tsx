'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './AttendeeLayout.module.css'

const NAV = [
  { label: 'Events',     href: '/attendee/events'     },
  { label: 'Schedule',   href: '/attendee/schedule'   },
  { label: 'Networking', href: '/attendee/networking' },
  { label: 'Profile',    href: '/attendee/profile'    },
]

export function AttendeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/attendee/events" className={styles.logo} aria-label="EMS Home">
            <span className={styles.logoMark} aria-hidden="true">◈</span>
            <span className={styles.wordmark}>EMS</span>
          </Link>

          <nav className={styles.nav} aria-label="Attendee navigation">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  styles.navLink,
                  pathname.startsWith(item.href) ? styles.navActive : '',
                ].join(' ')}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerRight}>
            <Link href="/attendee/profile" className={styles.avatarBtn} aria-label="My profile">
              <span aria-hidden="true">A</span>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
