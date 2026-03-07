'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { speakersService } from '@/services/speakers.service'
import { Event, Speaker, SpeakerStatus } from '@/types/domain'
import styles from './speakers.module.css'

type StatusFilter = SpeakerStatus | 'all'

const STATUS_COLOR: Record<SpeakerStatus, 'forest' | 'amber' | 'brick' | 'neutral'> = {
  confirmed: 'forest',
  invited:   'amber',
  declined:  'brick',
  withdrawn: 'neutral',
}

const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All',       value: 'all'       },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Invited',   value: 'invited'   },
  { label: 'Declined',  value: 'declined'  },
  { label: 'Withdrawn', value: 'withdrawn' },
]

const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(name: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export default function SpeakersPage() {
  const [events, setEvents]     = useState<Event[]>([])
  const [eventId, setEventId]   = useState('')
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [filter, setFilter]     = useState<StatusFilter>('all')
  const [loadingEvents, setLoadingEvents]     = useState(true)
  const [loadingSpeakers, setLoadingSpeakers] = useState(false)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data.length > 0) setEventId(r.data[0].id) })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoadingSpeakers(true)
    speakersService.list(eventId, { limit: 100 })
      .then(r => setSpeakers(r.data))
      .catch(() => setSpeakers([]))
      .finally(() => setLoadingSpeakers(false))
  }, [eventId])

  const filtered = useMemo(() =>
    filter === 'all' ? speakers : speakers.filter(s => s.status === filter),
    [speakers, filter])

  const columns: Column<Speaker>[] = [
    {
      key: 'firstName',
      header: 'Speaker',
      render: s => (
        <div className={styles.speakerCell}>
          <Avatar initials={initials(s.firstName, s.lastName)} color={avatarColor(s.firstName)} size="sm" />
          <div>
            <p className={styles.name}>{s.firstName} {s.lastName}</p>
            {s.email && <p className={styles.email}>{s.email}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'bio',
      header: 'Bio',
      render: s => <span className={styles.bio}>{s.bio ? s.bio.slice(0, 90) + (s.bio.length > 90 ? '…' : '') : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: s => <Badge color={STATUS_COLOR[s.status]}>{s.status}</Badge>,
    },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Speakers" />
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
          <DataTable<Speaker> columns={columns} rows={filtered} loading={loadingSpeakers} emptyMessage="No speakers found for this event." />
        </Card>
      </div>
    </div>
  )
}
