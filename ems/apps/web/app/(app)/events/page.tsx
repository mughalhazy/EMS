'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/events.wireframe.json'
import { eventsService } from '@/services/events.service'
import { Event } from '@/types/domain'
import styles from './events.module.css'

export default function EventsPage() {
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ events, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
}
