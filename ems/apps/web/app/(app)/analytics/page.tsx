'use client'

import React, { useEffect, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import {
  analyticsService,
  EventKpis,
  RevenueSummary,
  FunnelMetrics,
  AttendanceTrend,
} from '@/services/analytics.service'
import { Event } from '@/types/domain'
import styles from './analytics.module.css'

type RevenueRow = RevenueSummary['byTicketType'][number]
type AttendanceRow = AttendanceTrend['byDay'][number]
type FunnelRow = FunnelMetrics['byStep'][number]

const REVENUE_COLS: Column<RevenueRow>[] = [
  { key: 'ticketName', header: 'Ticket Type' },
  { key: 'count',      header: 'Sold',  width: '80px',  render: r => r.count.toLocaleString() },
  { key: 'revenue',    header: 'Revenue', width: '120px', render: r => fmtCurrency(r.revenue) },
]

const ATTENDANCE_COLS: Column<AttendanceRow>[] = [
  { key: 'date',          header: 'Date',         width: '140px', render: r => fmtDate(r.date) },
  { key: 'registrations', header: 'Registrations', width: '130px', render: r => r.registrations.toLocaleString() },
  { key: 'checkins',      header: 'Check-ins',     width: '110px', render: r => r.checkins.toLocaleString() },
]

const FUNNEL_COLS: Column<FunnelRow>[] = [
  { key: 'step',       header: 'Step'     },
  { key: 'count',      header: 'Count',      width: '100px', render: r => r.count.toLocaleString() },
  { key: 'dropOffRate', header: 'Drop-off',  width: '100px', render: r => `${(r.dropOffRate * 100).toFixed(1)}%` },
]

function fmtCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function fmtPct(n: number) { return `${(n * 100).toFixed(1)}%` }

export default function AnalyticsPage() {
  const [events, setEvents]       = useState<Event[]>([])
  const [eventId, setEventId]     = useState<string>('')
  const [kpis, setKpis]           = useState<EventKpis | null>(null)
  const [revenue, setRevenue]     = useState<RevenueSummary | null>(null)
  const [attendance, setAttendance] = useState<AttendanceTrend | null>(null)
  const [funnel, setFunnel]       = useState<FunnelMetrics | null>(null)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingData, setLoadingData]     = useState(false)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => {
        setEvents(r.data)
        if (r.data.length > 0) setEventId(r.data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoadingData(true)
    setKpis(null); setRevenue(null); setAttendance(null); setFunnel(null)
    Promise.all([
      analyticsService.eventKpis(eventId).catch(() => null),
      analyticsService.revenue(eventId).catch(() => null),
      analyticsService.attendance(eventId).catch(() => null),
      analyticsService.funnelMetrics(eventId).catch(() => null),
    ]).then(([k, rv, at, fn]) => {
      setKpis(k); setRevenue(rv); setAttendance(at); setFunnel(fn)
    }).finally(() => setLoadingData(false))
  }, [eventId])

  return (
    <div className={styles.page}>
      <TopBar title="Analytics" />
      <div className={styles.content}>
        {/* Event selector */}
        <div className={styles.selectorBar}>
          <label htmlFor="analytics-event" className={styles.selectorLabel}>Event</label>
          <select
            id="analytics-event"
            className={styles.select}
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            disabled={loadingEvents}
          >
            {loadingEvents
              ? <option>Loading…</option>
              : events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)
            }
          </select>
        </div>

        {/* KPI strip */}
        <div className={styles.kpiGrid}>
          <KpiCard label="Total Registrations" value={loadingData ? '—' : (kpis?.totalRegistrations.toLocaleString() ?? '—')} color="f" />
          <KpiCard label="Total Revenue"        value={loadingData ? '—' : (kpis ? fmtCurrency(kpis.totalRevenue) : '—')}      color="g" />
          <KpiCard label="Checked In"           value={loadingData ? '—' : (kpis?.checkedInCount.toLocaleString() ?? '—')}     color="t" />
          <KpiCard
            label="Conversion Rate"
            value={loadingData ? '—' : (kpis ? fmtPct(kpis.conversionRate) : '—')}
            color="i"
          />
          <KpiCard label="Avg Order Value"      value={loadingData ? '—' : (kpis ? fmtCurrency(kpis.avgOrderValue) : '—')}    color="g" />
          <KpiCard label="Total Attendees"      value={loadingData ? '—' : (kpis?.totalAttendees.toLocaleString() ?? '—')}     color="f" />
        </div>

        {/* Revenue breakdown + Funnel side by side */}
        <div className={styles.twoCol}>
          <Card title="Revenue by Ticket Type" flush>
            <DataTable<RevenueRow>
              columns={REVENUE_COLS}
              rows={revenue?.byTicketType ?? []}
              loading={loadingData}
              emptyMessage="No revenue data."
            />
          </Card>
          <Card title="Checkout Funnel" flush>
            <DataTable<FunnelRow>
              columns={FUNNEL_COLS}
              rows={funnel?.byStep ?? []}
              loading={loadingData}
              emptyMessage="No funnel data."
            />
          </Card>
        </div>

        {/* Attendance trend */}
        <Card title="Attendance by Day" flush>
          <DataTable<AttendanceRow>
            columns={ATTENDANCE_COLS}
            rows={attendance?.byDay ?? []}
            loading={loadingData}
            emptyMessage="No attendance data."
          />
        </Card>
      </div>
    </div>
  )
}
