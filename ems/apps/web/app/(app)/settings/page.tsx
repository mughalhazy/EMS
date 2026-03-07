'use client'

import React, { useEffect, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable, Column } from '@/components/ui/DataTable'
import { tenantService } from '@/services/tenant.service'
import { Tenant, User, UserStatus } from '@/types/domain'
import styles from './settings.module.css'

type Tab = 'account' | 'team'

const STATUS_COLOR: Record<UserStatus, 'forest' | 'amber' | 'neutral'> = {
  active: 'forest', invited: 'amber', disabled: 'neutral',
}
const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
function avatarColor(name: string): typeof AVATAR_COLORS[number] {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SettingsPage() {
  const [tab, setTab]         = useState<Tab>('account')
  const [tenant, setTenant]   = useState<Tenant | null>(null)
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      tenantService.getCurrent().catch(() => null),
      tenantService.listUsers().catch(() => [] as User[]),
    ]).then(([t, u]) => { setTenant(t); setUsers(u) })
      .finally(() => setLoading(false))
  }, [])

  const userColumns: Column<User>[] = [
    {
      key: 'firstName',
      header: 'Member',
      render: u => (
        <div className={styles.memberCell}>
          <Avatar initials={initials(u.firstName, u.lastName)} color={avatarColor(u.firstName)} size="sm" />
          <div>
            <p className={styles.memberName}>{u.firstName} {u.lastName}</p>
            <p className={styles.memberEmail}>{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'status',      header: 'Status',     width: '110px', render: u => <Badge color={STATUS_COLOR[u.status]}>{u.status}</Badge> },
    { key: 'lastLoginAt', header: 'Last Login',  width: '150px', render: u => <span className={styles.mono}>{u.lastLoginAt ? fmtDate(u.lastLoginAt) : '—'}</span> },
    { key: 'createdAt',   header: 'Joined',      width: '140px', render: u => <span className={styles.mono}>{fmtDate(u.createdAt)}</span> },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Settings" />
      <div className={styles.tabs}>
        {(['account', 'team'] as Tab[]).map(t => (
          <button key={t} className={[styles.tab, tab === t ? styles.tabActive : ''].join(' ')} onClick={() => setTab(t)}>
            {t === 'account' ? 'Account' : 'Team'}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {tab === 'account' && (
          <div className={styles.accountGrid}>
            <Card title="Workspace">
              {loading ? <div className={styles.skeleton} /> : tenant ? (
                <div className={styles.detailList}>
                  {([['Name', tenant.name], ['Slug', tenant.slug], ['Status', tenant.status], ['Created', fmtDate(tenant.createdAt)]] as [string,string][]).map(([l, v]) => (
                    <div key={l} className={styles.detailRow}>
                      <span className={styles.detailLabel}>{l}</span>
                      <span className={styles.detailValue}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : <p className={styles.empty}>Unable to load workspace info.</p>}
            </Card>
            <Card title="Platform">
              <div className={styles.detailList}>
                {([['Version', '1.0.0'], ['Region', 'us-west-2'], ['API', process.env.NEXT_PUBLIC_API_URL ?? 'localhost:3001']] as [string,string][]).map(([l, v]) => (
                  <div key={l} className={styles.detailRow}>
                    <span className={styles.detailLabel}>{l}</span>
                    <span className={styles.detailValue}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
        {tab === 'team' && (
          <Card flush>
            <DataTable<User> columns={userColumns} rows={users} loading={loading} emptyMessage="No team members found." />
          </Card>
        )}
      </div>
    </div>
  )
}
