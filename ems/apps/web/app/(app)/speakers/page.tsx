'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, speakers as allSpeakers } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  confirmed: 'forest', invited: 'amber', declined: 'brick', withdrawn: 'neutral',
}
const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(s: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]
}

const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 20px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }

export default function SpeakersPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const speakers = allSpeakers.filter(s => s.eventId === eventId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Speakers" subtitle="Manage confirmed and invited speakers" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Event</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>{speakers.length} speaker{speakers.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ padding: '16px 24px 32px' }}>
        <Card flush>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Speaker</th>
                <th style={TH}>Email</th>
                <th style={TH}>Bio</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {speakers.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No speakers for this event</td></tr>
              ) : speakers.map(sp => (
                <tr key={sp.id}>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar initials={sp.firstName[0] + sp.lastName[0]} color={avatarColor(sp.firstName)} size="sm" />
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{sp.firstName} {sp.lastName}</div>
                    </div>
                  </td>
                  <td style={TD}><span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{sp.email}</span></td>
                  <td style={{ ...TD, maxWidth: 300 }}>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{sp.bio}</span>
                  </td>
                  <td style={TD}><Badge color={STATUS_COLOR[sp.status] ?? 'neutral'}>{sp.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
