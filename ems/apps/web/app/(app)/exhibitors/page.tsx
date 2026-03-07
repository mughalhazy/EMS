'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { exhibitorsService } from '@/services/exhibitors.service'
import { Event, Exhibitor, ExhibitorStatus } from '@/types/domain'
import styles from './exhibitors.module.css'

type StatusFilter = ExhibitorStatus | 'all'

const STATUS_COLOR: Record<ExhibitorStatus, 'amber' | 'forest' | 'teal' | 'brick'> = {
  invited: 'amber', confirmed: 'forest', checked_in: 'teal', cancelled: 'brick',
}
const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' }, { label: 'Confirmed', value: 'confirmed' },
  { label: 'Checked In', value: 'checked_in' }, { label: 'Invited', value: 'invited' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function ExhibitorsPage() {
  const [events, setEvents]         = useState<Event[]>([])
  const [eventId, setEventId]       = useState('')
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [filter, setFilter]         = useState<StatusFilter>('all')
  const [loadingEvents, setLoadingEvents]         = useState(true)
  const [loadingExhibitors, setLoadingExhibitors] = useState(false)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data.length > 0) setEventId(r.data[0].id) })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoadingExhibitors(true)
    exhibitorsService.list(eventId, { limit: 100 })
      .then(r => setExhibitors(r.data))
      .catch(() => setExhibitors([]))
      .finally(() => setLoadingExhibitors(false))
  }, [eventId])

  const filtered = useMemo(() =>
    filter === 'all' ? exhibitors : exhibitors.filter(e => e.status === filter),
    [exhibitors, filter])

  const columns: Column<Exhibitor>[] = [
    { key: 'organizationId', header: 'Organization', render: e => <span className={styles.orgId}>{e.organizationId}</span> },
    { key: 'boothCode',      header: 'Booth', width: '100px', render: e => <span className={styles.mono}>{e.boothCode}</span> },
    { key: 'boothSize',      header: 'Size',  width: '100px', render: e => <span className={styles.size}>{e.boothSize}</span> },
    { key: 'status',         header: 'Status', width: '130px', render: e => <Badge color={STATUS_COLOR[e.status]}>{e.status.replace('_', ' ')}</Badge> },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Exhibitors" />
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
          <DataTable<Exhibitor> columns={columns} rows={filtered} loading={loadingExhibitors} emptyMessage="No exhibitors found for this event." />
        </Card>
      </div>
    </div>
  )
}
