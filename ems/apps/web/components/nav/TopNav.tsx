'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './TopNav.module.css'

const NAV_LINKS = [
  { label: 'Dashboard',     href: '/dashboard'     },
  { label: 'Events',        href: '/events'         },
  { label: 'Agenda',        href: '/agenda'         },
  { label: 'Speakers',      href: '/speakers'       },
  { label: 'Attendees',     href: '/attendees'      },
  { label: 'Registrations', href: '/registrations'  },
  { label: 'Ticketing',     href: '/ticketing'      },
  { label: 'Sponsors',      href: '/sponsors'       },
  { label: 'Exhibitors',    href: '/exhibitors'     },
  { label: 'Analytics',     href: '/analytics'      },
  { label: 'Notifications', href: '/notifications'  },
  { label: 'Settings',      href: '/settings'       },
]

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

        {/* Nav links — all app tabs, no icons */}
        <div className={styles.navLinks}>
          {NAV_LINKS.map(link => {
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

        {/* User menu */}
        <div className={styles.userMenu}>
          <span className={styles.userName}>Sarah Chen</span>
          <div className={styles.userAvatar}>SC</div>
        </div>

      </div>
    </nav>
  )
}
