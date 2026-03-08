'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/events-detail.wireframe.json'
import { eventsService } from '@/services/events.service'
import { agendaService } from '@/services/agenda.service'
import { speakersService } from '@/services/speakers.service'
import { Event, Session, Speaker } from '@/types/domain'
import styles from './event.module.css'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent]       = useState<Event | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      eventsService.get(params.id).catch(() => null),
      agendaService.list(params.id, { limit: 100 }).then(r => r.data).catch(() => [] as Session[]),
      speakersService.list(params.id, { limit: 100 }).then(r => r.data).catch(() => [] as Speaker[]),
    ]).then(([e, sess, spkr]) => {
      setEvent(e)
      setSessions(sess)
      setSpeakers(spkr)
    }).finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ event, sessions, speakers, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
}
