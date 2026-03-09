'use client'

import { useState } from 'react'
import styles from './attendees.module.css'

/* ── Static data — faithful port of attendees-page.html (P-012) ── */

type TicketType = 'vip' | 'standard' | 'early'
type Status     = 'checked-in' | 'registered' | 'cancelled'

interface Attendee {
  initials:    string
  name:        string
  email:       string
  company:     string
  ticket:      TicketType
  regDate:     string
  status:      Status
}

const ATTENDEES: Attendee[] = [
  { initials: 'SC', name: 'Sarah Chen',       email: 'sarah.chen@techcorp.com',   company: 'TechCorp',      ticket: 'vip',      regDate: 'Feb 14, 2026', status: 'checked-in'  },
  { initials: 'MR', name: 'Michael Rodriguez', email: 'm.rodriguez@startup.io',    company: 'StartupIO',     ticket: 'standard', regDate: 'Feb 18, 2026', status: 'checked-in'  },
  { initials: 'EP', name: 'Emma Parker',       email: 'emma.p@designstudio.com',   company: 'Design Studio', ticket: 'early',    regDate: 'Jan 25, 2026', status: 'registered'  },
  { initials: 'DK', name: 'David Kim',         email: 'd.kim@enterprise.co',       company: 'Enterprise Co', ticket: 'vip',      regDate: 'Feb 22, 2026', status: 'checked-in'  },
  { initials: 'LW', name: 'Lisa Wong',         email: 'lisa@cloudservices.net',    company: 'Cloud Services',ticket: 'standard', regDate: 'Mar 1, 2026',  status: 'registered'  },
  { initials: 'JT', name: 'James Thompson',    email: 'j.thompson@innovate.ai',    company: 'Innovate AI',   ticket: 'standard', regDate: 'Feb 10, 2026', status: 'cancelled'   },
  { initials: 'AN', name: 'Aisha Noor',        email: 'aisha@globaltech.org',      company: 'Global Tech',   ticket: 'vip',      regDate: 'Jan 30, 2026', status: 'checked-in'  },
  { initials: 'RC', name: 'Robert Chen',       email: 'r.chen@devtools.com',       company: 'DevTools',      ticket: 'early',    regDate: 'Jan 20, 2026', status: 'registered'  },
]

const STATS = [
  { label: 'Check-in Rate',  value: '65%',   valueClass: styles.statValueForest, change: '+12% since yesterday' },
  { label: 'VIP Attendees',  value: '284',   valueClass: styles.statValueGold,   change: '15% of total'         },
  { label: 'Companies',      value: '342',   valueClass: styles.statValueIndigo, change: 'From 28 countries'    },
  { label: 'Avg. Sessions',  value: '4.2',   valueClass: styles.statValueTeal,   change: 'Per attendee'         },
]

const FILTERS = ['All', 'Checked In', 'Registered', 'VIP']

/* ── Ticket badge class map ── */
function ticketClass(t: TicketType): string {
  if (t === 'vip')      return `${styles.ticketBadge} ${styles.ticketBadgeVip}`
  if (t === 'early')    return `${styles.ticketBadge} ${styles.ticketBadgeEarly}`
  return `${styles.ticketBadge} ${styles.ticketBadgeStandard}`
}
function ticketLabel(t: TicketType): string {
  if (t === 'vip')   return 'VIP Pass'
  if (t === 'early') return 'Early Bird'
  return 'Standard'
}

/* ── Status indicator class map ── */
function statusClass(s: Status): string {
  if (s === 'checked-in') return `${styles.statusIndicator} ${styles.statusCheckedIn}`
  if (s === 'registered') return `${styles.statusIndicator} ${styles.statusRegistered}`
  return `${styles.statusIndicator} ${styles.statusCancelled}`
}
function statusDotClass(s: Status): string {
  if (s === 'checked-in') return `${styles.statusDot} ${styles.statusDotCheckedIn}`
  if (s === 'registered') return `${styles.statusDot} ${styles.statusDotRegistered}`
  return `${styles.statusDot} ${styles.statusDotCancelled}`
}
function statusLabel(s: Status): string {
  if (s === 'checked-in') return 'Checked In'
  if (s === 'registered') return 'Registered'
  return 'Cancelled'
}

/* ── SVG icons ── */
const EyeIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
)
const TrendUpIcon = () => (
  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
  </svg>
)

export default function AttendeesPage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = ATTENDEES.filter(a => {
    if (activeFilter === 'All')        return true
    if (activeFilter === 'Checked In') return a.status === 'checked-in'
    if (activeFilter === 'Registered') return a.status === 'registered'
    if (activeFilter === 'VIP')        return a.ticket === 'vip'
    return true
  })

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitle}>
              <h1>Attendees</h1>
              <p className={styles.headerSubtitle}>Manage and track all registered attendees for Tech Summit 2026</p>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.headerStat}>
                <div className={styles.headerStatValue}>1,847</div>
                <div className={styles.headerStatLabel}>Total Registered</div>
              </div>
              <div className={styles.headerStat}>
                <div className={styles.headerStatValue}>1,203</div>
                <div className={styles.headerStatLabel}>Checked In</div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name, email, or company..."
              />
            </div>
            <div className={styles.filterGroup}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn}${activeFilter === f ? ` ${styles.filterBtnActive}` : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className={styles.btnPrimary}>
              <PlusIcon />
              Add Attendee
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className={styles.content}>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {STATS.map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={`${styles.statValue} ${s.valueClass}`}>{s.value}</div>
              <div className={styles.statChange}>
                <TrendUpIcon />
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Company</th>
                <th>Ticket Type</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.email}>
                  <td>
                    <div className={styles.attendeeCell}>
                      <div className={styles.attendeeAvatar}>{a.initials}</div>
                      <div className={styles.attendeeInfo}>
                        <div className={styles.attendeeName}>{a.name}</div>
                        <div className={styles.attendeeEmail}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.companyTag}>{a.company}</span></td>
                  <td><span className={ticketClass(a.ticket)}>{ticketLabel(a.ticket)}</span></td>
                  <td>{a.regDate}</td>
                  <td>
                    <div className={statusClass(a.status)}>
                      <span className={statusDotClass(a.status)} />
                      {statusLabel(a.status)}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionMenu}>
                      <button className={styles.actionBtn}><EyeIcon /></button>
                      <button className={styles.actionBtn}><EditIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button className={styles.paginationBtn}><ChevronLeftIcon /></button>
          <button className={`${styles.paginationBtn} ${styles.paginationBtnActive}`}>1</button>
          <button className={styles.paginationBtn}>2</button>
          <button className={styles.paginationBtn}>3</button>
          <button className={styles.paginationBtn}>4</button>
          <span className={styles.paginationInfo}>...</span>
          <button className={styles.paginationBtn}>23</button>
          <button className={styles.paginationBtn}><ChevronRightIcon /></button>
        </div>

      </main>
    </div>
  )
}
