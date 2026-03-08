'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/dashboard.wireframe.json'
import { analyticsService } from '@/services/analytics.service'
import { eventsService } from '@/services/events.service'
import { Event } from '@/types/domain'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const [kpis, setKpis]       = useState<Record<string, unknown>>({})
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsService.tenantKpis().catch(() => ({})),
      eventsService.list({ limit: 10 }).then(r => r.data).catch(() => [] as Event[]),
    ]).then(([k, e]) => {
      setKpis(k as Record<string, unknown>)
      setEvents(e)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ kpis, events, loading, ...kpis }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
}
