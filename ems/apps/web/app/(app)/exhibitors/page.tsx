'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, exhibitors as exhibitorsByEvent, organizations } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  confirmed: 'forest', invited: 'amber', cancelled: 'brick', prospect: 'neutral',
}
const orgMap = Object.fromEntries(organizations.map(o => [o.id, o]))

const TH: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border-strong)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 14 }

export default function ExhibitorsPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const exhibitors = exhibitorsByEvent[eventId] ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Exhibitors" subtitle="Manage booth assignments and exhibitor status" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Event</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>{exhibitors.length} exhibitor{exhibitors.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ padding: '24px 32px 40px' }}>
        <Card flush>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Organization</th>
                <th style={TH}>Booth Code</th>
                <th style={TH}>Booth Size</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {exhibitors.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No exhibitors for this event</td></tr>
              ) : exhibitors.map(ex => {
                const org = orgMap[ex.organizationId]
                return (
                  <tr key={ex.id}>
                    <td style={TD}><div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{org?.name ?? ex.organizationId}</div></td>
                    <td style={TD}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--i-dk)' }}>{ex.boothCode}</span></td>
                    <td style={TD}><span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{ex.boothSize}</span></td>
                    <td style={TD}><Badge color={STATUS_COLOR[ex.status] ?? 'neutral'}>{ex.status}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
