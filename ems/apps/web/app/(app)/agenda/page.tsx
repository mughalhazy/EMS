'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { agendaService } from '@/services/agenda.service'
import { Event, Session, SessionStatus, SessionType } from '@/types/domain'
import styles from './agenda.module.css'

type StatusFilter = SessionStatus | 'all'

const STATUS_COLOR: Record<SessionStatus, 'amber' | 'indigo' | 'forest' | 'brick'> = {
  draft:     'amber',
  scheduled: 'indigo',
  completed: 'forest',
  cancelled: 'brick',
}

const TYPE_LABEL: Record<SessionType, string> = {
  keynote:    'Keynote',
  talk:       'Talk',
  panel:      'Panel',
  workshop:   'Workshop',
  networking: 'Networking',
  other:      'Other',
}

const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All',       value: 'all'       },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Draft',     value: 'draft'     },
  { label: 'Cancelled', value: 'cancelled' },
]

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function duration(startAt: string, endAt: string) {
  const mins = Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000)
  return mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}` : `${mins}m`
}

export default function AgendaPage() {
  const [events, setEvents]     = useState<Event[]>([])
  const [eventId, setEventId]   = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [filter, setFilter]     = useState<StatusFilter>('all')
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(false)

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
    setLoadingSessions(true)
    agendaService.listSessions(eventId, { limit: 100 })
      .then(r => setSessions(r.data))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false))
  }, [eventId])

  const filtered = useMemo(() =>
    filter === 'all' ? sessions : sessions.filter(s => s.status === filter),
    [sessions, filter]
  )

  const columns: Column<Session>[] = [
    {
      key: 'title',
      header: 'Session',
      render: s => <span className={styles.title}>{s.title}</span>,
    },
    {
      key: 'sessionType',
      header: 'Type',
      width: '110px',
      render: s => <span className={styles.type}>{TYPE_LABEL[s.sessionType]}</span>,
    },
    {
      key: 'startAt',
      header: 'Date & Time',
      width: '160px',
      render: s => (
        <span className={styles.time}>
          {fmtDate(s.startAt)} · {fmtTime(s.startAt)}
        </span>
      ),
    },
    {
      key: 'endAt',
      header: 'Duration',
      width: '90px',
      render: s => <span className={styles.mono}>{duration(s.startAt, s.endAt)}</span>,
    },
    {
      key: 'capacity',
      header: 'Cap.',
      width: '70px',
      render: s => <span className={styles.mono}>{s.capacity ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: s => <Badge color={STATUS_COLOR[s.status]}>{s.status}</Badge>,
    },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Agenda" />

      <div className={styles.toolbar}>
        <div className={styles.selectorRow}>
          <span className={styles.selectorLabel}>Event</span>
          <select
            className={styles.select}
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            disabled={loadingEvents}
          >
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={[styles.filterBtn, filter === f.value ? styles.active : ''].join(' ')}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <Card flush>
          <DataTable<Session>
            columns={columns}
            rows={filtered}
            loading={loadingSessions}
            emptyMessage="No sessions found for this event."
          />
        </Card>
      </div>
    </div>
  )
}
