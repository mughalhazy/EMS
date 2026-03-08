'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { events, sessions as allSessions, speakers as allSpeakers, registrations as regByEvent, tickets as tickByEvent } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  live: 'teal', published: 'forest', draft: 'neutral', archived: 'neutral', cancelled: 'brick',
}
const TYPE_COLOR: Record<string, BadgeColor> = {
  keynote: 'indigo', talk: 'teal', workshop: 'amber', panel: 'forest', networking: 'gold',
}
const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(s: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtAmount(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 20px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event    = useMemo(() => events.find(e => e.id === params.id) ?? null, [params.id])
  const sessions = useMemo(() => allSessions.filter(s => s.eventId === params.id).sort((a, b) => a.startAt.localeCompare(b.startAt)), [params.id])
  const speakers = useMemo(() => allSpeakers.filter(s => s.eventId === params.id), [params.id])
  const regs     = useMemo(() => regByEvent[params.id] ?? [], [params.id])
  const tix      = useMemo(() => tickByEvent[params.id] ?? [], [params.id])

  const totalRevenue = tix.reduce((s, t) => s + (t.quantitySold ?? 0) * (t.priceAmount ?? 0), 0)
  const confirmedRegs = regs.filter(r => r.status === 'confirmed' || r.status === 'approved').length

  if (!event) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--ink-3)' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Event not found</div>
        <Link href="/events" style={{ fontSize: 13, color: 'var(--i-md)', textDecoration: 'none' }}>← Back to Events</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader
        title={event.name}
        subtitle={`${event.code} · ${fmtDate(event.startAt)} → ${fmtDate(event.endAt)}`}
      >
        <Badge color={STATUS_COLOR[event.status] ?? 'neutral'}>{event.status}</Badge>
      </PageHeader>

      <div style={{ padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Overview stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Registrations', value: confirmedRegs.toString(), color: 'var(--i-md)', bg: 'var(--i-lt)' },
            { label: 'Speakers',      value: speakers.length.toString(), color: 'var(--t-md)', bg: 'var(--t-lt)' },
            { label: 'Sessions',      value: sessions.length.toString(), color: 'var(--f-md)', bg: 'var(--f-lt)' },
            { label: 'Revenue',       value: fmtAmount(totalRevenue),    color: 'var(--g-dk)', bg: 'var(--g-lt)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px 18px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {event.description && (
          <Card>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>About</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{event.description}</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 24, fontSize: 12, color: 'var(--ink-3)' }}>
                <span>Timezone: <strong style={{ color: 'var(--ink)' }}>{event.timezone}</strong></span>
                <span>Start: <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{fmtDate(event.startAt)} {fmtTime(event.startAt)}</strong></span>
                <span>End: <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{fmtDate(event.endAt)} {fmtTime(event.endAt)}</strong></span>
              </div>
            </div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Speakers */}
          <Card flush>
            <div style={{ padding: '14px 20px 0', fontSize: 13, fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              Speakers <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>({speakers.length})</span>
            </div>
            {speakers.length === 0 ? (
              <div style={{ padding: '24px 20px', fontSize: 13, color: 'var(--ink-4)', textAlign: 'center' }}>No speakers yet</div>
            ) : speakers.map(sp => (
              <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <Avatar initials={sp.firstName[0] + sp.lastName[0]} color={avatarColor(sp.firstName)} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{sp.firstName} {sp.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.email}</div>
                </div>
                <Badge color={sp.status === 'confirmed' ? 'forest' : sp.status === 'invited' ? 'amber' : 'neutral'}>{sp.status}</Badge>
              </div>
            ))}
          </Card>

          {/* Tickets */}
          <Card flush>
            <div style={{ padding: '14px 20px 0', fontSize: 13, fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              Tickets <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>({tix.length})</span>
            </div>
            {tix.length === 0 ? (
              <div style={{ padding: '24px 20px', fontSize: 13, color: 'var(--ink-4)', textAlign: 'center' }}>No tickets yet</div>
            ) : tix.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{(t.quantitySold ?? 0).toLocaleString()} / {(t.quantityTotal ?? 0).toLocaleString()} sold</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--g-dk)' }}>{fmtAmount(t.priceAmount ?? 0)}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Sessions */}
        <Card flush>
          <div style={{ padding: '14px 20px 0', fontSize: 13, fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
            Sessions <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>({sessions.length})</span>
          </div>
          {sessions.length === 0 ? (
            <div style={{ padding: '24px 20px', fontSize: 13, color: 'var(--ink-4)', textAlign: 'center' }}>No sessions yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Session</th>
                  <th style={TH}>Type</th>
                  <th style={TH}>Start</th>
                  <th style={TH}>End</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td style={TD}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{s.title}</div>
                      {s.abstract && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.abstract}</div>}
                    </td>
                    <td style={TD}><Badge color={TYPE_COLOR[s.sessionType] ?? 'neutral'}>{s.sessionType}</Badge></td>
                    <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtTime(s.startAt)}</span></td>
                    <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtTime(s.endAt)}</span></td>
                    <td style={{ ...TD, textAlign: 'right' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>{s.capacity?.toLocaleString() ?? '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  )
}
