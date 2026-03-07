'use client'

import React, { useEffect, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { DataTable, Column } from '@/components/ui/DataTable'
import { eventsService } from '@/services/events.service'
import { agendaService } from '@/services/agenda.service'
import { speakersService } from '@/services/speakers.service'
import type {
  Event, Session, Speaker,
  EventStatus, SessionStatus, SessionType, SpeakerStatus,
} from '@/types/domain'
import styles from './event.module.css'

const EVENT_STATUS_COLOR: Record<EventStatus, 'neutral' | 'indigo' | 'teal'> = {
  draft: 'neutral', published: 'indigo', live: 'teal', archived: 'neutral',
}

const SESSION_STATUS_COLOR: Record<SessionStatus, 'amber' | 'indigo' | 'forest' | 'brick'> = {
  draft: 'amber', scheduled: 'indigo', completed: 'forest', cancelled: 'brick',
}

const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  keynote: 'Keynote', talk: 'Talk', panel: 'Panel',
  workshop: 'Workshop', networking: 'Networking', other: 'Other',
}

const SPEAKER_STATUS_COLOR: Record<SpeakerStatus, 'forest' | 'amber' | 'brick' | 'neutral'> = {
  confirmed: 'forest', invited: 'amber', declined: 'brick', withdrawn: 'neutral',
}

const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(name: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function duration(startAt: string, endAt: string) {
  const mins = Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000)
  return mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}` : `${mins}m`
}

interface Props { params: { id: string } }

export default function EventDetailPage({ params }: Props) {
  const [event, setEvent]     = useState<Event | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const { id } = params
    Promise.all([
      eventsService.get(id).catch(() => null),
      agendaService.listSessions(id, { limit: 100 }).catch(() => ({ data: [] as Session[] })),
      speakersService.list(id, { limit: 100 }).catch(() => ({ data: [] as Speaker[] })),
    ]).then(([ev, sess, spk]) => {
      setEvent(ev)
      setSessions(sess.data)
      setSpeakers(spk.data)
    }).finally(() => setLoading(false))
  }, [params.id])

  const SESSION_COLS: Column<Session>[] = [
    {
      key: 'title',
      header: 'Session',
      render: s => <span className={styles.sessionTitle}>{s.title}</span>,
    },
    {
      key: 'sessionType',
      header: 'Type',
      width: '100px',
      render: s => <span className={styles.sessionType}>{SESSION_TYPE_LABEL[s.sessionType]}</span>,
    },
    {
      key: 'startAt',
      header: 'Time',
      width: '155px',
      render: s => <span className={styles.time}>{fmtDate(s.startAt)} · {fmtTime(s.startAt)}</span>,
    },
    {
      key: 'endAt',
      header: 'Dur.',
      width: '72px',
      render: s => <span className={styles.mono}>{duration(s.startAt, s.endAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: s => <Badge color={SESSION_STATUS_COLOR[s.status]}>{s.status}</Badge>,
    },
  ]

  const SPEAKER_COLS: Column<Speaker>[] = [
    {
      key: 'firstName',
      header: 'Speaker',
      render: s => (
        <div className={styles.speakerCell}>
          <Avatar initials={initials(s.firstName, s.lastName)} color={avatarColor(s.firstName)} size="sm" />
          <div>
            <p className={styles.speakerName}>{s.firstName} {s.lastName}</p>
            {s.email && <p className={styles.speakerEmail}>{s.email}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: s => <Badge color={SPEAKER_STATUS_COLOR[s.status]}>{s.status}</Badge>,
    },
  ]

  return (
    <div className={styles.page}>
      <TopBar
        title={loading ? 'Event Detail' : (event?.name ?? 'Event Not Found')}
        actions={
          <Button variant="ghost" size="sm" as="a" href="/events">
            ← All Events
          </Button>
        }
      />
      <div className={styles.body}>
        {/* Event header */}
        <Card>
          {loading ? (
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Loading…</p>
          ) : event ? (
            <>
              <div className={styles.headerMeta}>
                <span className={styles.eventCode}>{event.code}</span>
                <Badge color={EVENT_STATUS_COLOR[event.status]}>{event.status}</Badge>
              </div>
              <p className={styles.desc}>{event.description}</p>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Start</span>
                  <span className={styles.metaValue}>{fmtDate(event.startAt)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>End</span>
                  <span className={styles.metaValue}>{fmtDate(event.endAt)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Timezone</span>
                  <span className={styles.metaValue}>{event.timezone}</span>
                </div>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--b-md)', fontWeight: 600, margin: 0 }}>
              Event not found.
            </p>
          )}
        </Card>

        {/* Sessions + Speakers */}
        <div className={styles.twoCol}>
          <Card title={`Sessions (${sessions.length})`} flush>
            <DataTable<Session>
              columns={SESSION_COLS}
              rows={sessions}
              loading={loading}
              emptyMessage="No sessions for this event."
            />
          </Card>
          <Card title={`Speakers (${speakers.length})`} flush>
            <DataTable<Speaker>
              columns={SPEAKER_COLS}
              rows={speakers}
              loading={loading}
              emptyMessage="No speakers for this event."
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
