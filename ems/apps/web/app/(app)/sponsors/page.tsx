'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { sponsorsService } from '@/services/sponsors.service'
import { Event, Sponsor, SponsorStatus, SponsorTier } from '@/types/domain'
import styles from './sponsors.module.css'

type StatusFilter = SponsorStatus | 'all'

const STATUS_COLOR: Record<SponsorStatus, 'indigo' | 'forest' | 'teal' | 'brick'> = {
  prospect: 'indigo', active: 'forest', fulfilled: 'teal', cancelled: 'brick',
}
const TIER_COLOR: Record<SponsorTier, 'gold' | 'neutral' | 'amber'> = {
  gold: 'gold', silver: 'neutral', bronze: 'amber',
}
const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' }, { label: 'Active', value: 'active' },
  { label: 'Fulfilled', value: 'fulfilled' }, { label: 'Prospect', value: 'prospect' },
  { label: 'Cancelled', value: 'cancelled' },
]

function fmtAmount(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function SponsorsPage() {
  const [events, setEvents]     = useState<Event[]>([])
  const [eventId, setEventId]   = useState('')
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [filter, setFilter]     = useState<StatusFilter>('all')
  const [loadingEvents, setLoadingEvents]     = useState(true)
  const [loadingSponsors, setLoadingSponsors] = useState(false)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data.length > 0) setEventId(r.data[0].id) })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoadingSponsors(true)
    sponsorsService.list(eventId, { limit: 100 })
      .then(r => setSponsors(r.data))
      .catch(() => setSponsors([]))
      .finally(() => setLoadingSponsors(false))
  }, [eventId])

  const filtered = useMemo(() =>
    filter === 'all' ? sponsors : sponsors.filter(s => s.status === filter),
    [sponsors, filter])

  const columns: Column<Sponsor>[] = [
    { key: 'organizationId', header: 'Organization', render: s => <span className={styles.orgId}>{s.organizationId}</span> },
    { key: 'tier',           header: 'Tier',   width: '100px', render: s => <Badge color={TIER_COLOR[s.tier]}>{s.tier}</Badge> },
    { key: 'amount',         header: 'Amount', width: '130px', render: s => <span className={styles.amount}>{fmtAmount(s.amount)}</span> },
    { key: 'status',         header: 'Status', width: '120px', render: s => <Badge color={STATUS_COLOR[s.status]}>{s.status}</Badge> },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Sponsors" />
      <div className={styles.toolbar}>
        <div className={styles.selectorRow}>
          <span className={styles.selectorLabel}>Event</span>
          <select className={styles.select} value={eventId} onChange={e => setEventId(e.target.value)} disabled={loadingEvents}>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button key={f.value} className={[styles.filterBtn, filter === f.value ? styles.active : ''].join(' ')} onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <Card flush>
          <DataTable<Sponsor> columns={columns} rows={filtered} loading={loadingSponsors} emptyMessage="No sponsors found for this event." />
        </Card>
      </div>
    </div>
  )
}
