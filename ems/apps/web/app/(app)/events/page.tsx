'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { Event, EventStatus } from '@/types/domain'
import styles from './events.module.css'

type StatusFilter = EventStatus | 'all'

const STATUS_COLOR: Record<EventStatus, 'neutral' | 'indigo' | 'teal'> = {
  draft:     'neutral',
  published: 'indigo',
  live:      'teal',
  archived:  'neutral',
}

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All',       value: 'all'      },
  { label: 'Draft',     value: 'draft'    },
  { label: 'Published', value: 'published'},
  { label: 'Live',      value: 'live'     },
  { label: 'Archived',  value: 'archived' },
]

const COLUMNS: Column<Event>[] = [
  {
    key: 'name',
    header: 'Name',
    render: r => <span className={styles.name}>{r.name}</span>,
  },
  { key: 'code',     header: 'Code',     width: '96px'  },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: r => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>,
  },
  { key: 'timezone', header: 'Timezone', width: '148px' },
  {
    key: 'startAt',
    header: 'Starts',
    width: '140px',
    render: r => fmtDate(r.startAt),
  },
  {
    key: 'endAt',
    header: 'Ends',
    width: '140px',
    render: r => fmtDate(r.endAt),
  },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents]       = useState<Event[]>([])
  const [loading, setLoading]     = useState(true)
  const [status, setStatus]       = useState<StatusFilter>('all')

  useEffect(() => {
    setLoading(true)
    eventsService
      .list({ limit: 25, ...(status !== 'all' ? { status } : {}) })
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className={styles.page}>
      <TopBar
        title="Events"
        actions={<Button variant="forest" size="sm">+ New Event</Button>}
      />
      <div className={styles.content}>
        <Card flush>
          <div className={styles.toolbar}>
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
          </div>
          <DataTable<Event>
            columns={COLUMNS}
            rows={events}
            loading={loading}
            emptyMessage="No events found."
            onRowClick={row => router.push(`/events/${row.id}`)}
          />
        </Card>
      </div>
    </div>
  )
}
