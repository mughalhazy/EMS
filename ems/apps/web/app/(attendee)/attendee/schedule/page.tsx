'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { eventsService } from '@/services/events.service'
import { agendaService } from '@/services/agenda.service'
import { Event, Session, SessionType } from '@/types/domain'
import styles from './schedule.module.css'

const SESSION_COLOR: Record<SessionType, 'indigo' | 'forest' | 'teal' | 'amber' | 'neutral'> = {
  keynote:    'indigo',
  talk:       'forest',
  panel:      'teal',
  workshop:   'amber',
  networking: 'neutral',
  other:      'neutral',
}

function fmtLongDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function fmtDuration(startAt: string, endAt: string) {
  const mins = Math.round((+new Date(endAt) - +new Date(startAt)) / 60000)
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim() : `${mins}m`
}

function groupByDate(sessions: Session[]): [string, Session[]][] {
  const map = new Map<string, Session[]>()
  const sorted = [...sessions].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
  for (const s of sorted) {
    const key = new Date(s.startAt).toDateString()
    const arr = map.get(key) ?? []
    arr.push(s)
    map.set(key, arr)
  }
  return Array.from(map.entries())
}

export default function SchedulePage() {
  const [events, setEvents]       = useState<Event[]>([])
  const [eventId, setEventId]     = useState('')
  const [sessions, setSessions]   = useState<Session[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(false)

  useEffect(() => {
    eventsService.list({ limit: 100 })
      .then(r => {
        setEvents(r.data)
        if (r.data.length > 0) setEventId(r.data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false))
  }, [])

  useEffect(() => {
    if (!eventId) return
    setLoadingSessions(true)
    agendaService.listSessions(eventId, { limit: 100 })
      .then(r => setSessions(r.data))
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false))
  }, [eventId])

  const grouped = groupByDate(sessions)
  const selectedEvent = events.find(e => e.id === eventId)

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Schedule</h1>
          <p className={styles.subheading}>Full program for the selected event.</p>
        </div>
      </div>

      {/* Event selector */}
      <div className={styles.selectorBar}>
        <label htmlFor="schedule-event" className={styles.selectorLabel}>Event</label>
        <select
          id="schedule-event"
          className={styles.select}
          value={eventId}
          onChange={e => setEventId(e.target.value)}
          disabled={loadingEvents}
        >
          {loadingEvents
            ? <option>Loading events…</option>
            : events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)
          }
        </select>
        {selectedEvent && (
          <Badge color={selectedEvent.status === 'live' ? 'teal' : 'indigo'}>
            {selectedEvent.status}
          </Badge>
        )}
      </div>

      {/* Session timeline */}
      {loadingSessions ? (
        <div className={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No sessions scheduled</p>
          <p className={styles.emptyDesc}>Sessions for this event will appear here once published.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {grouped.map(([dateKey, daySessions]) => (
            <div key={dateKey} className={styles.dayGroup}>
              <div className={styles.dayHeader}>
                <h2 className={styles.dayLabel}>{fmtLongDate(daySessions[0].startAt)}</h2>
                <span className={styles.dayCount}>{daySessions.length} session{daySessions.length !== 1 ? 's' : ''}</span>
              </div>

              <div className={styles.dayItems}>
                {daySessions.map(s => (
                  <div key={s.id} className={styles.sessionCard}>
                    {/* Time gutter */}
                    <div className={styles.timeGutter}>
                      <span className={styles.timeStart}>{fmtTime(s.startAt)}</span>
                      <div className={styles.timeLine} />
                      <span className={styles.timeEnd}>{fmtTime(s.endAt)}</span>
                    </div>

                    {/* Content */}
                    <div className={styles.sessionContent}>
                      <div className={styles.sessionMeta}>
                        <Badge color={SESSION_COLOR[s.sessionType]}>{s.sessionType}</Badge>
                        <span className={styles.duration}>{fmtDuration(s.startAt, s.endAt)}</span>
                        {s.status === 'cancelled' && <Badge color="brick">cancelled</Badge>}
                      </div>
                      <h3 className={styles.sessionTitle}>{s.title}</h3>
                      {s.abstract && <p className={styles.sessionAbstract}>{s.abstract}</p>}
                      {s.capacity && (
                        <span className={styles.capacity}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                            <path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                          </svg>
                          Capacity: {s.capacity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
