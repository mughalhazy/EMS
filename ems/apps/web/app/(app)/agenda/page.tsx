'use client'

import { useState } from 'react'
import styles from './agenda.module.css'

/* ── Types ───────────────────────────────────────────────── */
type Speaker    = { initials: string }
type SessionItem = {
  type:        'keynote' | 'workshop' | 'panel' | 'talk'
  label?:      string   /* display override for badge text */
  duration:    string
  title:       string
  description: string
  speakers:    Speaker[]
  speakerNames:string
  location:    string
}
type BreakBlock   = { kind: 'break';   timeLabel: string; dotVariant: 'break';            icon: string; title: string; note: string }
type SessionBlock = { kind: 'session'; timeLabel: string; dotVariant: 'live' | 'default'; sessions: SessionItem[] }
type TimeBlock    = BreakBlock | SessionBlock

/* ── Static timeline — matches agenda-page.html Day 1 exactly ── */
const TIMELINE: TimeBlock[] = [
  {
    kind: 'break', timeLabel: '8:00 AM', dotVariant: 'break',
    icon: '☕', title: 'Registration & Coffee', note: 'Main Lobby',
  },
  {
    kind: 'session', timeLabel: '9:00 AM', dotVariant: 'live',
    sessions: [{
      type: 'keynote', duration: '60 min',
      title: 'The Future of AI: What\'s Next in 2026',
      description: 'Join us for an inspiring opening keynote exploring the latest breakthroughs in artificial intelligence and their impact on technology, business, and society.',
      speakers: [{ initials: 'DR' }],
      speakerNames: 'Dr. Rachel Martinez',
      location: 'Main Stage',
    }],
  },
  {
    kind: 'break', timeLabel: '10:15 AM', dotVariant: 'break',
    icon: '🥐', title: 'Morning Break', note: 'Networking Lounge & Refreshments',
  },
  {
    kind: 'session', timeLabel: '10:45 AM', dotVariant: 'default',
    sessions: [
      {
        type: 'workshop', duration: '90 min',
        title: 'Building Scalable ML Pipelines',
        description: 'Hands-on workshop covering best practices for designing and deploying production-ready machine learning systems at scale.',
        speakers: [{ initials: 'JC' }, { initials: 'SK' }],
        speakerNames: 'James Chen, Sarah Kim',
        location: 'Innovation Lab',
      },
      {
        type: 'talk', duration: '45 min',
        title: 'Modern DevOps Practices',
        description: 'Explore cutting-edge DevOps methodologies and tools that are transforming software delivery in 2026.',
        speakers: [{ initials: 'MP' }],
        speakerNames: 'Michael Peterson',
        location: 'Developer Zone',
      },
    ],
  },
  {
    kind: 'break', timeLabel: '12:30 PM', dotVariant: 'break',
    icon: '🍽️', title: 'Lunch Break', note: 'Catered Lunch – Grand Ballroom',
  },
  {
    kind: 'session', timeLabel: '1:45 PM', dotVariant: 'default',
    sessions: [{
      type: 'panel', duration: '60 min',
      title: 'The Ethics of AI: A Panel Discussion',
      description: 'Industry leaders discuss the ethical implications of AI technology and the responsibility of tech companies in shaping the future.',
      speakers: [{ initials: 'EW' }, { initials: 'TN' }, { initials: 'AL' }, { initials: '+2' }],
      speakerNames: 'Emily Wu, Tom Nguyen, +3 more',
      location: 'Main Stage',
    }],
  },
  {
    kind: 'break', timeLabel: '3:00 PM', dotVariant: 'break',
    icon: '☕', title: 'Afternoon Break', note: 'Coffee & Networking',
  },
  {
    kind: 'session', timeLabel: '3:30 PM', dotVariant: 'default',
    sessions: [
      {
        type: 'talk', duration: '45 min',
        title: 'Cloud Architecture Patterns',
        description: 'Deep dive into proven cloud architecture patterns for building resilient, scalable applications.',
        speakers: [{ initials: 'LT' }],
        speakerNames: 'Lisa Taylor',
        location: 'Developer Zone',
      },
      {
        type: 'workshop', duration: '90 min',
        title: 'Intro to Quantum Computing',
        description: 'Get started with quantum computing fundamentals and explore real-world applications in this beginner-friendly workshop.',
        speakers: [{ initials: 'DK' }],
        speakerNames: 'Dr. David Kumar',
        location: 'Innovation Lab',
      },
    ],
  },
  {
    kind: 'session', timeLabel: '5:00 PM', dotVariant: 'default',
    sessions: [{
      type: 'keynote', label: 'Closing', duration: '30 min',
      title: 'Day 1 Wrap-up & Networking Reception',
      description: 'Join us for a recap of Day 1 highlights followed by an evening networking reception with drinks and appetizers.',
      speakers: [{ initials: '🎉' }],
      speakerNames: 'All Attendees Welcome',
      location: 'Rooftop Terrace',
    }],
  },
]

/* ── Day tabs ─────────────────────────────────────────────── */
const DAY_TABS = ['Day 1 – March 18', 'Day 2 – March 19', 'Day 3 – March 20']

/* ── Track filters ────────────────────────────────────────── */
const TRACK_FILTERS = ['All Tracks', 'Main Stage', 'Innovation Lab', 'Developer Zone']

/* ── Session type → CSS classes ──────────────────────────── */
function cardClass(type: string): string {
  if (type === 'keynote')  return styles.sessionCardKeynote
  if (type === 'workshop') return styles.sessionCardWorkshop
  if (type === 'panel')    return styles.sessionCardPanel
  return styles.sessionCardTalk
}
function badgeClass(type: string): string {
  if (type === 'keynote')  return styles.sessionTypeKeynote
  if (type === 'workshop') return styles.sessionTypeWorkshop
  if (type === 'panel')    return styles.sessionTypePanel
  return styles.sessionTypeTalk
}

/* ── Page ─────────────────────────────────────────────────── */
export default function AgendaPage() {
  const [activeDay,   setActiveDay]   = useState(0)
  const [activeTrack, setActiveTrack] = useState('All Tracks')

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.headerTitle}>Tech Summit 2026 – Agenda</h1>
            <div className={styles.eventMeta}>
              <div className={styles.eventMetaItem}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                March 18-20, 2026
              </div>
              <div className={styles.eventMetaItem}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Convention Center
              </div>
            </div>
          </div>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            Day 1 Live Now
          </span>
        </div>

        {/* Day Tabs */}
        <div className={styles.dayTabs}>
          {DAY_TABS.map((tab, i) => (
            <button
              key={tab}
              className={`${styles.dayTab}${activeDay === i ? ` ${styles.dayTabActive}` : ''}`}
              onClick={() => setActiveDay(i)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.content}>

        {/* ── Track Filters ── */}
        <div className={styles.trackFilters}>
          {TRACK_FILTERS.map(track => (
            <button
              key={track}
              className={`${styles.trackFilter}${activeTrack === track ? ` ${styles.trackFilterActive}` : ''}`}
              onClick={() => setActiveTrack(track)}
            >
              {track}
            </button>
          ))}
        </div>

        {/* ── Timeline ── */}
        <div className={styles.timeline}>
          {TIMELINE.map((block, bi) => (
            <div key={bi} className={styles.timeBlock}>

              {/* Time marker */}
              <div className={styles.timeMarker}>
                <div className={styles.timeText}>{block.timeLabel}</div>
              </div>

              {/* Time dot */}
              <div className={[
                styles.timeDot,
                block.dotVariant === 'live'  ? styles.timeDotLive  : '',
                block.dotVariant === 'break' ? styles.timeDotBreak : '',
              ].filter(Boolean).join(' ')} />

              {/* Sessions area */}
              <div className={styles.sessions}>
                {block.kind === 'break' ? (
                  <div className={`${styles.sessionCard} ${styles.sessionCardBreak}`}>
                    <div className={styles.breakCard}>
                      <div className={styles.breakIcon}>{block.icon}</div>
                      <div className={styles.breakTitle}>{block.title}</div>
                      <div className={styles.breakNote}>{block.note}</div>
                    </div>
                  </div>
                ) : block.sessions.map((s, si) => (
                  <div key={si} className={`${styles.sessionCard} ${cardClass(s.type)}`}>
                    <div className={styles.sessionHeader}>
                      <span className={`${styles.sessionType} ${badgeClass(s.type)}`}>
                        {s.label ?? s.type}
                      </span>
                      <span className={styles.sessionDuration}>{s.duration}</span>
                    </div>
                    <h3 className={styles.sessionTitle}>{s.title}</h3>
                    <p className={styles.sessionDescription}>{s.description}</p>
                    <div className={styles.sessionFooter}>
                      <div className={styles.sessionSpeakers}>
                        <div className={styles.speakerAvatars}>
                          {s.speakers.map((sp, spi) => (
                            <div key={spi} className={styles.speakerAvatar}>{sp.initials}</div>
                          ))}
                        </div>
                        <div className={styles.speakerNames}>{s.speakerNames}</div>
                      </div>
                      <div className={styles.sessionLocation}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {s.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
