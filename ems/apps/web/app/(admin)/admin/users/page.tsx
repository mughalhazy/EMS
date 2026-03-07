'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DataTable, Column } from '@/components/ui/DataTable'
import { adminService, AdminUser } from '@/services/admin.service'
import { UserStatus } from '@/types/domain'
import styles from './users.module.css'

const STATUS_COLOR: Record<UserStatus, 'forest' | 'amber' | 'neutral'> = {
  active:   'forest',
  invited:  'amber',
  disabled: 'neutral',
}

const AVATAR_COLORS = ['indigo', 'forest', 'amber', 'teal', 'gold', 'brick'] as const
type AvatarColor = typeof AVATAR_COLORS[number]
function avatarColor(name: string): AvatarColor {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}
function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type StatusFilter = 'all' | UserStatus
const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Active',   value: 'active'   },
  { label: 'Invited',  value: 'invited'  },
  { label: 'Disabled', value: 'disabled' },
]

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<AdminUser[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<StatusFilter>('all')
  const [search, setSearch]       = useState('')
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    adminService.listUsers({ limit: 100 })
      .then(r => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? users : users.filter(u => u.status === filter)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.tenantName.toLowerCase().includes(q)
    )
    return list
  }, [users, filter, search])

  async function toggleUser(user: AdminUser) {
    setActioning(user.id)
    try {
      const updated = user.status === 'disabled'
        ? await adminService.enableUser(user.id)
        : await adminService.disableUser(user.id)
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    } finally {
      setActioning(null)
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'firstName',
      header: 'User',
      render: u => (
        <div className={styles.userCell}>
          <Avatar
            initials={initials(u.firstName, u.lastName)}
            color={avatarColor(u.firstName)}
            size="sm"
          />
          <div>
            <p className={styles.userName}>{u.firstName} {u.lastName}</p>
            <p className={styles.userEmail}>{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tenantName',
      header: 'Tenant',
      render: u => <span className={styles.tenant}>{u.tenantName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: u => <Badge color={STATUS_COLOR[u.status]}>{u.status}</Badge>,
    },
    {
      key: 'roles',
      header: 'Roles',
      render: u => u.roles.length
        ? <span className={styles.roles}>{u.roles.join(', ')}</span>
        : <span className={styles.na}>—</span>,
    },
    {
      key: 'lastLoginAt',
      header: 'Last Login',
      width: '140px',
      render: u => <span className={styles.date}>{fmtDate(u.lastLoginAt)}</span>,
    },
    {
      key: 'id',
      header: '',
      width: '100px',
      render: u => (
        <Button
          variant="ghost"
          size="sm"
          loading={actioning === u.id}
          onClick={() => toggleUser(u)}
        >
          {u.status === 'disabled' ? 'Enable' : 'Disable'}
        </Button>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Users</h1>
          <p className={styles.subheading}>All platform users across tenants.</p>
        </div>
        {!loading && (
          <span className={styles.count}>{users.length} user{users.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={[styles.filterBtn, filter === f.value ? styles.active : ''].join(' ')}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Search by name, email, or tenant…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card flush>
        <DataTable<AdminUser>
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyMessage="No users found."
        />
      </Card>
    </div>
  )
}
