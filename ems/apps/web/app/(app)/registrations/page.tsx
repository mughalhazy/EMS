'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { registrationsService } from '@/services/registrations.service'
import { Event, Registration, RegistrationStatus } from '@/types/domain'
import styles from './registrations.module.css'

type StatusFilter = RegistrationStatus | 'all'

const STATUS_COLOR: Record<RegistrationStatus, 'amber' | 'indigo' | 'forest' | 'brick'> = {
  pending:   'amber',
  approved:  'indigo',
  confirmed: 'forest',
  cancelled: 'brick',
}

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All',       value: 'all'       },
  { label: 'Pending',   value: 'pending'   },
  { label: 'Approved',  value: 'approved'  },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function RegistrationsPage() {
  const [events, setEvents]           = useState<Event[]>([])
  const [eventId, setEventId]         = useState<string>('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all')
  const [loadingEvents, setLoadingEvents]   = useState(true)
  const [loadingRegs, setLoadingRegs]       = useState(false)
  const [actioning, setActioning]           = useState<string | null>(null)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => {
        setEvents(r.data)
        if (r.data.length > 0) setEventId(r.data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  const loadRegistrations = useCallback(() => {
    if (!eventId) return
    setLoadingRegs(true)
    registrationsService
      .list(eventId, { limit: 100, ...(statusFilter !== 'all' ? { status: statusFilter as RegistrationStatus } : {}) })
      .then(r => setRegistrations(r.data))
      .catch(() => setRegistrations([]))
      .finally(() => setLoadingRegs(false))
  }, [eventId, statusFilter])

  useEffect(() => { loadRegistrations() }, [loadRegistrations])

  async function handleAction(action: 'approve' | 'confirm' | 'cancel', regId: string) {
    setActioning(regId)
    try {
      if (action === 'approve')  await registrationsService.approve(regId)
      if (action === 'confirm')  await registrationsService.confirm(regId)
      if (action === 'cancel')   await registrationsService.cancel(regId)
      loadRegistrations()
    } catch { /* surface error toast in future iteration */ }
    finally { setActioning(null) }
  }

  const columns: Column<Registration>[] = [
    { key: 'id',           header: 'ID',        width: '96px',  render: r => <span className={styles.mono}>{r.id.slice(0, 8)}…</span> },
    { key: 'attendeeId',   header: 'Attendee',  width: '120px', render: r => <span className={styles.mono}>{r.attendeeId.slice(0, 8)}…</span> },
    { key: 'ticketId',     header: 'Ticket',    width: '120px', render: r => <span className={styles.mono}>{r.ticketId.slice(0, 8)}…</span> },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: r => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge>,
    },
    {
      key: 'registeredAt',
      header: 'Registered',
      width: '130px',
      render: r => fmtDate(r.registeredAt),
    },
    {
      key: 'checkinAt',
      header: 'Checked In',
      width: '130px',
      render: r => r.checkinAt ? fmtDate(r.checkinAt) : <span className={styles.na}>—</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: r => {
        const busy = actioning === r.id
        return (
          <div className={styles.rowActions}>
            {r.status === 'pending' && (
              <Button size="sm" variant="indigo" disabled={busy} onClick={() => handleAction('approve', r.id)}>
                Approve
              </Button>
            )}
            {r.status === 'approved' && (
              <Button size="sm" variant="forest" disabled={busy} onClick={() => handleAction('confirm', r.id)}>
                Confirm
              </Button>
            )}
            {r.status !== 'cancelled' && r.status !== 'confirmed' && (
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => handleAction('cancel', r.id)}>
                Cancel
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Registrations" />
      <div className={styles.content}>
        <Card flush>
          <div className={styles.toolbar}>
            <div className={styles.selectorRow}>
              <label htmlFor="reg-event-select" className={styles.selectorLabel}>Event</label>
              <select
                id="reg-event-select"
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
            <div className={styles.filters}>
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  className={[styles.filterBtn, statusFilter === f.value ? styles.active : ''].join(' ')}
                  onClick={() => setStatusFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <DataTable<Registration>
            columns={columns}
            rows={registrations}
            loading={loadingRegs}
            emptyMessage="No registrations found."
          />
        </Card>
      </div>
    </div>
  )
}
