'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, registrations as regByEvent, speakers as allSpeakers } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  live: 'teal', published: 'forest', draft: 'neutral', archived: 'neutral', cancelled: 'brick',
}
const TABS = ['All', 'Live', 'Published', 'Draft']

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function EventsPage() {
  const [tab, setTab] = useState('All')
  const filtered = events.filter(ev => tab === 'All' || ev.status.toLowerCase() === tab.toLowerCase())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Events" subtitle={`${events.length} events · ${events.filter(e => e.status === 'live').length} live`}>
        <button style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer' }}>
          + New Event
        </button>
      </PageHeader>

      {/* Status tabs */}
      <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--i-md)' : 'transparent'}`,
            background: 'transparent', color: tab === t ? 'var(--i-md)' : 'var(--ink-3)',
            fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>{t}</button>
        ))}
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 11, color: 'var(--ink-3)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Card grid */}
      <div style={{ padding: '20px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map(ev => {
            const regCount = (regByEvent[ev.id] ?? []).length
            const spkCount = allSpeakers.filter(s => s.eventId === ev.id).length
            const isDraft = ev.status === 'draft'
            return (
              <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: isDraft ? 'var(--surface)' : 'var(--white)',
                  border: `1.5px ${isDraft ? 'dashed' : 'solid'} var(--border)`,
                  borderRadius: 14, padding: 20,
                  display: 'flex', flexDirection: 'column', gap: 12,
                  boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s, transform 0.2s',
                  minHeight: 200,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge color={STATUS_COLOR[ev.status] ?? 'neutral'}>{ev.status}</Badge>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', background: 'var(--surface)', padding: '2px 6px', borderRadius: 4 }}>{ev.code}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isDraft ? 'var(--ink-3)' : 'var(--ink)', lineHeight: 1.3 }}>{ev.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.55, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {ev.description}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                    {fmtDate(ev.startAt)} → {fmtDate(ev.endAt)}
                  </div>
                  <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>{regCount}</strong> registered</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>{spkCount}</strong> speakers</span>
                  </div>
                </div>
              </Link>
            )
          })}
          <div style={{
            background: 'var(--i-lt)', border: '1.5px dashed var(--i-border)', borderRadius: 14, padding: 20, minHeight: 200,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
          }}>
            <div style={{ fontSize: 32, color: 'var(--i-md)', fontWeight: 300, lineHeight: 1 }}>+</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--i-md)' }}>Create new event</div>
          </div>
        </div>
      </div>
    </div>
  )
}
