'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/analytics.wireframe.json'
import { eventsService } from '@/services/events.service'
import { analyticsService } from '@/services/analytics.service'
import { Event } from '@/types/domain'
import styles from './analytics.module.css'

export default function AnalyticsPage() {
  const [events, setEvents]   = useState<Event[]>([])
  const [eventId, setEventId] = useState<string>('')
  const [kpis, setKpis]       = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data[0]) setEventId(r.data[0].id) })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    analyticsService.eventKpis(eventId)
      .then(r => setKpis(r as Record<string, unknown>))
      .catch(() => setKpis({}))
      .finally(() => setLoading(false))
  }, [eventId])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{
          events, eventId, loading,
          registrations:  kpis.registrations   ?? '—',
          checkins:        kpis.checkins         ?? '—',
          revenue:         kpis.revenue          ?? '—',
          conversionRate:  kpis.conversionRate   ?? '—',
          abandonmentRate: kpis.abandonmentRate  ?? '—',
          avgOrderValue:   kpis.avgOrderValue    ?? '—',
          revenueByTicket: kpis.revenueByTicket  ?? [],
          checkoutFunnel:  kpis.checkoutFunnel   ?? [],
          attendanceByDay: kpis.attendanceByDay  ?? [],
        }}
        showDebug={process.env.NODE_ENV === 'development'}
        onSelectChange={(blockId, value) => { if (blockId === 'event-selector') setEventId(value) }}
      />
    </div>
  )
}
