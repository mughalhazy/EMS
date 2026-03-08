'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/speakers.wireframe.json'
import { eventsService } from '@/services/events.service'
import { speakersService } from '@/services/speakers.service'
import { Event, Speaker } from '@/types/domain'
import styles from './speakers.module.css'

export default function SpeakersPage() {
  const [events, setEvents]     = useState<Event[]>([])
  const [eventId, setEventId]   = useState<string>('')
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data[0]) setEventId(r.data[0].id) })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    speakersService.list(eventId, { limit: 100 })
      .then(r => setSpeakers(r.data))
      .catch(() => setSpeakers([]))
      .finally(() => setLoading(false))
  }, [eventId])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ events, eventId, speakers, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
        onSelectChange={(blockId, value) => { if (blockId === 'event-selector') setEventId(value) }}
      />
    </div>
  )
}
