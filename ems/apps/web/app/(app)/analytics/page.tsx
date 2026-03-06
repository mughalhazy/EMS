import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './analytics.module.css'

export const metadata: Metadata = { title: 'Analytics' }

export default function AnalyticsPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Analytics" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Analytics — wiring pending.</p>
      </div>
    </div>
  )
}
