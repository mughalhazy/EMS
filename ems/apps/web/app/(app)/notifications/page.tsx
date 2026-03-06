import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './notifications.module.css'

export const metadata: Metadata = { title: 'Notifications' }

export default function NotificationsPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Notifications" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Notifications — wiring pending.</p>
      </div>
    </div>
  )
}
