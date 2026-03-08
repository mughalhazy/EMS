'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, attendees as attByEvent } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  registered: 'indigo', checked_in: 'forest', prospect: 'amber', cancelled: 'brick',
}
const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(s: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 20px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }
const STATUS_TABS = ['All', 'Registered', 'Checked In', 'Prospect', 'Cancelled']

export default function AttendeesPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const [tab, setTab] = useState('All')

  const allAttendees = attByEvent[eventId] ?? []
  const attendees = allAttendees.filter(a => {
    if (tab === 'All') return true
    const map: Record<string, string> = { 'Checked In': 'checked_in' }
    return a.status === (map[tab] ?? tab.toLowerCase())
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Attendees" subtitle="All registered and checked-in attendees" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0, flexWrap: 'wrap' as const }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Event</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '5px 12px', border: '1.5px solid', borderColor: tab === t ? 'var(--i-md)' : 'var(--border)',
              borderRadius: 20, background: tab === t ? 'var(--i-lt)' : 'transparent',
              color: tab === t ? 'var(--i-md)' : 'var(--ink-3)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>{attendees.length} attendee{attendees.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ padding: '16px 24px 32px' }}>
        <Card flush>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Attendee</th>
                <th style={TH}>Email</th>
                <th style={TH}>Status</th>
                <th style={TH}>Since</th>
              </tr>
            </thead>
            <tbody>
              {attendees.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No attendees found</td></tr>
              ) : attendees.map(at => (
                <tr key={at.id}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar initials={at.firstName[0] + at.lastName[0]} color={avatarColor(at.firstName)} size="sm" />
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{at.firstName} {at.lastName}</div>
                    </div>
                  </td>
                  <td style={TD}><span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{at.email}</span></td>
                  <td style={TD}><Badge color={STATUS_COLOR[at.status] ?? 'neutral'}>{at.status.replace('_', ' ')}</Badge></td>
                  <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtDate(at.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
