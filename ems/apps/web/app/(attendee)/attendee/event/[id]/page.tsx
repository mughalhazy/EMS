'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { eventsService } from '@/services/events.service'
import { agendaService } from '@/services/agenda.service'
import { speakersService } from '@/services/speakers.service'
import { Event, Session, Speaker, SessionType } from '@/types/domain'
import styles from './event.module.css'

type Tab = 'overview' | 'sessions' | 'speakers'

const SESSION_COLOR: Record<SessionType, 'indigo' | 'forest' | 'teal' | 'amber' | 'neutral'> = {
  keynote:    'indigo',
  talk:       'forest',
  panel:      'teal',
  workshop:   'amber',
  networking: 'neutral',
  other:      'neutral',
}

const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
type AvatarColor = typeof AVATAR_COLORS[number]
function avatarColor(name: string): AvatarColor {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function fmtLongDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function fmtDateRange(a: string, b: string) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  return `${new Date(a).toLocaleDateString('en-US', opts)} \u2013 ${new Date(b).toLocaleDateString('en-US', opts)}`
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

export default function AttendeeEventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab]           = useState<Tab>('overview')
  const [event, setEvent]       = useState<Event | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      eventsService.get(id).catch(() => null),
      agendaService.listSessions(id, { limit: 100 }).catch(() => ({ data: [] as Session[] })),
      speakersService.list(id, { limit: 100 }).catch(() => ({ data: [] as Speaker[] })),
    ]).then(([ev, sess, spk]) => {
      setEvent(ev)
      setSessions(sess.data)
      setSpeakers(spk.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className={styles.loadingShell}>
        <div className={styles.heroSkeleton} />
        <div className={styles.bodySkeleton} />
      </div>
    )
  }

  if (!event) {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundTitle}>Event not found</p>
        <p className={styles.notFoundDesc}>This event may have been removed or you may not have access.</p>
      </div>
    )
  }

  const grouped = groupByDate(sessions)

  const TABS: Tab[] = ['overview', 'sessions', 'speakers']

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBadgeRow}>
          <Badge color={event.status === 'live' ? 'teal' : event.status === 'published' ? 'indigo' : 'neutral'}>
            {event.status}
          </Badge>
          <span className={styles.heroCode}>{event.code}</span>
        </div>
        <h1 className={styles.heroTitle}>{event.name}</h1>
        <p className={styles.heroDesc}>{event.description}</p>
        <div className={styles.heroMeta}>
          <span className={styles.heroMetaItem}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 1v2M10 1v2M1 6h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {fmtDateRange(event.startAt, event.endAt)}
          </span>
          <span className={styles.heroMetaItem}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M7 1c-2.76 0-5 2.24-5 4.5 0 3.75 5 7.5 5 7.5s5-3.75 5-7.5C12 3.24 9.76 1 7 1z" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            {event.timezone}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={[styles.tab, tab === t ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'sessions' && sessions.length > 0 && <span className={styles.tabCount}>{sessions.length}</span>}
            {t === 'speakers' && speakers.length > 0 && <span className={styles.tabCount}>{speakers.length}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className={styles.overviewGrid}>
          <Card title="Event Details">
            <div className={styles.detailList}>
              {[
                ['Dates',    fmtDateRange(event.startAt, event.endAt)],
                ['Timezone', event.timezone],
                ['Code',     event.code],
                ['Sessions', String(sessions.length)],
                ['Speakers', String(speakers.length)],
              ].map(([label, value]) => (
                <div key={label} className={styles.detailRow}>
                  <span className={styles.detailLabel}>{label}</span>
                  <span className={styles.detailValue}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="About">
            <p className={styles.aboutText}>{event.description || 'No description provided.'}</p>
          </Card>
        </div>
      )}

      {/* Sessions */}
      {tab === 'sessions' && (
        <div className={styles.sessionList}>
          {sessions.length === 0 ? (
            <p className={styles.emptyState}>No sessions scheduled yet.</p>
          ) : grouped.map(([dateKey, daySessions]) => (
            <div key={dateKey} className={styles.dayGroup}>
              <h3 className={styles.dayLabel}>{fmtLongDate(daySessions[0].startAt)}</h3>
              <div className={styles.dayItems}>
                {daySessions.map(s => (
                  <div key={s.id} className={styles.sessionCard}>
                    <div className={styles.sessionTime}>
                      <span>{fmtTime(s.startAt)}</span>
                      <span className={styles.timeDash}>\u2013</span>
                      <span>{fmtTime(s.endAt)}</span>
                    </div>
                    <div className={styles.sessionBody}>
                      <div className={styles.sessionTitleRow}>
                        <h4 className={styles.sessionTitle}>{s.title}</h4>
                        <Badge color={SESSION_COLOR[s.sessionType]}>{s.sessionType}</Badge>
                      </div>
                      {s.abstract && <p className={styles.sessionAbstract}>{s.abstract}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Speakers */}
      {tab === 'speakers' && (
        <div className={styles.speakersGrid}>
          {speakers.length === 0 ? (
            <p className={styles.emptyState}>No speakers listed yet.</p>
          ) : speakers.map(sp => (
            <div key={sp.id} className={styles.speakerCard}>
              <Avatar
                initials={`${sp.firstName[0]}${sp.lastName[0]}`}
                color={avatarColor(sp.firstName)}
                size="lg"
              />
              <div className={styles.speakerInfo}>
                <p className={styles.speakerName}>{sp.firstName} {sp.lastName}</p>
                {sp.email && <p className={styles.speakerEmail}>{sp.email}</p>}
                <Badge color={sp.status === 'confirmed' ? 'forest' : sp.status === 'invited' ? 'amber' : 'neutral'}>
                  {sp.status}
                </Badge>
              </div>
              {sp.bio && <p className={styles.speakerBio}>{sp.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
