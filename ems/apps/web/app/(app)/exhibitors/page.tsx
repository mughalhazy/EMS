'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/exhibitors.wireframe.json'
import { eventsService } from '@/services/events.service'
import { exhibitorsService } from '@/services/exhibitors.service'
import { Event, Exhibitor } from '@/types/domain'
import styles from './exhibitors.module.css'

export default function ExhibitorsPage() {
  const [events, setEvents]       = useState<Event[]>([])
  const [eventId, setEventId]     = useState<string>('')
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data[0]) setEventId(r.data[0].id) })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    exhibitorsService.list(eventId, { limit: 100 })
      .then(r => setExhibitors(r.data))
      .catch(() => setExhibitors([]))
      .finally(() => setLoading(false))
  }, [eventId])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ events, eventId, exhibitors, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
}
