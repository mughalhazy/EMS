'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { AlertCard } from '@/components/ui/AlertCard'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  events, registrations as allRegByEvent, attendees as allAttByEvent,
  speakers, tickets as allTicksByEvent, tenant,
} from '@/lib/mock-data'
import styles from './dashboard.module.css'

const allRegs = Object.values(allRegByEvent).flat()
const allAtts = Object.values(allAttByEvent).flat()
const allTix  = Object.values(allTicksByEvent).flat()

const totalRevenue      = allTix.reduce((s, t) => s + (t.priceAmount / 100) * t.quantitySold, 0)
const totalCap          = allTix.reduce((s, t) => s + t.quantityTotal, 0)
const totalSold         = allTix.reduce((s, t) => s + t.quantitySold, 0)
const checkedIn         = allAtts.filter(a => a.status === 'checked_in').length
const confirmedSpeakers = speakers.filter(s => s.status === 'confirmed').length
const liveEvents        = events.filter(e => e.status === 'live')
const liveEvent         = liveEvents[0]
const checkinRate       = allAtts.length > 0 ? Math.round((checkedIn / allAtts.length) * 100) : 0
const capacityRate      = totalCap > 0 ? Math.round((totalSold / totalCap) * 100) : 0
const revenueTarget     = 1_500_000
const revenueRate       = Math.min(Math.round((totalRevenue / revenueTarget) * 100), 100)
const regRate           = Math.min(Math.round((allRegs.length / 2000) * 100), 100)

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDateParts(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day:   d.getDate(),
  }
}

function getRegCount(eventId: string) { return (allRegByEvent[eventId] ?? []).length }
function getRevenue(eventId: string) {
  const tix = allTicksByEvent[eventId] ?? []
  return tix.reduce((s, t) => s + (t.priceAmount / 100) * t.quantitySold, 0)
}
function getCapacityPct(eventId: string) {
  const tix  = allTicksByEvent[eventId] ?? []
  const cap  = tix.reduce((s, t) => s + t.quantityTotal, 0)
  const sold = tix.reduce((s, t) => s + t.quantitySold, 0)
  return cap > 0 ? Math.round((sold / cap) * 100) : 0
}

function regBadgeColor(status: string) {
  if (status === 'confirmed' || status === 'approved') return 'forest' as const
  if (status === 'pending') return 'amber' as const
  if (status === 'cancelled') return 'brick' as const
  return 'neutral' as const
}

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <PageHeader title={tenant.name} subtitle="Organizer dashboard — live snapshot">
        <Link href="/events" className={styles.headerBtn}>+ New Event</Link>
      </PageHeader>

      {liveEvent && (
        <div className={styles.alertRow}>
          <AlertCard variant="indigo" title={`${liveEvent.name} is LIVE`} live>
            {liveEvent.code} · {liveEvent.timezone} · ends {fmtDate(liveEvent.endAt)}
          </AlertCard>
        </div>
      )}

      {/* KPI strip — 4 semantic metrics */}
      <div className={styles.kpiSection}>
        <div className={styles.kpiGrid}>
          <KpiCard label="Total Attendees"  value={allAtts.length.toLocaleString()}  color="t" delta="+18 this week"      deltaType="positive" />
          <KpiCard label="Ticket Revenue"   value={fmtCurrency(totalRevenue)}         color="g" delta="+12% vs target"     deltaType="positive" />
          <KpiCard label="Active Events"    value={String(liveEvents.length + events.filter(e => e.status === 'published').length)} color="i" delta={`${liveEvents.length} live now`} deltaType="positive" />
          <KpiCard label="Check-in Rate"    value={`${checkinRate}%`}                 color="f" delta="+2.3% improvement"  deltaType="positive" />
        </div>
      </div>

      {/* Main content — events list + right panel */}
      <div className={styles.contentGrid}>

        {/* Events */}
        <Card title="Events" actions={<Link href="/events" className={styles.viewAll}>View all</Link>} flush>
          {events.map(ev => {
            const { month, day } = getDateParts(ev.startAt)
            const regCount = getRegCount(ev.id)
            const revenue  = getRevenue(ev.id)
            const capPct   = getCapacityPct(ev.id)
            return (
              <Link key={ev.id} href={`/events/${ev.id}`} className={styles.eventLink}>
                <div className={styles.eventCard}>
                  <div className={styles.dateBlock}>
                    <div className={styles.dateMonth}>{month}</div>
                    <div className={styles.dateDay}>{day}</div>
                  </div>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventMeta}>
                      <span className={`${styles.eventBadge} ${styles[ev.status]}`}>{ev.status}</span>
                    </div>
                    <div className={styles.eventName}>{ev.name}</div>
                    <div className={styles.eventStats}>
                      <div className={styles.eventStat}>
                        <div className={styles.eventStatValue}>{regCount.toLocaleString()}</div>
                        <div className={styles.eventStatLabel}>Registered</div>
                      </div>
                      <div className={styles.eventStat}>
                        <div className={`${styles.eventStatValue} ${styles.revenue}`}>{fmtCurrency(revenue)}</div>
                        <div className={styles.eventStatLabel}>Revenue</div>
                      </div>
                      <div className={styles.eventStat}>
                        <div className={styles.eventStatValue}>{capPct}%</div>
                        <div className={styles.eventStatLabel}>Capacity</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </Card>

        {/* Right panel */}
        <div className={styles.rightPanel}>

          {/* Performance */}
          <Card title="Performance">
            <div className={styles.quickStat}>
              <div className={styles.quickStatHeader}>
                <span className={styles.quickStatLabel}>Registrations</span>
                <span className={styles.quickStatValue}>{allRegs.length.toLocaleString()}</span>
              </div>
              <div className={styles.bar}>
                <div className={`${styles.barFill} ${styles.teal}`} style={{ width: `${regRate}%` }} />
              </div>
              <div className={styles.quickStatNote}>{totalSold.toLocaleString()} of {totalCap.toLocaleString()} seats filled</div>
            </div>
            <div className={styles.quickStat}>
              <div className={styles.quickStatHeader}>
                <span className={styles.quickStatLabel}>Revenue</span>
                <span className={styles.quickStatValue}>{revenueRate}%</span>
              </div>
              <div className={styles.bar}>
                <div className={`${styles.barFill} ${styles.gold}`} style={{ width: `${revenueRate}%` }} />
              </div>
              <div className={styles.quickStatNote}>{fmtCurrency(totalRevenue)} of {fmtCurrency(revenueTarget)} target</div>
            </div>
            <div className={styles.quickStat}>
              <div className={styles.quickStatHeader}>
                <span className={styles.quickStatLabel}>Capacity</span>
                <span className={styles.quickStatValue}>{capacityRate}%</span>
              </div>
              <div className={styles.bar}>
                <div className={`${styles.barFill} ${styles.indigo}`} style={{ width: `${capacityRate}%` }} />
              </div>
              <div className={styles.quickStatNote}>{confirmedSpeakers} confirmed speakers</div>
            </div>
          </Card>

          {/* Recent Registrations */}
          <Card title="Recent Registrations" actions={<Link href="/registrations" className={styles.viewAll}>View all</Link>}>
            <div className={styles.regList}>
              {allRegs.slice(0, 6).map(reg => {
                const att = allAtts.find(a => a.id === reg.attendeeId)
                const ev  = events.find(e => e.id === reg.eventId)
                if (!att) return null
                return (
                  <div key={reg.id} className={styles.regRow}>
                    {/* Single color family for all avatars — no color pot */}
                    <Avatar initials={att.firstName[0] + att.lastName[0]} color="indigo" size="sm" />
                    <div className={styles.regInfo}>
                      <div className={styles.regName}>{att.firstName} {att.lastName}</div>
                      <div className={styles.regEvent}>{ev?.code ?? reg.eventId}</div>
                    </div>
                    <Badge color={regBadgeColor(reg.status)}>{reg.status}</Badge>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
