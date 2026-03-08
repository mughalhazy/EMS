'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/ticketing.wireframe.json'
import { eventsService } from '@/services/events.service'
import { ticketingService } from '@/services/ticketing.service'
import { Event, Ticket } from '@/types/domain'
import styles from './ticketing.module.css'

export default function TicketingPage() {
  const [events, setEvents]   = useState<Event[]>([])
  const [eventId, setEventId] = useState<string>('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data[0]) setEventId(r.data[0].id) })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    ticketingService.list(eventId, { limit: 100 })
      .then(r => setTickets(r.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [eventId])

  const totalSold     = tickets.reduce((s, t) => s + (t.quantitySold ?? 0), 0)
  const totalRevenue  = tickets.reduce((s, t) => s + (t.quantitySold ?? 0) * (t.priceAmount ?? 0), 0)
  const totalAvail    = tickets.reduce((s, t) => s + ((t.quantityTotal ?? 0) - (t.quantitySold ?? 0)), 0)
  const totalCapacity = tickets.reduce((s, t) => s + (t.quantityTotal ?? 0), 0)
  const utilization   = totalCapacity > 0 ? `${Math.round((totalSold / totalCapacity) * 100)}%` : '—'

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{
          events, eventId, tickets, loading,
          totalSold, revenue: `$${totalRevenue.toLocaleString()}`,
          available: totalAvail, utilization,
        }}
        showDebug={process.env.NODE_ENV === 'development'}
        onSelectChange={(blockId, value) => { if (blockId === 'event-selector') setEventId(value) }}
      />
    </div>
  )
}
