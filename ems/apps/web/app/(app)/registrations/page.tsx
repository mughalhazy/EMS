'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, registrations as regByEvent, attendees as attByEvent, tickets as tickByEvent } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  confirmed: 'forest', approved: 'forest', pending: 'amber', cancelled: 'brick', waitlisted: 'neutral',
}
const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(s: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TH: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border-strong)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 14 }
const STATUS_TABS = ['All', 'Confirmed', 'Pending', 'Cancelled']

export default function RegistrationsPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const [tab, setTab] = useState('All')

  const allAtts  = attByEvent[eventId] ?? []
  const allTix   = tickByEvent[eventId] ?? []
  const attMap   = Object.fromEntries(allAtts.map(a => [a.id, a]))
  const tickMap  = Object.fromEntries(allTix.map(t => [t.id, t]))
  const allRegs  = regByEvent[eventId] ?? []
  const regs     = allRegs.filter(r => tab === 'All' || r.status.toLowerCase() === tab.toLowerCase())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Registrations" subtitle="Track and manage event registrations" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0, flexWrap: 'wrap' as const }}>
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
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>{regs.length} registration{regs.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ padding: '24px 32px 40px' }}>
        <Card flush>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Attendee</th>
                <th style={TH}>Ticket</th>
                <th style={TH}>Status</th>
                <th style={TH}>Registered</th>
                <th style={TH}>Checked In</th>
              </tr>
            </thead>
            <tbody>
              {regs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No registrations found</td></tr>
              ) : regs.map(reg => {
                const att  = attMap[reg.attendeeId]
                const tick = tickMap[reg.ticketId ?? '']
                if (!att) return null
                return (
                  <tr key={reg.id}>
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar initials={att.firstName[0] + att.lastName[0]} color={avatarColor(att.firstName)} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{att.firstName} {att.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{att.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={TD}><span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{tick?.name ?? '—'}</span></td>
                    <td style={TD}><Badge color={STATUS_COLOR[reg.status] ?? 'neutral'}>{reg.status}</Badge></td>
                    <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{fmtDate(reg.registeredAt)}</span></td>
                    <td style={TD}><span style={{ fontSize: 12, color: reg.checkinAt ? 'var(--f-dk)' : 'var(--ink-4)' }}>{reg.checkinAt ? fmtDate(reg.checkinAt) : '—'}</span></td>
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
