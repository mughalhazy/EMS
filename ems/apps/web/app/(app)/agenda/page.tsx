'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { eventsService } from '@/services/events.service'
import { agendaService } from '@/services/agenda.service'
import { Event, Session, SessionType } from '@/types/domain'
import styles from './agenda.module.css'

const TYPE_COLOR: Record<SessionType, { bg: string; bar: string; text: string }> = {
  keynote:    { bg: 'var(--i-lt)', bar: 'var(--i-md)', text: 'var(--i-dk)' },
  talk:       { bg: 'var(--f-lt)', bar: 'var(--f-md)', text: 'var(--f-dk)' },
  panel:      { bg: 'var(--g-lt)', bar: 'var(--g-md)', text: 'var(--g-dk)' },
  workshop:   { bg: 'var(--t-lt)', bar: 'var(--t-md)', text: 'var(--t-dk)' },
  networking: { bg: 'var(--a-lt)', bar: 'var(--a-md)', text: 'var(--a-dk)' },
  other:      { bg: 'var(--surface)', bar: 'var(--border-strong)', text: 'var(--ink-2)' },
}

const TYPE_LABEL: Record<SessionType, string> = {
  keynote: 'Keynote', talk: 'Talk', panel: 'Panel',
  workshop: 'Workshop', networking: 'Networking', other: 'Other',
}

const LEGEND: Array<{ type: SessionType; color: string }> = [
  { type: 'keynote',    color: 'var(--i-md)' },
  { type: 'talk',       color: 'var(--f-md)' },
  { type: 'panel',      color: 'var(--g-md)' },
  { type: 'workshop',   color: 'var(--t-md)' },
  { type: 'networking', color: 'var(--a-md)' },
]

function sessionDay(iso: string) { return iso.slice(0, 10) }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtDayLabel(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export default function AgendaPage() {
  const [events, setEvents]       = useState<Event[]>([])
  const [eventId, setEventId]     = useState('')
  const [sessions, setSessions]   = useState<Session[]>([])
  const [activeDay, setActiveDay] = useState('')
  const [loadingEvents, setLoadingEvents]     = useState(true)
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
      .then(r => {
        setSessions(r.data)
        const days = [...new Set(r.data.map(s => sessionDay(s.startAt)))].sort()
        setActiveDay(days[0] ?? '')
      })
      .catch(() => setSessions([]))
      .finally(() => setLoadingSessions(false))
  }, [eventId])

  const days = useMemo(() =>
    [...new Set(sessions.map(s => sessionDay(s.startAt)))].sort(),
    [sessions]
  )

  const daySessions = useMemo(() =>
    sessions.filter(s => sessionDay(s.startAt) === activeDay),
    [sessions, activeDay]
  )

  // Unique rooms for the active day (preserve insertion order)
  const rooms: string[] = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    daySessions.forEach(s => {
      const r = s.roomId ?? 'general'
      if (!seen.has(r)) { seen.add(r); result.push(r) }
    })
    return result.length > 0 ? result : ['general']
  }, [daySessions])

  const roomLabel = (r: string) =>
    r === 'general' ? 'Main Hall' : `Room ${r.slice(0, 6).toUpperCase()}`

  // Hourly time slots for the active day
  const timeSlots: number[] = useMemo(() => {
    if (daySessions.length === 0) return [9, 10, 11, 12, 13, 14, 15, 16]
    const minH = Math.min(...daySessions.map(s => new Date(s.startAt).getHours()))
    const maxH = Math.max(...daySessions.map(s => new Date(s.endAt).getHours()))
    return Array.from({ length: Math.max(maxH - minH, 1) + 1 }, (_, i) => minH + i)
  }, [daySessions])

  function sessionsAt(hour: number, roomId: string): Session[] {
    return daySessions.filter(s => {
      const h = new Date(s.startAt).getHours()
      const r = s.roomId ?? 'general'
      return h === hour && r === roomId
    })
  }

  // A keynote with no roomId spans all room columns
  function keynoteAt(hour: number): Session | undefined {
    return daySessions.find(s =>
      new Date(s.startAt).getHours() === hour &&
      !s.roomId &&
      s.sessionType === 'keynote'
    )
  }

  const gridCols = rooms.length

  return (
    <div className={styles.page}>
      <TopBar title="Agenda" />

      {/* Toolbar: event selector + day tabs + actions */}
      <div className={styles.toolbar}>
        <div className={styles.selectorRow}>
          <span className={styles.selectorLabel}>Event</span>
          <select
            className={styles.select}
            value={eventId}
            onChange={e => { setEventId(e.target.value); setActiveDay('') }}
            disabled={loadingEvents}
          >
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>

        <div className={styles.dayTabs}>
          {days.map((d, i) => (
            <button
              key={d}
              className={[styles.dayTab, activeDay === d ? styles.dayActive : ''].join(' ')}
              onClick={() => setActiveDay(d)}
            >
              Day {i + 1} — {fmtDayLabel(d)}
            </button>
          ))}
        </div>

        <div className={styles.topbarActions}>
          <button className={styles.actionBtn}>Publish Agenda</button>
          <button className={styles.actionBtnPrimary}>+ Add Session</button>
        </div>
      </div>

      {/* Filter bar: track legend */}
      <div className={styles.filterBar}>
        <div className={styles.legend}>
          {LEGEND.map(l => (
            <div key={l.type} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: l.color }} />
              {TYPE_LABEL[l.type]}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule grid */}
      <div className={styles.scheduleWrap}>
        {loadingSessions ? (
          <div className={styles.loadingState}>Loading sessions…</div>
        ) : !activeDay ? (
          <div className={styles.emptyState}>Select an event to view the agenda.</div>
        ) : daySessions.length === 0 ? (
          <div className={styles.emptyState}>No sessions scheduled for this day.</div>
        ) : (
          <div
            className={styles.scheduleGrid}
            style={{ '--room-count': gridCols } as React.CSSProperties}
          >
            {/* Header row */}
            <div className={styles.schedHeader}>Time</div>
            {rooms.map(r => (
              <div key={r} className={[styles.schedHeader, styles.schedHeaderRoom].join(' ')}>
                {roomLabel(r)}
              </div>
            ))}

            {/* Time slot rows */}
            {timeSlots.map(hour => {
              const kn = keynoteAt(hour)
              return (
                <React.Fragment key={hour}>
                  <div className={styles.timeSlot}>
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {kn ? (
                    <div
                      className={styles.schedCellSpan}
                      style={{ gridColumn: `2 / span ${gridCols}` }}
                    >
                      <SessionBlock session={kn} />
                    </div>
                  ) : (
                    rooms.map(roomId => {
                      const sl = sessionsAt(hour, roomId)
                      return (
                        <div
                          key={roomId}
                          className={[styles.schedCell, sl.length === 0 ? styles.schedCellEmpty : ''].join(' ')}
                        >
                          {sl.map(s => <SessionBlock key={s.id} session={s} />)}
                        </div>
                      )
                    })
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionBlock({ session: s }: { session: Session }) {
  const c = TYPE_COLOR[s.sessionType]
  return (
    <div
      className={styles.sessionBlock}
      style={{ background: c.bg, borderLeftColor: c.bar } as React.CSSProperties}
    >
      <div className={styles.sessionTime}>
        {fmtTime(s.startAt)}–{fmtTime(s.endAt)}
      </div>
      <div className={styles.sessionTitle}>{s.title}</div>
      <div className={styles.sessionType} style={{ color: c.text }}>
        {TYPE_LABEL[s.sessionType]}
        {s.capacity ? ` · Cap. ${s.capacity}` : ''}
      </div>
    </div>
  )
}
