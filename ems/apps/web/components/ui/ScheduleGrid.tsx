'use client'

import React from 'react'
import type { Session, SessionType } from '@/types/domain'
import styles from './ScheduleGrid.module.css'

interface ScheduleGridProps {
  /** Sessions array — passed directly or via renderer data bridge as `data` */
  sessions?: Session[]
  /** Renderer data bridge alias: injected as `data` when dataKey is set */
  data?: unknown
  activeDay?: string
  /** Called when a session block is clicked */
  onSessionClick?: (session: Session) => void
}

function isoDay(iso: string): string {
  try { return new Date(iso).toISOString().slice(0, 10) } catch { return '' }
}

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) } catch { return '' }
}

function fmtHour(iso: string): string {
  try {
    const d = new Date(iso)
    const h = d.getHours().toString().padStart(2, '0')
    return `${h}:00`
  } catch { return '??' }
}

const SESSION_STYLE_MAP: Record<SessionType, string> = {
  keynote:    styles.keynote,
  talk:       styles.talk,
  panel:      styles.panel,
  workshop:   styles.workshop,
  networking: styles.networking,
  other:      styles.other,
}

const LEGEND_ITEMS: { type: SessionType; label: string; color: string }[] = [
  { type: 'keynote',    label: 'Keynote',    color: 'var(--i-md)' },
  { type: 'talk',       label: 'Talk',       color: 'var(--f-md)' },
  { type: 'panel',      label: 'Panel',      color: 'var(--t-md)' },
  { type: 'workshop',   label: 'Workshop',   color: 'var(--a-md)' },
  { type: 'networking', label: 'Networking', color: 'var(--g-md)' },
  { type: 'other',      label: 'Other',      color: 'var(--border-strong)' },
]

export function ScheduleGrid({ sessions, data, activeDay = '', onSessionClick }: ScheduleGridProps) {
  // Accept sessions via either the `sessions` prop (direct use) or `data` prop (renderer bridge)
  const resolvedSessions: Session[] = Array.isArray(sessions) ? sessions
    : Array.isArray(data) ? (data as Session[])
    : []
  // Filter to active day
  const daySessions = activeDay
    ? resolvedSessions.filter(s => isoDay(s.startAt) === activeDay)
    : resolvedSessions

  if (!daySessions.length) {
    return (
      <div className={styles.empty} role="status">
        {activeDay ? 'No sessions scheduled for this day.' : 'No sessions yet.'}
      </div>
    )
  }

  // Derive unique rooms (use roomId as identifier; fall back to "Main Stage")
  const roomIds = [...new Set(daySessions.map(s => s.roomId ?? '__main__'))].sort()
  const roomCount = roomIds.length

  // Derive sorted hourly slots covering all sessions
  const hourSet = new Set<string>()
  daySessions.forEach(s => hourSet.add(fmtHour(s.startAt)))
  const hours = [...hourSet].sort()

  // Map: hour → roomId → Session[]
  const grid: Record<string, Record<string, Session[]>> = {}
  hours.forEach(h => { grid[h] = {} })
  daySessions.forEach(s => {
    const hour = fmtHour(s.startAt)
    const room = s.roomId ?? '__main__'
    if (!grid[hour]) grid[hour] = {}
    if (!grid[hour][room]) grid[hour][room] = []
    grid[hour][room].push(s)
  })

  return (
    <div className={styles.wrap}>
      {/* Legend */}
      <div className={styles.legend}>
        {LEGEND_ITEMS.map(item => (
          <span key={item.type} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className={styles.grid}
        style={{ '--room-count': roomCount } as React.CSSProperties}
      >
        {/* Header row */}
        <div className={styles.header}>Time</div>
        {roomIds.map(room => (
          <div key={room} className={`${styles.header} ${styles.headerRoom}`}>
            {room === '__main__' ? 'Main Stage' : `Room ${room.slice(-4)}`}
          </div>
        ))}

        {/* Data rows */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className={styles.timeSlot}>{hour}</div>
            {roomIds.map(room => {
              const cellSessions = grid[hour]?.[room] ?? []
              return (
                <div
                  key={room}
                  className={[styles.cell, cellSessions.length === 0 ? styles.cellEmpty : ''].filter(Boolean).join(' ')}
                >
                  {cellSessions.map(s => (
                    <div
                      key={s.id}
                      className={[styles.session, SESSION_STYLE_MAP[s.sessionType] ?? styles.other].join(' ')}
                      onClick={() => onSessionClick?.(s)}
                      role={onSessionClick ? 'button' : undefined}
                      tabIndex={onSessionClick ? 0 : undefined}
                    >
                      <span className={styles.sessionTime}>{fmtTime(s.startAt)}–{fmtTime(s.endAt)}</span>
                      <span className={styles.sessionTitle}>{s.title}</span>
                      <span className={styles.sessionType}>{s.sessionType}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
