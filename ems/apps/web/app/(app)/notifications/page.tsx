'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { notifications, events } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  delivered: 'forest', sent: 'teal', queued: 'amber', failed: 'brick',
}
const CHANNEL_COLOR: Record<string, BadgeColor> = {
  email: 'indigo', sms: 'teal', push: 'amber', webhook: 'neutral', in_app: 'forest',
}
const TABS = ['All', 'Email', 'SMS', 'Push', 'Webhook', 'In-App']

const eventMap = Object.fromEntries(events.map(e => [e.id, e.name]))

function fmtTime(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 20px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }

export default function NotificationsPage() {
  const [tab, setTab] = useState('All')

  const channelKey = tab === 'In-App' ? 'in_app' : tab.toLowerCase()
  const filtered = notifications.filter(n => tab === 'All' || n.channel === channelKey)

  const delivered = notifications.filter(n => n.status === 'delivered').length
  const failed    = notifications.filter(n => n.status === 'failed').length
  const queued    = notifications.filter(n => n.status === 'queued').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Notifications" subtitle="Transactional messages sent across all channels" />

      {/* Stats bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0, flexWrap: 'wrap' as const }}>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Total <strong style={{ color: 'var(--ink)' }}>{notifications.length}</strong></span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Delivered <strong style={{ color: 'var(--f-dk)' }}>{delivered}</strong></span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Queued <strong style={{ color: 'var(--a-dk)' }}>{queued}</strong></span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Failed <strong style={{ color: 'var(--b-dk)' }}>{failed}</strong></span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '5px 12px', border: '1.5px solid', borderColor: tab === t ? 'var(--i-md)' : 'var(--border)',
              borderRadius: 20, background: tab === t ? 'var(--i-lt)' : 'transparent',
              color: tab === t ? 'var(--i-md)' : 'var(--ink-3)', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 24px 32px' }}>
        <Card flush>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Channel</th>
                <th style={TH}>Template</th>
                <th style={TH}>Subject / Message</th>
                <th style={TH}>Event</th>
                <th style={TH}>Status</th>
                <th style={TH}>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>No notifications</td></tr>
              ) : filtered.map(n => (
                <tr key={n.id}>
                  <td style={TD}><Badge color={CHANNEL_COLOR[n.channel] ?? 'neutral'}>{n.channel}</Badge></td>
                  <td style={TD}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{n.templateKey}</span></td>
                  <td style={{ ...TD, maxWidth: 280 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {n.subject ?? <em style={{ color: 'var(--ink-4)' }}>no subject</em>}
                    </span>
                  </td>
                  <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{n.eventId ? (eventMap[n.eventId] ?? n.eventId) : '—'}</span></td>
                  <td style={TD}><Badge color={STATUS_COLOR[n.status] ?? 'neutral'}>{n.status}</Badge></td>
                  <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtTime(n.sentAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
