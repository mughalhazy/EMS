'use client'

import { useEffect, useMemo, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/agenda.wireframe.json'
import { eventsService } from '@/services/events.service'
import { agendaService } from '@/services/agenda.service'
import { Event, Session } from '@/types/domain'
import styles from './agenda.module.css'

function isoDay(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}

export default function AgendaPage() {
  const [events, setEvents]     = useState<Event[]>([])
  const [eventId, setEventId]   = useState<string>('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeDay, setActiveDay] = useState<string>('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => { setEvents(r.data); if (r.data[0]) setEventId(r.data[0].id) })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoading(true)
    agendaService.list(eventId, { limit: 200 })
      .then(r => {
        setSessions(r.data)
        const days = [...new Set(r.data.map(s => isoDay(s.startAt)))].sort()
        setActiveDay(days[0] ?? '')
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [eventId])

  const days = useMemo(() =>
    [...new Set(sessions.map(s => isoDay(s.startAt)))].sort(),
    [sessions]
  )

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ events, eventId, sessions, activeDay, days, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
        onSelectChange={(blockId, value) => { if (blockId === 'event-selector') setEventId(value) }}
        onTabChange={(blockId, value) => { if (blockId === 'day-tabs') setActiveDay(value) }}
      />
    </div>
  )
}
