'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, tickets as ticketsByEvent } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  on_sale: 'forest', sold_out: 'brick', draft: 'neutral', paused: 'amber', ended: 'neutral',
}

function fmtAmount(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}
function pct(sold: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((sold / total) * 100)}%`
}

const TH: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border-strong)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '16px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', fontSize: 14 }

export default function TicketingPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const tix = ticketsByEvent[eventId] ?? []

  const totalSold    = tix.reduce((s, t) => s + (t.quantitySold ?? 0), 0)
  const totalCap     = tix.reduce((s, t) => s + (t.quantityTotal ?? 0), 0)
  const totalRevenue = tix.reduce((s, t) => s + (t.quantitySold ?? 0) * (t.priceAmount ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Ticketing" subtitle="Manage ticket types, pricing, and availability" />

      {/* Event + stats bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0, flexWrap: 'wrap' as const }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Event</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}><strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{totalSold}</strong> / {totalCap} sold</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Revenue <strong style={{ color: 'var(--g-dk)', fontFamily: 'var(--font-mono)' }}>{fmtAmount(totalRevenue)}</strong></span>
        </div>
      </div>

      <div style={{ padding: '24px 32px 40px' }}>
        <Card flush>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Ticket Type</th>
                <th style={TH}>Price</th>
                <th style={{ ...TH, textAlign: 'right' }}>Sold</th>
                <th style={{ ...TH, textAlign: 'right' }}>Capacity</th>
                <th style={{ ...TH, textAlign: 'right' }}>Utilization</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tix.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No tickets for this event</td></tr>
              ) : tix.map(t => {
                const sold  = t.quantitySold ?? 0
                const total = t.quantityTotal ?? 0
                const fill  = total > 0 ? (sold / total) : 0
                return (
                  <tr key={t.id}>
                    <td style={TD}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{t.description}</div>
                    </td>
                    <td style={TD}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--g-dk)' }}>{fmtAmount(t.priceAmount ?? 0)}</span>
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>{sold.toLocaleString()}</span>
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-3)' }}>{total.toLocaleString()}</span>
                    </td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: fill > 0.9 ? 'var(--b-dk)' : fill > 0.6 ? 'var(--a-dk)' : 'var(--f-dk)' }}>{pct(sold, total)}</span>
                        <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                          <div style={{ width: `${Math.round(fill * 100)}%`, height: '100%', background: fill > 0.9 ? 'var(--b-md)' : fill > 0.6 ? 'var(--a-md)' : 'var(--f-md)', borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td style={TD}><Badge color={STATUS_COLOR[t.status] ?? 'neutral'}>{t.status.replace('_', ' ')}</Badge></td>
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
