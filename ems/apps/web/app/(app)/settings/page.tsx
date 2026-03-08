'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageHeader } from '@/components/ui/PageHeader'
import { tenant, users } from '@/lib/mock-data'
import type { BadgeColor } from '@/components/ui/Badge'

const STATUS_COLOR: Record<string, BadgeColor> = {
  active: 'forest', invited: 'amber', disabled: 'neutral',
}
const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(s: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]
}
function fmtDate(iso: string | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TABS = ['Workspace', 'Team']
const TH: React.CSSProperties = { padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 20px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }

export default function SettingsPage() {
  const [tab, setTab] = useState('Workspace')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: 'var(--off)' }}>
      <PageHeader title="Settings" subtitle="Workspace configuration and team management" />

      <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--white)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--i-md)' : 'transparent'}`,
            background: 'transparent', color: tab === t ? 'var(--i-md)' : 'var(--ink-3)',
            fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tab === 'Workspace' && (
          <Card>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Workspace Details</div>
              {[
                { label: 'Organization Name', value: tenant.name },
                { label: 'Slug', value: tenant.slug, mono: true },
                { label: 'Tenant ID', value: tenant.id, mono: true },
                { label: 'Status', value: tenant.status, badge: true },
                { label: 'Created', value: fmtDate(tenant.createdAt) },
                { label: 'Last Updated', value: fmtDate(tenant.updatedAt) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 160, fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', flexShrink: 0 }}>{row.label}</div>
                  {row.badge
                    ? <Badge color="forest">{row.value}</Badge>
                    : <div style={{ fontSize: 13, color: 'var(--ink)', fontFamily: row.mono ? 'var(--font-mono)' : 'var(--font)' }}>{row.value}</div>
                  }
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'Team' && (
          <Card flush>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Member</th>
                  <th style={TH}>Email</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Last Login</th>
                  <th style={TH}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar initials={u.firstName[0] + u.lastName[0]} color={avatarColor(u.firstName)} size="sm" />
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{u.firstName} {u.lastName}</div>
                      </div>
                    </td>
                    <td style={TD}><span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{u.email}</span></td>
                    <td style={TD}><Badge color={STATUS_COLOR[u.status] ?? 'neutral'}>{u.status}</Badge></td>
                    <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtDate(u.lastLoginAt)}</span></td>
                    <td style={TD}><span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{fmtDate(u.createdAt)}</span></td>
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
