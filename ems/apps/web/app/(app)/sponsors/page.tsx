'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, sponsors as sponsorsByEvent, organizations } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const TIER_COLOR: Record<string, BadgeColor> = {
  gold: 'gold', silver: 'neutral', bronze: 'neutral', platinum: 'indigo',
}
const STATUS_COLOR: Record<string, BadgeColor> = {
  active: 'forest', prospect: 'amber', inactive: 'neutral', cancelled: 'brick',
}
const orgMap = Object.fromEntries(organizations.map(o => [o.id, o]))

function fmtAmount(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 20px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }

export default function SponsorsPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const sponsors = sponsorsByEvent[eventId] ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Sponsors" subtitle="Manage event sponsors and partnership tiers" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Event</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)' }}>{sponsors.length} sponsor{sponsors.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ padding: '16px 24px 32px' }}>
        <Card flush>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Organization</th>
                <th style={TH}>Tier</th>
                <th style={{ ...TH, textAlign: 'right' }}>Amount</th>
                <th style={TH}>Benefits</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No sponsors for this event</td></tr>
              ) : sponsors.map(sp => {
                const org = orgMap[sp.organizationId]
                const benefits = sp.benefitsJson as Record<string, boolean>
                const benefitList = Object.entries(benefits).filter(([, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1').trim()).join(', ')
                return (
                  <tr key={sp.id}>
                    <td style={TD}><div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{org?.name ?? sp.organizationId}</div></td>
                    <td style={TD}><Badge color={TIER_COLOR[sp.tier] ?? 'neutral'}>{sp.tier}</Badge></td>
                    <td style={{ ...TD, textAlign: 'right' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--g-dk)' }}>{fmtAmount(sp.amount)}</span></td>
                    <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{benefitList || '—'}</span></td>
                    <td style={TD}><Badge color={STATUS_COLOR[sp.status] ?? 'neutral'}>{sp.status}</Badge></td>
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
