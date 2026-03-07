'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/nav/TopBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { Event, EventStatus } from '@/types/domain'
import styles from './events.module.css'

type StatusFilter = EventStatus | 'all'
type ViewMode = 'grid' | 'list'

const STATUS_COLOR: Record<EventStatus, 'neutral' | 'indigo' | 'teal' | 'amber'> = {
  draft:     'neutral',
  published: 'indigo',
  live:      'teal',
  archived:  'amber',
}

const STATUS_CHIP_CLS: Record<EventStatus, string> = {
  draft:     styles.chipNeutral,
  published: styles.chipForest,
  live:      styles.chipTeal,
  archived:  styles.chipAmber,
}

const STATUS_CHIP_LABEL: Record<EventStatus, string> = {
  draft: 'Draft', published: 'Published', live: 'Live', archived: 'Archived',
}

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All',       value: 'all'       },
  { label: 'Draft',     value: 'draft'     },
  { label: 'Published', value: 'published' },
  { label: 'Live',      value: 'live'      },
  { label: 'Archived',  value: 'archived'  },
]

function fmtDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  if (s.toDateString() === e.toDateString()) return s.toLocaleDateString('en-US', opts)
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', opts)}`
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`
}

const LIST_COLUMNS: Column<Event>[] = [
  {
    key: 'name',
    header: 'Name',
    render: r => <span className={styles.cellName}>{r.name}</span>,
  },
  { key: 'code', header: 'Code', width: '96px' },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: r => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>,
  },
  { key: 'timezone', header: 'Timezone', width: '148px' },
  {
    key: 'startAt',
    header: 'Dates',
    width: '220px',
    render: r => fmtDateRange(r.startAt, r.endAt),
  },
]

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState<StatusFilter>('all')
  const [search, setSearch]   = useState('')
  const [view, setView]       = useState<ViewMode>('grid')

  useEffect(() => {
    setLoading(true)
    eventsService.list({ limit: 100 })
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    events
      .filter(e => status === 'all' || e.status === status)
      .filter(e =>
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.code.toLowerCase().includes(search.toLowerCase())
      ),
    [events, status, search]
  )

  return (
    <div className={styles.page}>
      <TopBar
        title="Events"
        actions={
          <div className={styles.topbarRight}>
            <div className={styles.viewToggle}>
              <button
                className={[styles.viewBtn, view === 'grid' ? styles.viewBtnActive : ''].join(' ')}
                onClick={() => setView('grid')}
              >
                ▦ Grid
              </button>
              <button
                className={[styles.viewBtn, view === 'list' ? styles.viewBtnActive : ''].join(' ')}
                onClick={() => setView('list')}
              >
                ≡ List
              </button>
            </div>
            <Button variant="forest" size="sm">+ New Event</Button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.filters}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={[styles.filterBtn, status === f.value ? styles.active : ''].join(' ')}
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className={styles.count}>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.content}>
        {view === 'grid' ? (
          loading ? (
            <div className={styles.loadingState}>Loading events…</div>
          ) : (
            <div className={styles.eventGrid}>
              {filtered.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onManage={() => router.push(`/events/${ev.id}`)}
                />
              ))}
              <div className={styles.ctaCard} role="button" tabIndex={0}>
                <div className={styles.ctaInner}>
                  <div className={styles.ctaPlus}>+</div>
                  <div className={styles.ctaLabel}>Create new event</div>
                  <div className={styles.ctaSub}>Conference, expo, workshop…</div>
                </div>
              </div>
            </div>
          )
        ) : (
          <Card flush>
            <DataTable<Event>
              columns={LIST_COLUMNS}
              rows={filtered}
              loading={loading}
              emptyMessage="No events found."
              onRowClick={row => router.push(`/events/${row.id}`)}
            />
          </Card>
        )}
      </div>
    </div>
  )
}

function EventCard({ event: ev, onManage }: { event: Event; onManage: () => void }) {
  const isDraft = ev.status === 'draft'

  return (
    <div
      className={[styles.eventCard, isDraft ? styles.eventCardDraft : ''].join(' ')}
      onClick={onManage}
      role="button"
      tabIndex={0}
    >
      <div className={styles.eventCardTop}>
        <div className={styles.eventInfo}>
          <div className={[styles.eventName, isDraft ? styles.eventNameDraft : ''].join(' ')}>
            {ev.name}
          </div>
          <div className={styles.eventMeta}>
            <div className={styles.eventMetaRow}>
              <span>📅</span>
              <span>{fmtDateRange(ev.startAt, ev.endAt)}</span>
            </div>
            <div className={styles.eventMetaRow}>
              <span>🌐</span>
              <span>{ev.timezone}</span>
            </div>
          </div>
        </div>
        <span className={[styles.statusChip, STATUS_CHIP_CLS[ev.status]].join(' ')}>
          {STATUS_CHIP_LABEL[ev.status]}
        </span>
      </div>

      <div className={styles.eventStats}>
        <div className={styles.eventStat}>
          <div className={styles.statVal} style={isDraft ? { color: 'var(--ink-3)' } : undefined}>
            {isDraft ? '—' : ev.code}
          </div>
          <div className={styles.statLbl}>Code</div>
        </div>
        <div className={styles.eventStat}>
          <div className={styles.statVal} style={isDraft ? { color: 'var(--ink-3)' } : undefined}>
            —
          </div>
          <div className={styles.statLbl}>Registered</div>
        </div>
        <div className={styles.eventStat}>
          <div className={styles.statVal} style={isDraft ? { color: 'var(--ink-3)' } : undefined}>
            —
          </div>
          <div className={styles.statLbl}>Sessions</div>
        </div>
      </div>

      <div className={styles.eventActions} onClick={e => e.stopPropagation()}>
        <button className={styles.cardBtnGhost} onClick={onManage}>Manage</button>
        {!isDraft && (
          <>
            <button className={styles.cardBtnSoft}>Agenda</button>
            <button className={styles.cardBtnSoft}>Attendees</button>
          </>
        )}
        {isDraft && (
          <button className={styles.cardBtnIndigo}>Continue setup</button>
        )}
      </div>
    </div>
  )
}
