'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  events,
  registrations as regByEvent,
  tickets as allTicksByEvent,
  attendees as allAttByEvent,
  speakers,
} from '@/lib/mock-data'
import styles from './events.module.css'

/* ── Event meta — image variant, emoji, tags derived from event name ── */
function getEventMeta(ev: typeof events[0], index: number) {
  const n = ev.name.toLowerCase()
  if (n.includes('design') || n.includes('creative') || n.includes('product'))
    return { emoji: '🎨', imageClass: styles.imageDesign,   tags: ['Design', 'Workshop'] }
  if (n.includes('startup') || n.includes('pitch') || n.includes('networking') || n.includes('mixer'))
    return { emoji: '🚀', imageClass: styles.imageBusiness, tags: ['Business', 'Networking'] }
  if (n.includes('ai') || n.includes('machine learning'))
    return { emoji: '🔬', imageClass: styles.imageTech,     tags: ['Technology', 'Conference'] }
  if (n.includes('analytics') || n.includes('data'))
    return { emoji: '📊', imageClass: styles.imageBusiness, tags: ['Business', 'Workshop'] }
  if (n.includes('tech') || n.includes('summit'))
    return { emoji: '💻', imageClass: styles.imageTech,     tags: ['Technology', 'Conference'] }
  const fallbacks = [
    { emoji: '💻', imageClass: styles.imageTech,     tags: ['Technology', 'Conference'] },
    { emoji: '🎨', imageClass: styles.imageDesign,   tags: ['Design', 'Workshop'] },
    { emoji: '🚀', imageClass: styles.imageBusiness, tags: ['Business', 'Networking'] },
    { emoji: '🎉', imageClass: styles.imageSocial,   tags: ['Social', 'After Hours'] },
  ]
  return fallbacks[index % 4]
}

/* ── Status label + class — maps mock status to HTML's 3 labels ── */
function isSoldOut(eventId: string): boolean {
  const tix = allTicksByEvent[eventId] ?? []
  return tix.length > 0 && tix.every(t => t.quantitySold >= t.quantityTotal)
}
function statusLabel(status: string, soldOut: boolean): string {
  if (soldOut) return 'Sold Out'
  if (status === 'live') return '● Live'
  return 'Upcoming'
}
function statusClass(status: string, soldOut: boolean): string {
  if (soldOut) return styles.statusSoldOut
  if (status === 'live') return styles.statusLive
  return styles.statusUpcoming
}

/* ── Helpers ─────────────────────────────────────────────── */
function getPrice(eventId: string): string {
  const tix = allTicksByEvent[eventId] ?? []
  if (tix.length === 0) return 'Free'
  const min = Math.min(...tix.map(t => t.priceAmount))
  if (min === 0) return 'Free'
  return `$${Math.round(min / 100)}`
}
function isFree(eventId: string): boolean {
  const tix = allTicksByEvent[eventId] ?? []
  return tix.length === 0 || Math.min(...tix.map(t => t.priceAmount)) === 0
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
function fmtRevenue(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

/* ── Category filter ─────────────────────────────────────── */
const FILTER_TABS = ['All Events', 'Conference', 'Workshop', 'Networking', 'Social']

function matchesFilter(ev: typeof events[0], filter: string): boolean {
  if (filter === 'All Events') return true
  const n = ev.name.toLowerCase()
  if (filter === 'Conference')  return n.includes('tech') || n.includes('summit') || n.includes('conference')
  if (filter === 'Workshop')    return n.includes('design') || n.includes('workshop') || n.includes('product')
  if (filter === 'Networking')  return n.includes('startup') || n.includes('pitch') || n.includes('networking')
  if (filter === 'Social')      return n.includes('mixer') || n.includes('social')
  return true
}

/* ── Page ────────────────────────────────────────────────── */
export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All Events')
  const [activeView,   setActiveView]   = useState<'grid' | 'list'>('grid')

  /* Featured = first live event */
  const featuredEvent    = events.find(e => e.status === 'live') ?? events[0]
  const featuredRegs     = (regByEvent[featuredEvent.id] ?? []).length
  const featuredTix      = allTicksByEvent[featuredEvent.id] ?? []
  const featuredRev      = featuredTix.reduce((s, t) => s + (t.priceAmount / 100) * t.quantitySold, 0)
  const featuredCapTotal = featuredTix.reduce((s, t) => s + t.quantityTotal, 0)
  const featuredCapSold  = featuredTix.reduce((s, t) => s + t.quantitySold, 0)
  const featuredCapPct   = featuredCapTotal > 0 ? `${Math.round((featuredCapSold / featuredCapTotal) * 100)}%` : '—'
  const featuredSpkCount = speakers.filter(s => s.eventId === featuredEvent.id).length

  /* Header stats */
  const totalActive = events.filter(e => e.status === 'live' || e.status === 'published').length
  const totalAtts   = Object.values(allAttByEvent).flat().length
  const totalAttsLabel = totalAtts >= 1000 ? `${Math.round(totalAtts / 1000)}K` : String(totalAtts)

  const filtered = useMemo(
    () => events.filter(ev => matchesFilter(ev, activeFilter)),
    [activeFilter],
  )

  return (
    <div className={styles.page}>

      {/* ── Page Header — indigo gradient ── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.headerTitle}>Discover Events</h1>
            <p className={styles.headerSubtitle}>Browse upcoming conferences, workshops, and networking opportunities</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <div className={styles.headerStatValue}>{totalActive}</div>
              <div className={styles.headerStatLabel}>Active Events</div>
            </div>
            <div className={styles.headerStat}>
              <div className={styles.headerStatValue}>{totalAttsLabel}</div>
              <div className={styles.headerStatLabel}>Total Attendees</div>
            </div>
          </div>
        </div>

        {/* Filters bar — inside gradient header */}
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                className={`${styles.filterBtn}${activeFilter === tab ? ` ${styles.filterBtnActive}` : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <input type="text" className={styles.searchInput} placeholder="Search events..." />
        </div>
      </header>

      <div className={styles.content}>

        {/* ── Featured Event ── */}
        <div className={styles.featuredEvent}>
          <div>
            <h2 className={styles.featuredTitle}>{featuredEvent.name}</h2>
            <p className={styles.featuredDesc}>
              {featuredEvent.description ?? 'Join tech leaders, innovators, and entrepreneurs for three days of inspiring talks, hands-on workshops, and networking opportunities.'}
            </p>
            <div className={styles.featuredMeta}>
              <div className={styles.featuredMetaItem}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {fmtDate(featuredEvent.startAt)}
              </div>
              <div className={styles.featuredMetaItem}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Convention Center
              </div>
            </div>
            <button className={styles.btnWhite}>Register Now</button>
          </div>

          <div className={styles.featuredStats}>
            <div className={styles.featuredStat}>
              <div className={styles.featuredStatValue}>{featuredRegs.toLocaleString()}</div>
              <div className={styles.featuredStatLabel}>Registered</div>
            </div>
            <div className={styles.featuredStat}>
              <div className={styles.featuredStatValue}>{fmtRevenue(featuredRev)}</div>
              <div className={styles.featuredStatLabel}>Total Revenue</div>
            </div>
            <div className={styles.featuredStat}>
              <div className={styles.featuredStatValue}>{featuredCapPct}</div>
              <div className={styles.featuredStatLabel}>Capacity</div>
            </div>
            <div className={styles.featuredStat}>
              <div className={styles.featuredStatValue}>{featuredSpkCount}</div>
              <div className={styles.featuredStatLabel}>Speakers</div>
            </div>
          </div>
        </div>

        {/* ── Section Header ── */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Events</h2>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn}${activeView === 'grid' ? ` ${styles.viewBtnActive}` : ''}`}
              onClick={() => setActiveView('grid')}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button
              className={`${styles.viewBtn}${activeView === 'list' ? ` ${styles.viewBtnActive}` : ''}`}
              onClick={() => setActiveView('list')}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Event Grid ── */}
        <div className={styles.eventGrid}>
          {filtered.map((ev, i) => {
            const meta     = getEventMeta(ev, i)
            const regCount = (regByEvent[ev.id] ?? []).length
            const tix      = allTicksByEvent[ev.id] ?? []
            const cap      = tix.reduce((s, t) => s + t.quantityTotal, 0)
            const price    = getPrice(ev.id)
            const free     = isFree(ev.id)
            const soldOut  = isSoldOut(ev.id)
            return (
              <Link key={ev.id} href={`/events/${ev.id}`} className={styles.eventCard}>
                {/* Event image — gradient bg + emoji + status badge */}
                <div className={`${styles.eventImage} ${meta.imageClass}`}>
                  <span>{meta.emoji}</span>
                  <span className={`${styles.eventStatus} ${statusClass(ev.status, soldOut)}`}>
                    {statusLabel(ev.status, soldOut)}
                  </span>
                </div>

                {/* Event body */}
                <div className={styles.eventBody}>
                  <div className={styles.eventDate}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {fmtDate(ev.startAt)}
                  </div>

                  <h3 className={styles.eventTitle}>{ev.name}</h3>

                  <div className={styles.eventLocation}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Convention Center
                  </div>

                  <div className={styles.eventTags}>
                    {meta.tags.map(tag => (
                      <span key={tag} className={styles.eventTag}>{tag}</span>
                    ))}
                  </div>

                  <div className={styles.eventFooter}>
                    <div className={styles.eventAttendees}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      {regCount} / {cap || regCount + 20}
                    </div>
                    <div className={`${styles.eventPrice}${free ? ` ${styles.eventPriceFree}` : ''}`}>
                      {price}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
