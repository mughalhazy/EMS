'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { eventsService } from '@/services/events.service'
import { Event, EventStatus } from '@/types/domain'
import styles from './events.module.css'

type StatusFilter = EventStatus | 'all'

const STATUS_COLOR: Record<EventStatus, 'neutral' | 'indigo' | 'teal' | 'forest'> = {
  draft:     'neutral',
  published: 'indigo',
  live:      'teal',
  archived:  'neutral',
}

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All',       value: 'all'       },
  { label: 'Published', value: 'published' },
  { label: 'Live Now',  value: 'live'      },
  { label: 'Upcoming',  value: 'draft'     },
]

function fmtDateRange(startAt: string, endAt: string) {
  const s = new Date(startAt)
  const e = new Date(endAt)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.getDate()}, ${e.getFullYear()}`
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/attendee/event/${event.id}`} className={styles.card}>
      <div className={styles.cardTop}>
        <Badge color={STATUS_COLOR[event.status]}>{event.status}</Badge>
        <span className={styles.cardCode}>{event.code}</span>
      </div>
      <h2 className={styles.cardTitle}>{event.name}</h2>
      <p className={styles.cardDesc}>{event.description}</p>
      <div className={styles.cardMeta}>
        <span className={styles.cardMetaItem}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M4 1v2M10 1v2M1 6h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {fmtDateRange(event.startAt, event.endAt)}
        </span>
        <span className={styles.cardMetaItem}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M7 1C4.24 1 2 3.24 2 6c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          {event.timezone}
        </span>
      </div>
      <span className={styles.cardCta}>View Details →</span>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonBadge} />
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} style={{ width: '70%' }} />
    </div>
  )
}

export default function AttendeeEventsPage() {
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState<StatusFilter>('all')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    setLoading(true)
    eventsService
      .list({ limit: 50, ...(status !== 'all' ? { status } : {}) })
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [status])

  const filtered = search.trim()
    ? events.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.code.toLowerCase().includes(search.toLowerCase())
      )
    : events

  return (
    <div>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Events</h1>
          <p className={styles.subheading}>Browse and register for upcoming events.</p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={[styles.filterBtn, status === f.value ? styles.filterActive : ''].join(' ')}
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
          ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No events found</p>
              <p className={styles.emptyDesc}>Try adjusting your search or filter.</p>
            </div>
          )
          : filtered.map(ev => <EventCard key={ev.id} event={ev} />)
        }
      </div>
    </div>
  )
}
