'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { eventsService } from '@/services/events.service'
import { attendeesService } from '@/services/attendees.service'
import { Event, Attendee, AttendeeStatus } from '@/types/domain'
import styles from './networking.module.css'

const STATUS_COLOR: Record<AttendeeStatus, 'forest' | 'indigo' | 'teal' | 'neutral'> = {
  prospect:   'neutral',
  registered: 'indigo',
  checked_in: 'forest',
  cancelled:  'neutral',
}

const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
type AvatarColor = typeof AVATAR_COLORS[number]
function avatarColor(name: string): AvatarColor {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function AttendeeCard({ attendee }: { attendee: Attendee }) {
  const displayName = attendee.badgeName || `${attendee.firstName} ${attendee.lastName}`
  return (
    <div className={styles.card}>
      <Avatar
        initials={initials(attendee.firstName, attendee.lastName)}
        color={avatarColor(attendee.firstName)}
        size="lg"
      />
      <div className={styles.cardInfo}>
        <p className={styles.cardName}>{displayName}</p>
        <p className={styles.cardEmail}>{attendee.email}</p>
        {attendee.status === 'checked_in' && (
          <Badge color="forest">Checked in</Badge>
        )}
        {attendee.status === 'registered' && (
          <Badge color="indigo">Registered</Badge>
        )}
      </div>
    </div>
  )
}

export default function NetworkingPage() {
  const [events, setEvents]         = useState<Event[]>([])
  const [eventId, setEventId]       = useState('')
  const [attendees, setAttendees]   = useState<Attendee[]>([])
  const [search, setSearch]         = useState('')
  const [loadingEvents, setLoadingEvents]     = useState(true)
  const [loadingAttendees, setLoadingAttendees] = useState(false)

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
    setLoadingAttendees(true)
    attendeesService.list(eventId, { limit: 100 })
      .then(r => setAttendees(r.data))
      .catch(() => setAttendees([]))
      .finally(() => setLoadingAttendees(false))
  }, [eventId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return attendees
    return attendees.filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.badgeName ?? '').toLowerCase().includes(q)
    )
  }, [attendees, search])

  // Group alphabetically by last name initial
  const grouped = useMemo(() => {
    const map = new Map<string, Attendee[]>()
    const sorted = [...filtered].sort((a, b) => a.lastName.localeCompare(b.lastName))
    for (const att of sorted) {
      const key = att.lastName[0]?.toUpperCase() ?? '#'
      const arr = map.get(key) ?? []
      arr.push(att)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Networking</h1>
          <p className={styles.subheading}>Connect with fellow attendees at this event.</p>
        </div>
        {attendees.length > 0 && (
          <span className={styles.count}>{attendees.length} attendee{attendees.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.selectorRow}>
          <label htmlFor="net-event" className={styles.selectorLabel}>Event</label>
          <select
            id="net-event"
            className={styles.select}
            value={eventId}
            onChange={e => setEventId(e.target.value)}
            disabled={loadingEvents}
          >
            {loadingEvents
              ? <option>Loading…</option>
              : events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)
            }
          </select>
        </div>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Search attendees…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory */}
      {loadingAttendees ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{search ? 'No matches' : 'No attendees yet'}</p>
          <p className={styles.emptyDesc}>{search ? 'Try a different name or email.' : 'Attendees will appear here once registered.'}</p>
        </div>
      ) : (
        <div className={styles.directory}>
          {grouped.map(([letter, group]) => (
            <div key={letter} className={styles.section}>
              <div className={styles.sectionLetter}>{letter}</div>
              <div className={styles.sectionGrid}>
                {group.map(a => <AttendeeCard key={a.id} attendee={a} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
