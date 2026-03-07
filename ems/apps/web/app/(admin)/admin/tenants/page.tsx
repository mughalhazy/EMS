'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/ui/DataTable'
import { adminService, AdminTenant } from '@/services/admin.service'
import { TenantStatus } from '@/types/domain'
import styles from './tenants.module.css'

const STATUS_COLOR: Record<TenantStatus, 'forest' | 'brick' | 'neutral'> = {
  active:    'forest',
  suspended: 'brick',
  archived:  'neutral',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type StatusFilter = 'all' | TenantStatus
const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Active',    value: 'active'    },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Archived',  value: 'archived'  },
]

export default function AdminTenantsPage() {
  const [tenants, setTenants]     = useState<AdminTenant[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<StatusFilter>('all')
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    adminService.listTenants({ limit: 100 })
      .then(r => setTenants(r.data))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tenants : tenants.filter(t => t.status === filter)
  const active    = tenants.filter(t => t.status === 'active').length
  const suspended = tenants.filter(t => t.status === 'suspended').length

  async function toggleTenant(t: AdminTenant) {
    setActioning(t.id)
    try {
      const updated = t.status === 'active'
        ? await adminService.suspendTenant(t.id)
        : await adminService.activateTenant(t.id)
      setTenants(prev => prev.map(x => x.id === updated.id ? updated : x))
    } finally {
      setActioning(null)
    }
  }

  const columns: Column<AdminTenant>[] = [
    {
      key: 'name',
      header: 'Tenant',
      render: t => (
        <div>
          <p className={styles.tenantName}>{t.name}</p>
          <p className={styles.tenantSlug}>{t.slug}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: t => <Badge color={STATUS_COLOR[t.status]}>{t.status}</Badge>,
    },
    {
      key: 'eventCount',
      header: 'Events',
      width: '80px',
      render: t => <span className={styles.num}>{t.eventCount.toLocaleString()}</span>,
    },
    {
      key: 'userCount',
      header: 'Users',
      width: '80px',
      render: t => <span className={styles.num}>{t.userCount.toLocaleString()}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: '140px',
      render: t => <span className={styles.date}>{fmtDate(t.createdAt)}</span>,
    },
    {
      key: 'id',
      header: '',
      width: '110px',
      render: t => t.status !== 'archived' ? (
        <Button
          variant="ghost"
          size="sm"
          loading={actioning === t.id}
          onClick={() => toggleTenant(t)}
        >
          {t.status === 'active' ? 'Suspend' : 'Activate'}
        </Button>
      ) : null,
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Tenants</h1>
          <p className={styles.subheading}>All platform tenants and their operational status.</p>
        </div>
      </div>

      {/* Stat summary */}
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{loading ? '—' : tenants.length}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={[styles.statValue, styles.statForest].join(' ')}>{loading ? '—' : active}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={[styles.statValue, styles.statBrick].join(' ')}>{loading ? '—' : suspended}</span>
          <span className={styles.statLabel}>Suspended</span>
        </div>
      </div>

      {/* Filters */}
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

      <Card flush>
        <DataTable<AdminTenant>
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyMessage="No tenants found."
        />
      </Card>
    </div>
  )
}
