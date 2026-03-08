'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, sessions as allSessions } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const TYPE_COLOR: Record<string, BadgeColor> = {
  keynote: 'indigo', talk: 'teal', workshop: 'amber', panel: 'forest', networking: 'gold', break: 'neutral',
}

function isoDay(iso: string) { return new Date(iso).toISOString().slice(0, 10) }
function fmtDay(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function durMin(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
}

export default function AgendaPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')

  const sessions = useMemo(() => allSessions.filter(s => s.eventId === eventId), [eventId])
  const days = useMemo(() => [...new Set(sessions.map(s => isoDay(s.startAt)))].sort(), [sessions])
  const [activeDay, setActiveDay] = useState(() => days[0] ?? '')

  // Update activeDay when event changes
  const currentDay = days.includes(activeDay) ? activeDay : (days[0] ?? '')

  const daySessions = sessions
    .filter(s => isoDay(s.startAt) === currentDay)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Agenda" subtitle="Event schedule and session management" />

      {/* Event selector + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0, flexWrap: 'wrap' as const }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Event</span>
        <select value={eventId} onChange={e => { setEventId(e.target.value); setActiveDay('') }} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 'auto' }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} across {days.length} day{days.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Day tabs */}
      {days.length > 0 && (
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0 }}>
          {days.map(d => (
            <button key={d} onClick={() => setActiveDay(d)} style={{
              padding: '10px 16px', border: 'none', borderBottom: `2px solid ${currentDay === d ? 'var(--i-md)' : 'transparent'}`,
              background: 'transparent', color: currentDay === d ? 'var(--i-md)' : 'var(--ink-3)',
              fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>{fmtDay(d)}</button>
          ))}
        </div>
      )}

      <div style={{ padding: '16px 24px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.length === 0 ? (
          <Card>
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No sessions for this event</div>
          </Card>
        ) : daySessions.length === 0 ? (
          <Card>
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No sessions on this day</div>
          </Card>
        ) : daySessions.map(s => {
          const dur = durMin(s.startAt, s.endAt)
          return (
            <div key={s.id} style={{
              display: 'flex', gap: 16, background: 'var(--white)', border: '1.5px solid var(--border)',
              borderRadius: 12, padding: '14px 18px', boxShadow: 'var(--shadow-sm)',
              borderLeft: `4px solid var(--${TYPE_COLOR[s.sessionType] === 'indigo' ? 'i' : TYPE_COLOR[s.sessionType] === 'teal' ? 't' : TYPE_COLOR[s.sessionType] === 'amber' ? 'a' : TYPE_COLOR[s.sessionType] === 'forest' ? 'f' : 'g'}-md)`,
            }}>
              {/* Time column */}
              <div style={{ minWidth: 90, flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>{fmtTime(s.startAt)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{fmtTime(s.endAt)}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{dur} min</div>
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', lineHeight: 1.3, flex: 1 }}>{s.title}</div>
                  <Badge color={TYPE_COLOR[s.sessionType] ?? 'neutral'}>{s.sessionType}</Badge>
                </div>
                {s.abstract && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>{s.abstract}</div>
                )}
              </div>
              {/* Meta */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Cap {s.capacity?.toLocaleString()}</div>
                {s.status !== 'scheduled' && (
                  <div style={{ marginTop: 4, fontSize: 11, color: 'var(--a-dk)', fontWeight: 600 }}>{s.status}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
