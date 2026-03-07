'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/nav/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/ui/DataTable'
import { notificationsService } from '@/services/notifications.service'
import { Notification, NotificationStatus, NotificationChannel } from '@/types/domain'
import styles from './notifications.module.css'

type StatusFilter = NotificationStatus | 'all'

const STATUS_COLOR: Record<NotificationStatus, 'indigo' | 'forest' | 'teal' | 'brick' | 'amber' | 'neutral'> = {
  queued: 'indigo', sent: 'amber', delivered: 'forest', failed: 'brick', bounced: 'brick', suppressed: 'neutral',
}
const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  email: 'Email', sms: 'SMS', push: 'Push', in_app: 'In-App', webhook: 'Webhook',
}
const FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' }, { label: 'Delivered', value: 'delivered' },
  { label: 'Sent', value: 'sent' }, { label: 'Queued', value: 'queued' }, { label: 'Failed', value: 'failed' },
]

function fmtDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter]               = useState<StatusFilter>('all')
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    notificationsService.list({ limit: 100 })
      .then(r => setNotifications(r.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() =>
    filter === 'all' ? notifications : notifications.filter(n => n.status === filter),
    [notifications, filter])

  const columns: Column<Notification>[] = [
    { key: 'channel',     header: 'Channel',  width: '100px', render: n => <span className={styles.channel}>{CHANNEL_LABEL[n.channel]}</span> },
    { key: 'templateKey', header: 'Template',               render: n => <span className={styles.template}>{n.templateKey}</span> },
    { key: 'subject',     header: 'Subject',                render: n => <span className={styles.subject}>{n.subject ?? '—'}</span> },
    { key: 'status',      header: 'Status',   width: '120px', render: n => <Badge color={STATUS_COLOR[n.status]}>{n.status}</Badge> },
    { key: 'sentAt',      header: 'Sent',     width: '170px', render: n => <span className={styles.mono}>{fmtDateTime(n.sentAt)}</span> },
  ]

  return (
    <div className={styles.page}>
      <TopBar title="Notifications" />
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button key={f.value} className={[styles.filterBtn, filter === f.value ? styles.active : ''].join(' ')} onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
        {!loading && <span className={styles.count}>{notifications.length} total</span>}
      </div>
      <div className={styles.content}>
        <Card flush>
          <DataTable<Notification> columns={columns} rows={filtered} loading={loading} emptyMessage="No notifications found." />
        </Card>
      </div>
    </div>
  )
}
