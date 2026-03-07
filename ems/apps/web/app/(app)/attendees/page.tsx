'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { attendeesService } from '@/services/attendees.service'
import { Event, Attendee, AttendeeStatus } from '@/types/domain'
import styles from './attendees.module.css'

type StatusFilter = AttendeeStatus | 'all'

const STATUS_COLOR: Record<AttendeeStatus, 'indigo' | 'forest' | 'teal' | 'brick'> = {
  prospect:   'indigo',
  registered: 'forest',
  checked_in: 'teal',
  cancelled:  'brick',
}

const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All',        value: 'all'        },
  { label: 'Registered', value: 'registered' },
  { label: 'Checked In', value: 'checked_in' },
  { label: 'Prospect',   value: 'prospect'   },
  { label: 'Cancelled',  value: 'cancelled'  },
]

const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(name: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export default function AttendeesPage() {
  const [events, setEvents]       = useState<Event[]>([])
  const [eventId, setEventId]     = useState('')
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [filter, setFilter]       = useState<StatusFilter>('all')
  const [loadingEvents, setLoadingEvents]       = useState(true)
  const [loadingAttendees, setLoadingAttendees] = useState(false)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data.length > 0) setEventId(r.data[0].id) })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoadingAttendees(true)
    attendeesService.list(eventId, { limit: 100 })
      .then(r => setAttendees(r.data))
      .catch(() => setAttendees([]))
      .finally(() => setLoadingAttendees(false))
  }, [eventId])

  const filtered = useMemo(() =>
    filter === 'all' ? attendees : attendees.filter(a => a.status === filter),
    [attendees, filter])

  const columns: Column<Attendee>[] = [
    {
      key: 'firstName',
      header: 'Attendee',
      render: a => (
        <div className={styles.attendeeCell}>
          <Avatar initials={initials(a.firstName, a.lastName)} color={avatarColor(a.firstName)} size="sm" />
          <div>
            <p className={styles.name}>{a.firstName} {a.lastName}</p>
            <p className={styles.email}>{a.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'badgeName',  header: 'Badge',      width: '160px', render: a => <span className={styles.badge}>{a.badgeName ?? '—'}</span> },
    { key: 'status',     header: 'Status',     width: '130px', render: a => <Badge color={STATUS_COLOR[a.status]}>{a.status.replace('_', ' ')}</Badge> },
    { key: 'createdAt',  header: 'Registered', width: '150px', render: a => <span className={styles.mono}>{new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Attendees" />
      <div className={styles.toolbar}>
        <div className={styles.selectorRow}>
          <span className={styles.selectorLabel}>Event</span>
          <select className={styles.select} value={eventId} onChange={e => setEventId(e.target.value)} disabled={loadingEvents}>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
          {!loadingAttendees && <span className={styles.count}>{attendees.length} attendee{attendees.length !== 1 ? 's' : ''}</span>}
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
          <DataTable<Attendee> columns={columns} rows={filtered} loading={loadingAttendees} emptyMessage="No attendees found for this event." />
        </Card>
      </div>
    </div>
  )
}
