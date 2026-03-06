import type { Metadata } from 'next'
import { TopBar } from '@/components/nav/TopBar'
import styles from './events.module.css'

export const metadata: Metadata = { title: 'Events' }

export default function EventsPage() {
  return (
    <div className={styles.page}>
      <TopBar title="Events" />
      <div className={styles.content}>
        <p className={styles.placeholder}>Events — wiring pending.</p>
      </div>
    </div>
  )
}
