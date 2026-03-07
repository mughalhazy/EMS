'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DataTable, Column } from '@/components/ui/DataTable'
import { adminService, AdminEvent, AdminTenant } from '@/services/admin.service'
import { EventStatus } from '@/types/domain'
import styles from './events.module.css'

const STATUS_COLOR: Record<EventStatus, 'neutral' | 'indigo' | 'teal'> = {
  draft:     'neutral',
  published: 'indigo',
  live:      'teal',
  archived:  'neutral',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type StatusFilter = 'all' | EventStatus
const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Draft',     value: 'draft'     },
  { label: 'Published', value: 'published' },
  { label: 'Live',      value: 'live'      },
  { label: 'Archived',  value: 'archived'  },
]

export default function AdminEventsPage() {
  const [events, setEvents]       = useState<AdminEvent[]>([])
  const [tenants, setTenants]     = useState<AdminTenant[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<StatusFilter>('all')
  const [tenantId, setTenantId]   = useState<string>('all')
  const [search, setSearch]       = useState('')

  useEffect(() => {
    Promise.all([
      adminService.listEvents({ limit: 100 }).catch(() => ({ data: [] as AdminEvent[] })),
      adminService.listTenants({ limit: 100 }).catch(() => ({ data: [] as AdminTenant[] })),
    ]).then(([evRes, tenRes]) => {
      setEvents(evRes.data)
      setTenants(tenRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = events
    if (filter !== 'all') list = list.filter(e => e.status === filter)
    if (tenantId !== 'all') list = list.filter(e => e.tenantId === tenantId)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.tenantName.toLowerCase().includes(q)
    )
    return list
  }, [events, filter, tenantId, search])

  const live = events.filter(e => e.status === 'live').length

  const columns: Column<AdminEvent>[] = [
    {
      key: 'name',
      header: 'Event',
      render: e => (
        <div>
          <p className={styles.eventName}>{e.name}</p>
          <p className={styles.eventCode}>{e.code}</p>
        </div>
      ),
    },
    {
      key: 'tenantName',
      header: 'Tenant',
      render: e => <span className={styles.tenant}>{e.tenantName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: e => <Badge color={STATUS_COLOR[e.status]}>{e.status}</Badge>,
    },
    {
      key: 'startAt',
      header: 'Start',
      width: '130px',
      render: e => <span className={styles.date}>{fmtDate(e.startAt)}</span>,
    },
    {
      key: 'endAt',
      header: 'End',
      width: '130px',
      render: e => <span className={styles.date}>{fmtDate(e.endAt)}</span>,
    },
    {
      key: 'attendeeCount',
      header: 'Attendees',
      width: '100px',
      render: e => <span className={styles.num}>{e.attendeeCount.toLocaleString()}</span>,
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Events</h1>
          <p className={styles.subheading}>All events across tenants.</p>
        </div>
        <div className={styles.headerMeta}>
          {!loading && live > 0 && (
            <span className={styles.livePill}>
              <span className={styles.liveDot} />
              {live} live now
            </span>
          )}
          {!loading && (
            <span className={styles.count}>{events.length} event{events.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
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
        <div className={styles.right}>
          <div className={styles.selectorWrap}>
            <label htmlFor="ev-tenant" className={styles.selectorLabel}>Tenant</label>
            <select
              id="ev-tenant"
              className={styles.select}
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
            >
              <option value="all">All tenants</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.searchWrap}>
            <Input
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card flush>
        <DataTable<AdminEvent>
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyMessage="No events found."
        />
      </Card>
    </div>
  )
}
