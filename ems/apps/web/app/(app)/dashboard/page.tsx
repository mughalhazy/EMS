'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { AlertCard } from '@/components/ui/AlertCard'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  events,
  registrations as allRegByEvent,
  attendees  as allAttByEvent,
  speakers,
  tickets    as allTicksByEvent,
  tenant,
} from '@/lib/mock-data'
import styles from './dashboard.module.css'

// ── Derived data ──────────────────────────────────────────────
const allRegs  = Object.values(allRegByEvent).flat()
const allAtts  = Object.values(allAttByEvent).flat()
const allTix   = Object.values(allTicksByEvent).flat()

const totalRevenue = allTix.reduce(
  (sum, t) => sum + (t.priceAmount / 100) * t.quantitySold, 0,
)
const checkedIn         = allAtts.filter(a => a.status === 'checked_in').length
const confirmedSpeakers = speakers.filter(s => s.status === 'confirmed').length
const liveEvents        = events.filter(e => e.status === 'live')
const liveEvent         = liveEvents[0]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

function initials(first: string, last: string) {
  return (first[0] ?? '') + (last[0] ?? '')
}

const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(name: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

const STATUS_COLOR: Record<string, 'teal' | 'forest' | 'amber' | 'brick' | 'neutral'> = {
  live:      'teal',
  published: 'forest',
  draft:     'neutral',
  archived:  'neutral',
  cancelled: 'brick',
}

const REG_COLOR: Record<string, 'forest' | 'amber' | 'brick' | 'neutral'> = {
  confirmed:  'forest',
  approved:   'forest',
  pending:    'amber',
  cancelled:  'brick',
  waitlisted: 'neutral',
}

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title={tenant.name}
        subtitle="Organizer dashboard — today's snapshot"
      >
        <Link href="/events" className={styles.headerBtn}>+ New Event</Link>
      </PageHeader>

      {/* Live event alert */}
      {liveEvent && (
        <div className={styles.alertRow}>
          <AlertCard variant="indigo" title={`${liveEvent.name} is LIVE`} live>
            {liveEvent.code} · {liveEvent.timezone} · ends {fmtDate(liveEvent.endAt)}
          </AlertCard>
        </div>
      )}

      {/* KPI grid */}
      <div className={styles.kpiSection}>
        <div className={styles.kpiGrid}>
          <KpiCard label="Total Events"        value={String(events.length)}         color="i" delta="+1 this quarter" deltaType="positive" />
          <KpiCard label="Live Now"             value={String(liveEvents.length)}     color="t" />
          <KpiCard label="Total Registrations" value={String(allRegs.length)}        color="f" delta="+4 this week"    deltaType="positive" />
          <KpiCard label="Checked In"           value={String(checkedIn)}             color="f" />
          <KpiCard label="Total Revenue"        value={fmtCurrency(totalRevenue)}     color="g" delta="+12% vs target"  deltaType="positive" />
          <KpiCard label="Confirmed Speakers"   value={String(confirmedSpeakers)}    color="i" />
        </div>
      </div>

      {/* Events + Recent Registrations */}
      <div className={styles.bottomRow}>

        {/* Events table */}
        <Card title="Events" actions={
          <Link href="/events" className={styles.viewAll}>View all →</Link>
        } flush>
          <table className={styles.table}>
            <thead>
              <tr className={styles.thead}>
                <th className={styles.th}>Event</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Status</th>
                <th className={[styles.th, styles.thRight].join(' ')}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => {
                const regCount = (allRegByEvent[ev.id] ?? []).length
                return (
                  <tr key={ev.id} className={i < events.length - 1 ? styles.tr : styles.trLast}>
                    <td className={styles.td}>
                      <div className={styles.evName}>{ev.name}</div>
                      <div className={styles.evCode}>{ev.code}</div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.tdMuted}>{fmtDate(ev.startAt)}</span>
                    </td>
                    <td className={styles.td}>
                      <Badge color={STATUS_COLOR[ev.status] ?? 'neutral'}>{ev.status}</Badge>
                    </td>
                    <td className={[styles.td, styles.tdRight].join(' ')}>
                      <span className={styles.tdMono}>{regCount}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

        {/* Recent registrations */}
        <Card title="Recent Registrations">
          <div className={styles.regList}>
            {allRegs.slice(0, 8).map(reg => {
              const att = allAtts.find(a => a.id === reg.attendeeId)
              const ev  = events.find(e => e.id === reg.eventId)
              if (!att) return null
              const fullName = `${att.firstName} ${att.lastName}`
              return (
                <div key={reg.id} className={styles.regRow}>
                  <Avatar
                    initials={initials(att.firstName, att.lastName)}
                    color={avatarColor(fullName)}
                    size="sm"
                  />
                  <div className={styles.regInfo}>
                    <div className={styles.regName}>{fullName}</div>
                    <div className={styles.regEvent}>{ev?.code ?? reg.eventId}</div>
                  </div>
                  <Badge color={REG_COLOR[reg.status] ?? 'neutral'}>{reg.status}</Badge>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
