'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/attendees.wireframe.json'
import { eventsService } from '@/services/events.service'
import { attendeesService } from '@/services/attendees.service'
import { Event, Attendee } from '@/types/domain'
import styles from './attendees.module.css'

export default function AttendeesPage() {
  const [events, setEvents]     = useState<Event[]>([])
  const [eventId, setEventId]   = useState<string>('')
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data[0]) setEventId(r.data[0].id) })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    attendeesService.list(eventId, { limit: 100 })
      .then(r => setAttendees(r.data))
      .catch(() => setAttendees([]))
      .finally(() => setLoading(false))
  }, [eventId])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ events, eventId, attendees, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
        onSelectChange={(blockId, value) => { if (blockId === 'event-selector') setEventId(value) }}
      />
    </div>
  )
}
