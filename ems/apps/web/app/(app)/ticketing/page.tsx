'use client'

import React, { useEffect, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { ticketingService } from '@/services/ticketing.service'
import { Event, Ticket, TicketStatus } from '@/types/domain'
import styles from './ticketing.module.css'

const STATUS_COLOR: Record<TicketStatus, 'neutral' | 'forest' | 'amber'> = {
  draft:    'neutral',
  on_sale:  'forest',
  sold_out: 'amber',
  closed:   'neutral',
}

const COLUMNS: Column<Ticket>[] = [
  { key: 'name',        header: 'Ticket Type', render: r => <span className={styles.ticketName}>{r.name}</span> },
  {
    key: 'priceAmount',
    header: 'Price',
    width: '96px',
    render: r => fmtCurrency(r.priceAmount, r.priceCurrency),
  },
  { key: 'quantityTotal', header: 'Total',     width: '80px',  render: r => r.quantityTotal.toLocaleString() },
  { key: 'quantitySold',  header: 'Sold',      width: '80px',  render: r => r.quantitySold.toLocaleString()  },
  {
    key: 'available',
    header: 'Available',
    width: '96px',
    render: r => {
      const avail = r.quantityTotal - r.quantitySold
      return <span className={avail === 0 ? styles.zero : ''}>{avail.toLocaleString()}</span>
    },
  },
  {
    key: 'status',
    header: 'Status',
    width: '110px',
    render: r => <Badge color={STATUS_COLOR[r.status]}>{r.status.replace('_', ' ')}</Badge>,
  },
  {
    key: 'salesStartAt',
    header: 'Sales Open',
    width: '128px',
    render: r => r.salesStartAt ? fmtDate(r.salesStartAt) : '—',
  },
  {
    key: 'salesEndAt',
    header: 'Sales Close',
    width: '128px',
    render: r => r.salesEndAt ? fmtDate(r.salesEndAt) : '—',
  },
]

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TicketingPage() {
  const [events, setEvents]         = useState<Event[]>([])
  const [eventId, setEventId]       = useState<string>('')
  const [tickets, setTickets]       = useState<Ticket[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingTickets, setLoadingTickets] = useState(false)

  // load events for selector
  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => {
        setEvents(r.data)
        if (r.data.length > 0) setEventId(r.data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  // load tickets when event changes
  useEffect(() => {
    if (!eventId) return
    setLoadingTickets(true)
    ticketingService.list(eventId, { limit: 100 })
      .then(r => setTickets(r.data))
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false))
  }, [eventId])

  const selectedEvent = events.find(e => e.id === eventId)

  return (
    <div className={styles.page}>
      <TopBar
        title="Ticketing"
        actions={<Button variant="forest" size="sm">+ Add Ticket Type</Button>}
      />
      <div className={styles.content}>
        <Card flush>
          <div className={styles.toolbar}>
            <label htmlFor="event-select" className={styles.selectorLabel}>Event</label>
            <select
              id="event-select"
              className={styles.select}
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              disabled={loadingEvents}
            >
              {loadingEvents
                ? <option>Loading events…</option>
                : events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))
              }
            </select>
            {selectedEvent && (
              <Badge color={selectedEvent.status === 'live' ? 'teal' : selectedEvent.status === 'published' ? 'indigo' : 'neutral'}>
                {selectedEvent.status}
              </Badge>
            )}
          </div>
          {eventId
            ? (
              <DataTable<Ticket>
                columns={COLUMNS}
                rows={tickets}
                loading={loadingTickets}
                emptyMessage="No ticket types configured for this event."
              />
            )
            : (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>Select an event to view tickets</p>
                <p className={styles.emptyDesc}>Choose an event from the dropdown above.</p>
              </div>
            )
          }
        </Card>
      </div>
    </div>
  )
}
