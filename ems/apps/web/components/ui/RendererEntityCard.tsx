'use client'

import React from 'react'
import styles from './RendererEntityCard.module.css'

type AnyObj = Record<string, unknown>
type EntityVariant = 'event' | 'detail' | 'info'

interface RendererEntityCardProps {
  /** Injected by data bridge: Event[] (repeating) or single entity object */
  data?: unknown
  variant?: EntityVariant
  /** Card header title (info / detail variants) */
  title?: string
  /** Ordered list of field keys to display (detail variant) */
  fields?: string[]
  /** When true, data is an array — render one card per item */
  repeating?: boolean
}

// ── Helpers ──────────────────────────────────────────────────

function toLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
}

function fmtDate(iso: unknown): string {
  if (!iso || typeof iso !== 'string') return '—'
  try {
    return new Date(iso).toLocaleDateString([], {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return String(iso) }
}

function fmtValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) return fmtDate(val)
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  return String(val)
}

type EventStatus = 'draft' | 'published' | 'live' | 'archived'

const STATUS_CLASS: Record<EventStatus, string> = {
  draft:     styles.statusDraft,
  published: styles.statusPublished,
  live:      styles.statusLive,
  archived:  styles.statusArchived,
}

// ── Event grid (repeating) ────────────────────────────────────

function EventGrid({ events }: { events: AnyObj[] }) {
  if (!events.length) {
    return <div className={styles.emptyGrid}>No events yet.</div>
  }

  return (
    <div className={styles.grid}>
      {events.map((ev, i) => (
        <SingleEventCard key={String(ev.id ?? i)} event={ev} />
      ))}
      <div className={styles.ctaCard}>
        <span className={styles.ctaPlus}>+</span>
        <span className={styles.ctaLabel}>Create new event</span>
      </div>
    </div>
  )
}

// ── Single event card ─────────────────────────────────────────

function SingleEventCard({ event }: { event: AnyObj }) {
  const status   = String(event.status ?? 'draft') as EventStatus
  const name     = String(event.name ?? 'Untitled Event')
  const code     = event.code ? String(event.code) : null
  const startAt  = event.startAt
  const endAt    = event.endAt
  const timezone = event.timezone ? String(event.timezone) : null
  const isDraft  = status === 'draft'
  const statusClass = STATUS_CLASS[status] ?? styles.statusDraft

  return (
    <div className={[styles.eventCard, isDraft ? styles['eventCard--draft'] : ''].filter(Boolean).join(' ')}>
      <div className={styles.cardTop}>
        <span className={styles.eventName}>{name}</span>
        <span className={[styles.statusPill, statusClass].join(' ')}>
          {status}
        </span>
      </div>

      {code && <span className={styles.eventCode}>{code}</span>}

      {(startAt || endAt) && (
        <div className={styles.eventDates}>
          <span>{fmtDate(startAt)}</span>
          {endAt && startAt !== endAt && (
            <>
              <span className={styles.dateSep}>→</span>
              <span>{fmtDate(endAt)}</span>
            </>
          )}
        </div>
      )}

      {timezone && <div className={styles.eventTz}>{timezone}</div>}

      <div className={styles.cardActions}>
        <button className={styles.actionBtn} type="button">View</button>
        <button className={styles.actionBtn} type="button">Edit</button>
      </div>
    </div>
  )
}

// ── Detail / Info card ────────────────────────────────────────

function KvCard({ obj, title, fields }: { obj: AnyObj; title?: string; fields?: string[] }) {
  const displayFields = fields && fields.length > 0
    ? fields.filter(f => f in obj || obj[f] !== undefined)
    : Object.keys(obj).filter(k =>
        !['id', 'tenantId', 'organizationId'].includes(k) &&
        typeof obj[k] !== 'object'
      ).slice(0, 12)

  return (
    <div className={styles.infoWrap}>
      {title && (
        <div className={styles.infoHeader}>
          <p className={styles.infoTitle}>{title}</p>
        </div>
      )}
      {displayFields.length === 0 ? (
        <div className={styles.empty}>No data available.</div>
      ) : (
        <div className={styles.kvList}>
          {displayFields.map(key => (
            <div key={key} className={styles.kvRow}>
              <span className={styles.kvKey}>{toLabel(key)}</span>
              <span className={styles.kvVal}>{fmtValue(obj[key])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export function RendererEntityCard({
  data,
  variant = 'info',
  title,
  fields,
  repeating = false,
}: RendererEntityCardProps) {
  // Repeating event grid
  if (repeating || variant === 'event') {
    const items = Array.isArray(data) ? (data as AnyObj[]) : []
    return <EventGrid events={items} />
  }

  // Single entity object
  const obj = (data && typeof data === 'object' && !Array.isArray(data))
    ? (data as AnyObj)
    : null

  if (variant === 'event' && obj) {
    return <SingleEventCard event={obj} />
  }

  if (obj) {
    return <KvCard obj={obj} title={title} fields={fields} />
  }

  // Loading / null state
  return (
    <div className={styles.infoWrap}>
      {title && (
        <div className={styles.infoHeader}>
          <p className={styles.infoTitle}>{title}</p>
        </div>
      )}
      <div className={styles.empty}>Loading…</div>
    </div>
  )
}
