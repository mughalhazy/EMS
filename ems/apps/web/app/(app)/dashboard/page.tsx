'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { KpiCard } from '@/components/ui/KpiCard'
import { AlertCard } from '@/components/ui/AlertCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { analyticsService, TenantKpis } from '@/services/analytics.service'
import { eventsService } from '@/services/events.service'
import { Event, EventStatus } from '@/types/domain'
import styles from './dashboard.module.css'

const STATUS_COLOR: Record<EventStatus, 'neutral' | 'indigo' | 'teal'> = {
  draft:     'neutral',
  published: 'indigo',
  live:      'teal',
  archived:  'neutral',
}

const EVENT_COLS: Column<Event>[] = [
  {
    key: 'name',
    header: 'Event',
    render: r => (
      <Link href={`/events/${r.id}`} className={styles.eventLink}>{r.name}</Link>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '110px',
    render: r => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>,
  },
  {
    key: 'startAt',
    header: 'Date',
    width: '120px',
    render: r => fmtDate(r.startAt),
  },
]

function fmtNum(n: number | undefined) {
  return n !== undefined ? n.toLocaleString() : '—'
}
function fmtCurrency(n: number | undefined, currency = 'USD') {
  if (n === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function DashboardPage() {
  const [kpis, setKpis]     = useState<TenantKpis | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.tenantKpis().catch(() => null),
      eventsService.list({ limit: 6 }).catch(() => ({ data: [] as Event[] })),
    ]).then(([k, e]) => {
      setKpis(k)
      setEvents(e.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout
      title="Dashboard"
      actions={
        <Button variant="ghost" size="sm" as="a" href="/events">
          All Events
        </Button>
      }
      banner={
        <AlertCard variant="indigo" live title="Platform status">
          All systems operational — 0 active incidents.
        </AlertCard>
      }
      rightPanel={
        <Card title="Recent Events" flush>
          <DataTable<Event>
            columns={EVENT_COLS}
            rows={events}
            loading={loading}
            emptyMessage="No events yet."
          />
        </Card>
      }
    >
      <div className={styles.kpiGrid}>
        <KpiCard label="Active Events"    value={loading ? '—' : fmtNum(kpis?.activeEvents)}                         color="i" />
        <KpiCard label="Total Events"     value={loading ? '—' : fmtNum(kpis?.totalEvents)}                          color="i" />
        <KpiCard label="Total Revenue"    value={loading ? '—' : fmtCurrency(kpis?.totalRevenue, kpis?.currency)}    color="g" />
        <KpiCard label="Avg Rev / Event"  value={loading ? '—' : fmtCurrency(kpis?.avgRevenuePerEvent, kpis?.currency)} color="g" />
        <KpiCard label="Total Attendees"  value={loading ? '—' : fmtNum(kpis?.totalAttendees)}                       color="f" />
        <KpiCard label="Pending"          value="—"                                                                   color="a" />
      </div>
    </DashboardLayout>
  )
}
