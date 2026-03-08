'use client'

import { useEffect, useState } from 'react'
import { RenderedPage } from '@/renderer'
import wireframe from '@/renderer/samples/notifications.wireframe.json'
import { notificationsService } from '@/services/notifications.service'
import { Notification } from '@/types/domain'
import styles from './notifications.module.css'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsService.list({ limit: 100 })
      .then(r => setNotifications(r.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <RenderedPage
        wireframe={wireframe}
        data={{ notifications, loading }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
    </div>
  )
}
