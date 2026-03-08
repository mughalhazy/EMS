'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/registrations.wireframe.json'
import { eventsService } from '@/services/events.service'
import { registrationsService } from '@/services/registrations.service'
import { Event, Registration } from '@/types/domain'
import styles from './registrations.module.css'

export default function RegistrationsPage() {
  const [events, setEvents]             = useState<Event[]>([])
  const [eventId, setEventId]           = useState<string>('')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data[0]) setEventId(r.data[0].id) })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    registrationsService.list(eventId, { limit: 100 })
      .then(r => setRegistrations(r.data))
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false))
  }, [eventId])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ events, eventId, registrations, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
}
