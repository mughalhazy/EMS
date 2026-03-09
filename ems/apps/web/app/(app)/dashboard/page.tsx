'use client'

import Link from 'next/link'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import {
  events, registrations as allRegByEvent, attendees as allAttByEvent,
  tickets as allTicksByEvent, notifications,
} from '@/lib/mock-data'
import styles from './dashboard.module.css'

/* ── Data ──────────────────────────────────────────────────── */
const allRegs = Object.values(allRegByEvent).flat()
const allAtts = Object.values(allAttByEvent).flat()
const allTix  = Object.values(allTicksByEvent).flat()

const totalRevenue      = allTix.reduce((s, t) => s + (t.priceAmount / 100) * t.quantitySold, 0)
const totalCap          = allTix.reduce((s, t) => s + t.quantityTotal, 0)
const totalSold         = allTix.reduce((s, t) => s + t.quantitySold, 0)
const checkedIn         = allAtts.filter(a => a.status === 'checked_in').length
const liveEvents        = events.filter(e => e.status === 'live')
const checkinRate       = allAtts.length > 0 ? Math.round((checkedIn / allAtts.length) * 100) : 0
const capacityRate      = totalCap > 0 ? Math.round((totalSold / totalCap) * 100) : 0
const revenueTarget     = 1_500_000
const revenueRate       = Math.min(Math.round((totalRevenue / revenueTarget) * 100), 100)
const regRate           = Math.min(Math.round((allRegs.length / 2000) * 100), 100)
const pendingNotifs     = notifications.filter(n => n.status === 'sent' || n.status === 'queued' || n.status === 'failed').length

function getRegCount(id: string) { return (allRegByEvent[id] ?? []).length }
function getRevenue(id: string) {
  return (allTicksByEvent[id] ?? []).reduce((s, t) => s + (t.priceAmount / 100) * t.quantitySold, 0)
}
function getCapacityPct(id: string) {
  const tix  = allTicksByEvent[id] ?? []
  const cap  = tix.reduce((s, t) => s + t.quantityTotal, 0)
  const sold = tix.reduce((s, t) => s + t.quantitySold, 0)
  return cap > 0 ? Math.round((sold / cap) * 100) : 0
}

/* ── Formatters ────────────────────────────────────────────── */
function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtAmount(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}
function getDateParts(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day:   d.getDate(),
  }
}

/* Maps mock ticket names to HTML's 3 visual categories: vip/early(workshop)/standard */
function ticketClass(name: string) {
  const n = name.toLowerCase()
  if (n.includes('vip') || n.includes('premium'))              return styles.badgeVip
  if (n.includes('workshop') || n.includes('add-on') || n.includes('sprint') || n.includes('early')) return styles.badgeEarly
  return styles.badgeStandard
}

/* Maps mock status values to HTML's 2 display labels: Checked In / Registered */
function statusLabel(s: string): string {
  if (s === 'confirmed' || s === 'approved') return 'Checked In'
  return 'Registered'
}
function statusClass(s: string) {
  if (s === 'confirmed' || s === 'approved') return styles.badgeCheckedIn
  return styles.badgeRegistered
}

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className={styles.page}>

      {/* Sticky topbar */}
      <div className={styles.topbar}>
        <div className={styles.dateSelector}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {currentDate}
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className={styles.topbarActions}>
          <Link href="/notifications" className={styles.iconBtn}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {pendingNotifs > 0 && <span className={styles.iconBtnBadge}>{pendingNotifs}</span>}
          </Link>
          <Link href="/events" className={styles.btnPrimary}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>
      </div>

      <div className={styles.content}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Event Dashboard</h1>
          <p className={styles.pageSubtitle}>Manage all your events from one powerful platform</p>
        </div>

        {/* KPI strip — staggered fade-in per HTML */}
        <div className={styles.statsGrid}>
          <KpiCard label="Total Attendees" value={allAtts.length.toLocaleString()}  color="t" delta="+24.8% this month"   deltaType="positive" />
          <KpiCard label="Ticket Revenue"  value={fmtCurrency(totalRevenue)}         color="g" delta="+18.2% vs last month" deltaType="positive" />
          <KpiCard label="Active Events"   value={String(liveEvents.length + events.filter(e => e.status === 'published').length)} color="i" delta="+3 this week" deltaType="positive" />
          <KpiCard label="Check-in Rate"   value={`${checkinRate}%`}                 color="f" delta="+2.3% improvement"   deltaType="positive" />
        </div>

        {/* Content grid */}
        <div className={styles.contentGrid}>

          {/* Upcoming Events */}
          <Card title="Upcoming Events" actions={<Link href="/events" className={styles.cardAction}>View calendar →</Link>} flush>
            {events.map(ev => {
              const { month, day } = getDateParts(ev.startAt)
              return (
                <Link key={ev.id} href={`/events/${ev.id}`} className={styles.eventLink}>
                  <div className={styles.eventCard}>
                    <div className={styles.dateBlock}>
                      <div className={styles.dateMonth}>{month}</div>
                      <div className={styles.dateDay}>{day}</div>
                    </div>
                    <div className={styles.eventInfo}>
                      <div className={styles.eventMeta}>
                        <span className={`${styles.eventBadge} ${ev.status === 'live' ? styles.live : ev.status === 'published' ? styles.upcoming : styles.completed}`}>{ev.status}</span>
                      </div>
                      <div className={styles.eventName}>{ev.name}</div>
                      <div className={styles.eventDetails}>
                        <span className={styles.eventDetailItem}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fmtTime(ev.startAt)} – {fmtTime(ev.endAt)}
                        </span>
                        <span className={styles.eventDetailItem}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Convention Center
                        </span>
                      </div>
                      <div className={styles.eventStats}>
                        <div className={styles.eventStat}>
                          <div className={styles.eventStatValue}>{getRegCount(ev.id).toLocaleString()}</div>
                          <div className={styles.eventStatLabel}>Registered</div>
                        </div>
                        <div className={styles.eventStat}>
                          <div className={styles.eventStatValue}>{fmtCurrency(getRevenue(ev.id))}</div>
                          <div className={styles.eventStatLabel}>Revenue</div>
                        </div>
                        <div className={styles.eventStat}>
                          <div className={styles.eventStatValue}>{getCapacityPct(ev.id)}%</div>
                          <div className={styles.eventStatLabel}>Capacity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </Card>

          {/* Quick Stats */}
          <Card title="Quick Stats" flush>
            <div className={styles.quickStat}>
              <div className={styles.quickStatHeader}>
                <span className={styles.quickStatLabel}>Ticket Sales</span>
                <span className={styles.quickStatValue}>{totalSold.toLocaleString()}</span>
              </div>
              <div className={styles.bar}>
                <div className={`${styles.barFill} ${styles.teal}`} style={{ width: `${regRate}%` }} />
              </div>
              <div className={styles.quickStatNote}>{regRate}% of monthly target</div>
            </div>
            <div className={styles.quickStat}>
              <div className={styles.quickStatHeader}>
                <span className={styles.quickStatLabel}>Revenue Goal</span>
                <span className={styles.quickStatValue}>{fmtCurrency(totalRevenue)}</span>
              </div>
              <div className={styles.bar}>
                <div className={`${styles.barFill} ${styles.gold}`} style={{ width: `${revenueRate}%` }} />
              </div>
              <div className={styles.quickStatNote}>{revenueRate}% of {fmtCurrency(revenueTarget)} target</div>
            </div>
            <div className={styles.quickStat}>
              <div className={styles.quickStatHeader}>
                <span className={styles.quickStatLabel}>Event Capacity</span>
                <span className={styles.quickStatValue}>{capacityRate}%</span>
              </div>
              <div className={styles.bar}>
                <div className={`${styles.barFill} ${styles.indigo}`} style={{ width: `${capacityRate}%` }} />
              </div>
              <div className={styles.quickStatNote}>Great attendance rate!</div>
            </div>
          </Card>
        </div>

        {/* Revenue chart — static months exactly as in HTML */}
        <Card title="Monthly Revenue" actions={<Link href="/analytics" className={styles.cardAction}>View details →</Link>}>
          <div className={styles.revenueChart}>
            {[
              { label: 'Jan', height: '45%' },
              { label: 'Feb', height: '62%' },
              { label: 'Mar', height: '78%' },
              { label: 'Apr', height: '35%' },
              { label: 'May', height: '52%' },
              { label: 'Jun', height: '88%' },
            ].map(({ label, height }) => (
              <div key={label} className={styles.chartBar} style={{ height }}>
                <div className={styles.chartBarLabel}>{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Registrations — matches .table exactly */}
        <Card title="Recent Registrations" actions={<Link href="/registrations" className={styles.cardAction}>View all →</Link>} flush>
          <div className={styles.tableWrap}>
            <table className={styles.regTable}>
              <thead>
                <tr>
                  <th>Attendee</th>
                  <th>Event</th>
                  <th>Ticket Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allRegs.slice(0, 8).map(reg => {
                  const att = allAtts.find(a => a.id === reg.attendeeId)
                  const ev  = events.find(e => e.id === reg.eventId)
                  const tix = allTix.find(t => t.id === reg.ticketId)
                  if (!att) return null
                  return (
                    <tr key={reg.id}>
                      <td>
                        <div className={styles.attendeeCell}>
                          <div className={styles.attendeeAvatar}>
                            {att.firstName[0]}{att.lastName[0]}
                          </div>
                          <span className={styles.attendeeName}>{att.firstName} {att.lastName}</span>
                        </div>
                      </td>
                      <td>{ev?.name ?? reg.eventId}</td>
                      <td>
                        {tix
                          ? <span className={`${styles.badgeBase} ${ticketClass(tix.name)}`}>{tix.name}</span>
                          : '—'
                        }
                      </td>
                      <td className={styles.amountCell}>
                        {tix ? fmtAmount(tix.priceAmount) : '—'}
                      </td>
                      <td>
                        <span className={`${styles.badgeBase} ${statusClass(reg.status)}`}>
                          {statusLabel(reg.status)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  )
}
