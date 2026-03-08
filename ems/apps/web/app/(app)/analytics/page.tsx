'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, eventKpis, revenueSummary, funnelMetrics, attendanceTrend } from '@/lib/mock-data'

function fmtAmount(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}
function fmtPct(n: number) {
  return `${Math.round(n * 100)}%`
}
function fmtNum(n: number) {
  return n.toLocaleString()
}

const KPI_DEFS = [
  { key: 'totalRegistrations', label: 'Registrations',      fmt: (v: number) => fmtNum(v),    color: 'var(--i-md)',  bg: 'var(--i-lt)' },
  { key: 'totalAttendees',     label: 'Attendees',           fmt: (v: number) => fmtNum(v),    color: 'var(--t-md)',  bg: 'var(--t-lt)' },
  { key: 'checkedInCount',     label: 'Checked In',          fmt: (v: number) => fmtNum(v),    color: 'var(--f-md)',  bg: 'var(--f-lt)' },
  { key: 'totalRevenue',       label: 'Revenue',             fmt: (v: number) => fmtAmount(v), color: 'var(--g-dk)',  bg: 'var(--g-lt)' },
  { key: 'conversionRate',     label: 'Conversion Rate',     fmt: (v: number) => fmtPct(v),    color: 'var(--a-dk)',  bg: 'var(--a-lt)' },
  { key: 'avgOrderValue',      label: 'Avg Order Value',     fmt: (v: number) => fmtAmount(v), color: 'var(--g-dk)',  bg: 'var(--g-lt)' },
]

export default function AnalyticsPage() {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')

  const kpis    = eventKpis[eventId]    ?? {}
  const revenue = revenueSummary[eventId] ?? { byTicketType: [], totalRevenue: 0 }
  const funnel  = funnelMetrics[eventId]  ?? { byStep: [], pageViews: 0, checkoutCompletions: 0, abandonmentRate: 0, conversionRate: 0 }
  const trend   = attendanceTrend[eventId] ?? { byDay: [] }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Analytics" subtitle="Event performance metrics and revenue insights" />

      {/* Event selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>Event</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
      </div>

      <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {KPI_DEFS.map(d => {
            const val = (kpis as Record<string, number>)[d.key] ?? 0
            return (
              <div key={d.key} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>{d.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: d.color, fontFamily: 'var(--font-mono)' }}>{d.fmt(val)}</div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Revenue by ticket type */}
          <Card>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Revenue by Ticket Type</div>
              {revenue.byTicketType.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-4)', padding: '16px 0' }}>No revenue data</div>
              ) : revenue.byTicketType.map((r, i) => {
                const frac = revenue.totalRevenue > 0 ? r.revenue / revenue.totalRevenue : 0
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{r.ticketName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--g-dk)' }}>{fmtAmount(r.revenue)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                        <div style={{ width: `${Math.round(frac * 100)}%`, height: '100%', background: 'var(--g-md)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)', width: 36, textAlign: 'right' }}>{fmtPct(frac)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{r.count.toLocaleString()} tickets</div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Checkout funnel */}
          <Card>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Checkout Funnel</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                <div style={{ padding: '12px', background: 'var(--i-lt)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--i-md)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Page Views</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--i-dk)' }}>{fmtNum(funnel.pageViews)}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--f-lt)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--f-md)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Completed</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--f-dk)' }}>{fmtNum(funnel.checkoutCompletions)}</div>
                </div>
              </div>
              {funnel.byStep.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-4)', padding: '16px 0' }}>No funnel data</div>
              ) : funnel.byStep.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{step.step}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{fmtNum(step.count)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--b-dk)' }}>↓ {fmtPct(step.dropOffRate)} drop-off</div>
                </div>
              ))}
              <div style={{ marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-3)' }}>Abandonment Rate</span>
                <span style={{ fontWeight: 700, color: 'var(--b-dk)', fontFamily: 'var(--font-mono)' }}>{fmtPct(funnel.abandonmentRate)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Registration trend table */}
        {trend.byDay.length > 0 && (
          <Card flush>
            <div style={{ padding: '14px 20px 0', fontSize: 13, fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Registration Trend</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>Date</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>Registrations</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>Check-ins</th>
                </tr>
              </thead>
              <tbody>
                {trend.byDay.map((d, i) => (
                  <tr key={i}>
                    <td style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--i-dk)' }}>{d.registrations > 0 ? fmtNum(d.registrations) : '—'}</td>
                    <td style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--f-dk)' }}>{d.checkins > 0 ? fmtNum(d.checkins) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}
